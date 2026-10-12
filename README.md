# Nuestra Casa - Registro de horas MEVIR 3

Aplicación web para Pablo y Patricia. Permite marcar turnos, registrar horas parciales, corregir registros y consultar totales semanales, mensuales y la deuda conjunta.

## Archivos
- `index.html`: aplicación web.
- `Code.gs`: backend de Google Apps Script para guardar los registros en Google Sheets.

## Publicar con GitHub Pages
1. Abrí Settings en el repositorio.
2. Entrá en Pages.
3. En Build and deployment elegí Deploy from a branch.
4. Seleccioná la rama `main` y la carpeta `/(root)`, y guardá.
5. La dirección será `https://pablocerrutti.github.io/Registro-Horas-Mevir-3/` cuando finalice la publicación.

## Conectar Google Sheets
1. Creá una planilla nueva en https://sheets.google.com/.
2. En la planilla, abrí Extensiones > Apps Script.
3. Pegá el contenido de `Code.gs` de este repositorio y guardá.
4. Elegí Implementar > Nueva implementación > Aplicación web.
5. Configurá ejecutar como tu cuenta y acceso para cualquier persona; implementá y autorizá.
6. Copiá la URL terminada en `/exec`.
7. En la aplicación, pulsá Conectar planilla, pegá la URL y conectá.

Se crearán automáticamente las hojas `Registros` y `Configuracion`. Sin configurar Google Sheets, la app avisa que los cambios no están guardados permanentemente.

## Horarios
Lunes a jueves: mañana 4,5 h y tarde 3,5 h. Viernes: mañana 4 h y tarde 3 h. Meta mensual compartida: 80 h. Deuda inicial compartida: 122 h.

Importante: el endpoint publicado permite leer y modificar la hoja asociada; compartí la aplicación solo con personas de confianza.