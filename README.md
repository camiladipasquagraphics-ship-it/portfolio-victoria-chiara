# Victoria Chiara · Portfolio de fotografía

Sitio estático en HTML5, CSS3, JavaScript vanilla y grilla Bootstrap 5. Abrí `index.html` en un navegador. No requiere instalación ni compilación. Bootstrap necesita conexión a Internet; las tipografías se incluyen localmente en `fonts/`. El menú, las animaciones y el lightbox son propios y no requieren JavaScript de Bootstrap.

## Recorrido

Una sola página con navegación fija: presentación → sobre mí → trabajos → cómo trabajo → testimonios → contacto. Los filtros permiten recorrer eventos sin cambiar de página; el lightbox muestra únicamente las fotos de la categoría seleccionada. El menú se pliega por debajo de 992 px.

La barra de navegación queda fija arriba, con fondo negro, textos crema y acentos naranjas. El footer naranja permanece oculto al inicio y aparece fijo abajo al deslizar más de 64 px; al volver arriba se oculta de nuevo. Mientras está oculto, no recibe foco ni interacción. Sus alturas se miden para reservar espacio y evitar que tapen el contenido. En móvil usa un formato compacto con los datos a la izquierda. El footer incluye el ícono de Instagram y el enlace «@vickychiara.ph» en todas las pantallas, que se abre en una pestaña nueva.

## Fotografías

La portada usa `img/portada-victoria.webp`, una copia exacta del archivo proporcionado por la usuaria. La imagen original de la raíz se conserva sin cambios. El título curvo «PORTAFOLIO» sigue siendo texto editable en SVG con la fuente local Pesto Fresco; los textos secundarios usan Indie Flower. La portada se carga directamente, sin depender de `useRealPhotos`.

La portada ocupa la pantalla inicial completa. La foto se superpone al título, desplazada ligeramente hacia abajo y con degradado inferior. Debajo aparecen únicamente «VICTORIA CHIARA» a la izquierda y «TU FUTURA PH» a la derecha, con la misma fuente y tamaño.

Sobre mí conserva su diseño original: imagen a la izquierda y presentación a la derecha, apiladas en celular. El recuadro vertical muestra `img/encuadrar.webp`, la composición Polaroid con clip naranja proporcionada por la usuaria. Se carga directamente y no depende de `useRealPhotos`. El encuadre se ajusta con `object-position` en `.about-photo img`.

Las fotografías restantes tienen su ruta lista en `data-src`, su texto alternativo, sus dimensiones y un comentario HTML con el uso recomendado. Mientras no hay fotos, los fondos neutros conservan la composición sin solicitar archivos inexistentes. Esto evita iconos rotos y errores de recursos ausentes en la consola.

1. Copiá los siguientes archivos a `img/` con exactamente estos nombres (minúsculas).
2. En `js/main.js`, cambiá `useRealPhotos: false` por `useRealPhotos: true`. El script asigna cada ruta `data-src` al `src` de la imagen. Si alguna falta, conserva el placeholder.
3. Ajustá los `alt`, títulos y categorías en `index.html` para describir los trabajos reales. Podés usar `object-position` en CSS para ajustar los encuadres.

| Archivo | Uso | Proporción | Tamaño recomendado |
| --- | --- | --- | --- |
| portada-victoria.webp | Foto de portada proporcionada (ya incluida) | Vertical | Archivo original |
| encuadrar.webp | Polaroid en el recuadro de Sobre mí (ya incluida) | Recuadro 4:5 | Archivo original |
| evento-01.jpg | Bodas · Siempre nosotros | 4:5 | 1200 × 1500 |
| evento-02.jpg | Cumpleaños & XV · Una noche para brillar | 4:3 | 1200 × 900 |
| evento-03.jpg | Sociales · La alegría de encontrarnos | 4:5 | 1200 × 1500 |
| evento-04.jpg | Corporativos · Ideas que conectan | 4:3 | 1200 × 900 |
| evento-05.jpg | Bodas · Todo empieza acá | 4:3 | 1200 × 900 |
| evento-06.jpg | Cumpleaños & XV · Un deseo más | 4:5 | 1200 × 1500 |
| evento-07.jpg | Sociales · Alrededor de la mesa | 4:3 | 1200 × 900 |
| evento-08.jpg | Corporativos · Una visión compartida | 4:5 | 1200 × 1500 |

Optimizá cada foto antes de subirla, preferentemente por debajo de 300–500 KB; podés cambiar las extensiones a WebP actualizando también `data-src`. Las miniaturas se usan en el lightbox, por lo que conviene conservar resolución suficiente. El orden de lectura de la galería es vertical por columnas, coherente con su estructura masonry.

## Identidad y textos

La identidad usa fondo negro `#000000`, títulos naranja `#EC6426` y textos crema `#FDE3CF`. Los títulos y el nombre de Victoria usan **Pesto Fresco en mayúsculas**; los subtítulos, párrafos, leyendas y campos usan **Indie Flower**. Ambos archivos originales están en `fonts/` y se cargan mediante `@font-face`, sin Google Fonts.

Editá `:root` al comienzo de `css/styles.css`: `--background`, `--cream`, `--paper`, `--ink`, `--muted`, `--accent`, `--display`, `--body`, `--gutter` y `--section`. Si cambiás las fuentes, actualizá las declaraciones `@font-face` y las precargas en `index.html`.

Trabajos y Cómo trabajo usan encabezados a todo el ancho, con el subtítulo debajo. Los títulos no llevan puntos finales y los pasos 01, 02 y 03 se muestran en naranja. La presentación personal usa «HOLA! SOY VICTORIA Y ME MUEVE LO REAL». Los párrafos usan `text-wrap: balance` y anchos de lectura en `ch` para repartir las palabras en líneas parejas y evitar finales escalonados; `preventWidows` en `js/main.js` mantiene juntas las últimas dos palabras y se vuelve a aplicar al actualizar testimonios, lightbox y mensajes del formulario, sin modificar lo que escribe el visitante.

La biografía, los nombres de eventos y los servicios son textos propuestos. Los testimonios están marcados como ejemplos: reemplazá los tres en el arreglo `quotes` de `js/main.js` y el testimonio inicial de `index.html`. Al tener testimonios reales y autorizados, quitá sus etiquetas de ejemplo en ambos archivos.

## Formulario y contactos

El formulario valida nombre, tipo de evento y mensaje; la fecha es opcional. No solicita email ni teléfono. Al pulsar «Enviá tu consulta», redirige a WhatsApp al **+54 9 11 2623-2695** con los datos y el mensaje preparados. El visitante revisa y confirma el envío en WhatsApp; la web no envía mensajes automáticamente ni borra los campos.

Para cambiar el destino, editá `CONFIG.whatsappNumber` en `js/main.js` usando el número internacional completo, sólo con dígitos. Las consultas se realizan desde el formulario; la sección de contacto no ofrece enlaces directos de email ni WhatsApp. No necesita Formspree, EmailJS ni claves de API.

WhatsApp ya está configurado con el número indicado. El enlace de Instagram `@vickychiara.ph` se conserva en el footer para seguir a la fotógrafa. Antes de publicar, completá `og:url` y `og:image` con URLs absolutas. Si necesitás información de privacidad sobre el tratamiento de consultas, incorporá el texto correspondiente a tu actividad.

## Revisión manual

Probá a 375, 768, 991, 992 y 1440 px: menú, filtros, lightbox (flechas, Escape, Tab y swipe), carrusel y errores del formulario. Revisá también el ajuste de movimiento reducido del sistema. Las transiciones se desactivan con `prefers-reduced-motion`.
