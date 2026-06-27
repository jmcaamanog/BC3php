# Contribuir a BC3 Viewer

¡Gracias por tu interés en mejorar BC3 Viewer! Este documento explica cómo poner en marcha el proyecto, ejecutarlo y enviar tus cambios.

## Cómo instalar

**Requisitos previos:**
- PHP 7.4 o superior
- Git

```bash
# 1. Clona el repositorio
git clone https://github.com/rafarq/BC3php.git
cd BC3php
```

No hay dependencias adicionales que instalar: el proyecto usa únicamente PHP y archivos estáticos (HTML, CSS, JS).

## Cómo ejecutar

```bash
# Servidor built-in de PHP (recomendado para desarrollo)
php -S localhost:8080
```

Abre `http://localhost:8080` en el navegador. Sube un archivo `.bc3` con el botón de la interfaz para probarlo.

También puedes servir el proyecto desde Apache o nginx apuntando el *document root* a la carpeta del repositorio.

## Cómo pasar los tests

Actualmente el proyecto no tiene suite de tests automatizados. Si añades funcionalidad nueva, se agradece que:

1. Pruebas manualmente con al menos un archivo BC3 real.
2. Incluyas en tu Pull Request una descripción de los casos que has verificado.

Si quieres añadir tests (PHPUnit, Playwright, etc.), abre primero una *issue* para consensuar el enfoque.

## Cómo enviar Pull Requests

1. **Crea una rama** a partir de `main` con un nombre descriptivo:
   ```bash
   git checkout -b fix/codificacion-ansi
   git checkout -b feat/exportar-csv
   ```

2. **Haz commits pequeños y claros.** Usa el imperativo en presente:
   - `fix: corregir lectura de archivos ANSI`
   - `feat: añadir exportación a CSV`

3. **Abre el Pull Request** contra la rama `main` e incluye:
   - Qué problema resuelve o qué mejora aporta.
   - Pasos para reproducir el bug (si aplica).
   - Capturas de pantalla si el cambio afecta a la interfaz.

4. Un mantenedor revisará el PR lo antes posible. Pueden pedirte cambios antes de fusionarlo.

> Para cambios grandes (nueva funcionalidad, refactors significativos), abre antes una *issue* para discutir el enfoque y evitar trabajo duplicado.
