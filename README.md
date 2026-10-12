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

## Instalar en el celular (Android y iPhone)

La aplicación incluye un manifiesto PWA y un service worker. Primero debe estar publicada por HTTPS en GitHub Pages:
`https://pablocerrutti.github.io/Registro-Horas-Mevir-3/`

- **Android (Chrome):** abrí la dirección en Chrome, tocá el menú ⋮ y elegí **Instalar aplicación** o **Agregar a pantalla principal**. Confirmá la instalación.
- **iPhone/iPad (Safari):** abrí la dirección en Safari, tocá **Compartir** y elegí **Agregar a pantalla de inicio**.
- Abrí Nuestra Casa desde el icono instalado. La conexión con Google Sheets sigue siendo necesaria para sincronizar registros entre los dos celulares.

El service worker permite abrir la estructura de la aplicación si se pierde temporalmente la conexión, pero **no guarda ni sincroniza cambios de horas sin conexión**. Los registros deben guardarse en Google Sheets; el caché no sustituye a la planilla.

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
Lunes a jueves: mañana 07:00–11:30 (4,5 h) y tarde 13:00–17:30 (4,5 h). Viernes: mañana 07:00–11:00 (4 h) y tarde 13:00–16:00 (3 h). Total previsto: 43 h semanales por persona (86 h entre ambos si cumplen todos los turnos). Meta mensual compartida: 80 h. Deuda inicial compartida: 122 h; solo se descuenta de la deuda el excedente acumulado por encima de las 80 h trabajadas en cada mes.

Importante: el endpoint publicado permite leer y modificar la hoja asociada; compartí la aplicación solo con personas de confianza.