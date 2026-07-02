<?php

class BC3Parser
{
    private $filepath;
    private $records = [];
    private $hierarchy = [];
    private $concepts = [];
    private $properties = [];

    public function __construct($filepath)
    {
        $this->filepath = $filepath;
    }

    public function parse()
    {
        if (!file_exists($this->filepath)) {
            throw new Exception("File not found");
        }

        $content = file_get_contents($this->filepath);

        // Priority 1: Check if it's already valid UTF-8
        // This handles cases where file was converted but header says ANSI
        if (mb_check_encoding($content, 'UTF-8')) {
            $encoding = 'UTF-8';
        } else {
            // Priority 2: Detect encoding from ~V record
            // Format: ~V|Owner|Date|Generator|Description|Encoding|
            $encoding = 'ISO-8859-1'; // Default fallback

            if (preg_match('/~V\|[^|]*\|[^|]*\|[^|]*\|[^|]*\|([^|]*)\|/', $content, $matches)) {
                $declaredEncoding = strtoupper(trim($matches[1]));
                if ($declaredEncoding === 'ANSI') {
                    $encoding = 'Windows-1252';
                } elseif ($declaredEncoding === 'IBMPC' || $declaredEncoding === 'DOS') {
                    $encoding = 'CP437';
                } elseif ($declaredEncoding === 'ISO') {
                    $encoding = 'ISO-8859-1';
                }
            }
        }

        // Convert to UTF-8 if needed
        if ($encoding !== 'UTF-8') {
            try {
                $content = mb_convert_encoding($content, 'UTF-8', $encoding);
            } catch (ValueError $e) {
                // Fallback if encoding name is invalid or not supported
                $content = mb_convert_encoding($content, 'UTF-8', 'ISO-8859-1');
            }
        }

        // Split by lines. BC3 lines end with CRLF or LF.
        $lines = preg_split("/\\r\\n|\\n|\\r/", $content);

        $currentRecord = '';

        foreach ($lines as $line) {
            $line = trim($line); // Trim whitespace
            if (strlen($line) === 0)
                continue;

            // If line starts with ~, it's a new record
            if ($line[0] === '~') {
                // Process previous record if exists
                if (!empty($currentRecord)) {
                    $this->parseLine($currentRecord);
                }
                // Start new record
                $currentRecord = $line;
            } else {
                // Continuation of previous record
                // Append to current record. separation? 
                // Usually just concatenation if it was split by a wrap. 
                // But if it's splitting fields, we might need to check if we need a delimiter. 
                // In the Sando file: `~D|...` then `|01#...`. The `|` is typically the delimiter.
                // Concatenating directly is usually safe if the file was just wrapped.
                // However, seeing `~D|Parent` then `|Child`, concatenating gives `~D|Parent|Child`. Correct.
                // Seeing `Child` then `\Child`, concatenating gives `Child\Child`. Correct.
                $currentRecord .= $line;
            }
        }

        // Process final record
        if (!empty($currentRecord)) {
            $this->parseLine($currentRecord);
        }

        $this->buildHierarchy();

        return [
            'properties' => $this->properties,
            'concepts' => $this->concepts,
            'root_nodes' => $this->getRootNodes(),
            'original_text' => $content
        ];
    }

    private function parseLine($line)
    {
        // Format is ~TYPE|Field1|Field2|...
        // Note: The delimiter is `|`.

        // Remove the starting ~
        $lineClean = substr($line, 1);
        $parts = explode('|', $lineClean);

        $type = $parts[0];
        array_shift($parts); // Remove type from data parts

        switch ($type) {
            case 'V':
                $this->parseVersion($parts);
                break;
            case 'C':
                $this->parseConcept($parts);
                break;
            case 'D':
                $this->parseDecomposition($parts);
                break;
            case 'M':
                $this->parseMeasurement($line);
                break;
            case 'T':
                $this->parseText($parts);
                break;
        }
    }

    private function parseVersion($parts)
    {
        // ~V|Owner|Format|Generator|Description|Charset|...
        $this->properties['owner'] = $parts[0] ?? '';
        $this->properties['format'] = $parts[1] ?? '';
        $this->properties['generator'] = $parts[2] ?? '';
        $this->properties['description'] = $parts[3] ?? ''; // Often empty or project summary
        $this->properties['charset'] = $parts[4] ?? '';
    }

    private function parseConcept($parts)
    {
        // ~C|Code|Unit|Summary|Price|Date|Type|
        // Code is unique identifier.
        $code = $parts[0] ?? '';
        if (!$code)
            return;

        $priceRaw = $parts[3] ?? '0';
        $price = floatval(str_replace(',', '.', $priceRaw));
        $type = intval($parts[5] ?? 0);

        $this->concepts[$code] = [
            'code' => $code,
            'unit' => $parts[1] ?? '',
            'summary' => $parts[2] ?? '',
            'price' => $price,
            'date' => $parts[4] ?? '', // Concept date
            'type' => $type,
            'children' => [],
            'decomposition' => [], // For ~D
            'description' => '' // For ~T
        ];
    }

    private function parseMeasurement($line)
    {
        // ~M|ParentCode\ChildCode|...|Total|...
        // Data follows in next lines or same line usually? 
        // Based on Sando file:
        // ~M|01.E.SO#\DEH040|1\2\3\1\|87.6|
        // \Edificio 2\1\23.92\\3.00\
        // \Edificio 1\1\5.28\\3.00\|

        // It seems the first line has the header ~M. 
        // The accumalated $currentRecord in parse() should contain the full multiline block.
        // Let's split by '|' first to get the Header.

        // However, the lines are separated by newlines in the raw file, 
        // but my parse loop combines them.
        // The parse() loop simply concatenates. 
        // So `~M|...|...|\Edificio...`

        $parts = explode('|', $line);
        $relation = $parts[1] ?? ''; // Parent\Child

        // Extract Child Code
        $relParts = explode('\\', $relation);
        $childCode = end($relParts); // The last one is the child.

        if (empty($childCode))
            return;

        if (!isset($this->concepts[$childCode])) {
            // If child doesn't exist yet (unlikely if order is correct, but possible), create stub
            $this->concepts[$childCode] = ['code' => $childCode, 'children' => [], 'measurements' => []];
        }

        // The measurements are essentially the rest of the string after the header parts?
        // Or strictly strictly parsed?
        // Let's use the provided content in the `~M` block.
        // The lines starting with `\` are measurements.
        // We can explode by `\` but that splits fields too.
        // The Sando file shows: ...|87.6|\n\Edificio...
        // The multiline usage in parse() just concatenates $line. 
        // So newlines ARE removed effectively if I didn't add a spacer. 
        // Wait, in parse(): `$currentRecord .= $line;` -> this merges `...|` and `\Edificio...` into `...|\Edificio...` 
        // So yes, it's one big string.

        // Fiebdc says ~M records have specific fields. 
        // But the "lines" of measurement are delimited.
        // In the example: `\Edificio 2\1\23.92\\3.00\` 
        // It starts with `\`.

        // Let's extract everything after the standard header fields.
        // Header: Type(M) | Context | ... | Total | 
        // Let's assume the standard parts are pipe-delimited.
        // Part 0: ~M
        // Part 1: Parent\Child
        // Part 2: Properties/indices
        // Part 3: Total Quantity (87.6)
        // Part 4: The lines? Or is it Part 4 is empty and lines follow?

        // In `~M|01.E.SO#\DEH040|1\2\3\1\|87.6|`
        // 0: ~M
        // 1: 01.E.SO#\DEH040
        // 2: 1\2\3\1\
        // 3: 87.6
        // 4: Empty string (end of first line info)
        // Then follows `\Edificio 2...`

        // So if I explode by `|`, the last parts contain the measurements?
        // Actually, the example shows: `...|87.6|\Edificio 2...`
        // So Part 4 is `\Edificio 2\1\23.92\\3.00\\Edificio 1...`

        // Let's tokenize Part 4 by `\` ?
        // `Edificio 2`, `1`, `23.92`, ``, `3.00`, `Edificio 1`...
        // This is risky because labels can contain anything.
        // But usually measurements have specific numerical fields.
        // Format: Label \ Units \ Length \ Width \ Height

        // Let's look at the "Rest" of the string after the 3rd pipe?
        // Let's reconstruct the raw measurements string.
        // The total is at index 3 (0-based) usually?
        // 0:~M, 1:Context, 2:Props, 3:Total.

        // Let's try to extract measurements.
        // We know they start with `\`.

        $measurementsData = array_slice($parts, 4);
        $measurementsString = implode('|', $measurementsData);

        // Fix: The newlines from the file were trimmed in the parse check?
        // `$lines = preg_split`... `$line = trim($line)`.
        // So `\Edificio...` becomes `\Edificio...`.
        // The concatenation `.= $line` means they are joined immediately.
        // `|87.6|` + `\Edificio...` -> `|87.6|\Edificio...`

        // So yes, we explode by `|`.
        // element 0: ~M
        // element 1: ...
        // element 2: ...
        // element 3: 87.6
        // element 4: \Edificio 2\1\23.92\\3.00\\Edificio 1\1\5.28\\3.00\

        if (isset($parts[4])) {
            $rawM = $parts[4];
            // The format is `\Label\Units\L\W\H\` repeated.
            // Explode by `\`?
            // `\Edificio 2\1\23.92\\3.00\`
            // Empty, Label, Units, L, W, H, Label, Units...

            // Wait, `\\3.00\` -> ``, `3.00`, ``.

            $mParts = explode('\\', $rawM);
            $len = count($mParts);

            // Iterate with while to verify strides
            // Start at 1 (skipping initial empty before first \)
            $k = 1;
            while ($k + 4 < $len) {
                // We expect 5 fields: Label, Units, L, W, H
                $label = $mParts[$k];
                $units = $mParts[$k + 1];
                $l = $mParts[$k + 2];
                $w = $mParts[$k + 3];
                $h = $mParts[$k + 4];

                $this->concepts[$childCode]['measurements'][] = [
                    'label' => $label,
                    'units' => $units,
                    'l' => $l,
                    'w' => $w,
                    'h' => $h
                ];

                // Advance by 5
                $k += 5;

                // If we have an empty token between records (due to \\ separator), skip it
                // But be careful: what if the next record's Label IS empty?
                // The separator comes from `\` at end of prev and `\` at start of next.
                // So yes, strictly one empty token. 
                // Is it possible to rely on $k < len?
                if ($k < $len && $mParts[$k] === '') {
                    $k++;
                }
            }
        }
    }

    private function parseDecomposition($parts)
    {
        // ~D|ParentCode|ChildCode\Factor\Type\ChildCode\Factor\Type...|
        // The decomposition is typically a single field containing all children separated by backslashes.
        $parentCode = array_shift($parts);

        if (!isset($this->concepts[$parentCode])) {
            $this->concepts[$parentCode] = ['code' => $parentCode, 'children' => [], 'decomposition' => []];
        }

        // Reconstruct the decomposition string in case unexpected pipes split it, 
        // though standard is one field.
        $decompositionString = implode('|', $parts);

        // Remove trailing backslash AND pipe if present
        $decompositionString = rtrim($decompositionString, '\\|');
        // Also trim leading pipe if happens
        $decompositionString = ltrim($decompositionString, '|');

        $items = explode('\\', $decompositionString);
        $count = count($items);

        // Iterate in chunks. Usually triplets.
        // We increment i by 2 manually + 1 from loop = 3 elements per chunk.
        for ($i = 0; $i < $count; $i++) {
            $childCode = trim($items[$i]);
            if (strlen($childCode) === 0 || $childCode === '|')
                continue;

            // Slot 2: Factor
            $factor1Raw = $items[$i + 1] ?? '';
            // Slot 3: Rendimiento o Tipo
            $factor2Raw = $items[$i + 2] ?? '';

            // Determinar el factor real.
            // Si el segundo campo tiene valor, lo usamos. Si no, si el primer campo tiene valor, lo usamos.
            // Esto da soporte a formatos con dobles barras como mo001\\3.62
            $f1 = ($factor1Raw === '') ? null : floatval(str_replace(',', '.', $factor1Raw));
            $f2 = ($factor2Raw === '') ? null : floatval(str_replace(',', '.', $factor2Raw));
            
            $factor = 1.0;
            if ($f2 !== null) {
                $factor = $f2;
            } elseif ($f1 !== null) {
                $factor = $f1;
            }

            // El tipo de recurso se lee principalmente desde la definición del concepto,
            // pero si no se encuentra, podemos deducirlo por el prefijo del código del elemento hijo.
            $type = 0;
            if (isset($this->concepts[$childCode])) {
                $type = $this->concepts[$childCode]['type'] ?? 0;
            }
            if ($type === 0) {
                $lowerCode = strtolower($childCode);
                if (strpos($lowerCode, 'mo') === 0 || strpos($lowerCode, 'mano') === 0) {
                    $type = 1;
                } elseif (strpos($lowerCode, 'mq') === 0 || strpos($lowerCode, 'maq') === 0) {
                    $type = 2;
                } elseif (strpos($lowerCode, 'mt') === 0 || strpos($lowerCode, 'mat') === 0) {
                    $type = 3;
                }
            }

            // Advance index by 2 (so loop increments by 1 total 3)
            $i += 2;

            $this->concepts[$parentCode]['children'][] = $childCode;
            $this->concepts[$parentCode]['decomposition'][] = [
                'code' => $childCode,
                'factor' => $factor,
                'type' => $type
            ];
        }
    }

    private function parseText($parts)
    {
        // ~T|Code|Text|
        $code = $parts[0] ?? '';
        $text = $parts[1] ?? '';

        if (isset($this->concepts[$code])) {
            $this->concepts[$code]['description'] = $text;
        }
    }

    private function buildHierarchy()
    {
        // First resolve any loose references (e.g. "0" pointing to "0#")
        $this->resolveReferences();

        // Identify root nodes: Concepts that are NOT children of any other concept.
        // Actually, in BC3, typically the first chapters are roots, or they are just unreferenced.
        // Or we can rely on standard structure where Project Root is often the first concept or top-level chapters.
        // Let's find all codes that appear as children.

        $allChildren = [];
        foreach ($this->concepts as $concept) {
            foreach ($concept['children'] as $childCode) {
                $allChildren[$childCode] = true;
            }
        }

        // Mark roots
        foreach ($this->concepts as $code => &$concept) {
            if (!isset($allChildren[$code])) {
                $concept['is_root'] = true;
            } else {
                $concept['is_root'] = false;
            }
        }
    }

    private function resolveReferences()
    {
        foreach ($this->concepts as $parentCode => &$concept) {
            foreach ($concept['children'] as $index => $childCode) {
                if (!isset($this->concepts[$childCode])) {
                    // Start heuristics

                    // 1. Try appending #
                    if (isset($this->concepts[$childCode . '#'])) {
                        $newCode = $childCode . '#';
                        $concept['children'][$index] = $newCode;

                        // Also update the decomposition entry
                        foreach ($concept['decomposition'] as &$decompItem) {
                            if ($decompItem['code'] === $childCode) {
                                $decompItem['code'] = $newCode;
                            }
                        }
                    }
                    // 2. Try removing # (less likely but symmetrical)
                    elseif (substr($childCode, -1) === '#' && isset($this->concepts[rtrim($childCode, '#')])) {
                        $newCode = rtrim($childCode, '#');
                        $concept['children'][$index] = $newCode;

                        foreach ($concept['decomposition'] as &$decompItem) {
                            if ($decompItem['code'] === $childCode) {
                                $decompItem['code'] = $newCode;
                            }
                        }
                    }
                }
            }
        }
    }

    private function getRootNodes()
    {
        $roots = [];
        foreach ($this->concepts as $code => $concept) {
            // Only include structural chapters (ending with #) as root nodes.
            // This filters out orphan items that have no parent.
            if (!empty($concept['is_root']) && substr($code, -1) === '#') {
                $roots[] = $code;
            }
        }
        // If no roots found, fallback to all chapters.
        if (empty($roots) && !empty($this->concepts)) {
            foreach ($this->concepts as $code => $concept) {
                if (substr($code, -1) === '#') {
                    $roots[] = $code;
                }
            }
        }
        return $roots;
    }
}
