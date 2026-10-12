# Nuestra Casa - Registro de horas MEVIR 3

Aplicación web para registrar y corregir las horas de Pablo y Patricia, con Google Sheets como fuente permanente de datos.

## Archivos
- `index.html`: aplicación web.
- `Code.gs`: API de Google Apps Script.
- `sw.js`: caché de la aplicación; se versiona para que los celulares reciban las actualizaciones.

## Datos permanentes y hoja de cálculo
El backend utiliza una hoja llamada `RegistroHoras` como base de datos y `Configuracion` para los parámetros de la meta/deuda. Si la hoja nueva se crea dentro de una planilla que ya tenía `Registros`, intenta migrar automáticamente los registros válidos a `RegistroHoras`. La hoja antigua no se borra.

El backend ya no vacía toda la base al guardar una corrección individual: usa acciones separadas para guardar una jornada, guardar un registro o eliminar un registro. Una jornada guardada muestra únicamente los turnos que fueron marcados y queda bloqueada en el calendario; las correcciones se realizan desde el formulario inferior.

### Activar la versión actualizada de Google Sheets
Los cambios de GitHub no actualizan por sí solos la implementación de Apps Script. Hay que hacer esto una vez:

1. Abrí el proyecto de Apps Script asociado a la URL que usa la app.
2. Reemplazá todo el contenido de su archivo `Code.gs` por la versión de este repositorio y guardá.
3. Abrí **Implementar → Administrar implementaciones**.
4. Editá la implementación de tipo **Aplicación web**, seleccioná **Nueva versión** y volvé a implementar. Mantené la URL /exec existente.
5. Abrí la aplicación. El servicio creará la hoja `RegistroHoras` y `Configuracion` si faltan, e intentará migrar los registros de la hoja anterior `Registros`.
6. En el panel **Conectar planilla** la app mostrará el enlace **Abrir Google Sheets** después de una lectura exitosa.

Si Apps Script fue creado como proyecto independiente y no está vinculado a una planilla, el código crea una nueva planilla llamada **Nuestra Casa - Registro de horas MEVIR 3** y guarda su ID en las propiedades del proyecto para seguir usando siempre la misma base.

## Publicar con GitHub Pages
En GitHub, abrí **Settings → Pages**, elegí **Deploy from a branch**, seleccioná la rama `main` y la carpeta `/(root)`. La dirección de la app es:
https://pablocerrutti.github.io/Registro-Horas-Mevir-3/

## Instalar en el celular
- **Android:** abrir en Chrome y elegir **Instalar aplicación** o **Agregar a pantalla principal**.
- **iPhone:** abrir en Safari, tocar **Compartir** y elegir **Agregar a pantalla de inicio**.

El caché permite abrir la estructura de la app temporalmente, pero no sustituye a Google Sheets. Los datos y los contadores se reconstruyen a partir de los registros leídos desde la planilla al abrir la app.

## Horarios y metas
- Lunes a jueves: mañana 07:00–11:30 (4,5 h) y tarde 13:00–17:30 (4,5 h).
- Viernes: mañana 07:00–11:00 (4 h) y tarde 13:00–16:00 (3 h).
- Total previsto: 43 h semanales por persona (86 h entre ambos).
- Meta mensual compartida: 80 h.
- Deuda inicial compartida: 122 h; solo el excedente por encima de 80 h de cada mes descuenta la deuda.

Importante: compartí la app y la planilla solo con personas de confianza.
