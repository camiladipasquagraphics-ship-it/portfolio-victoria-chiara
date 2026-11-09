# Animaciones con GSAP, ScrollTrigger y Lenis

El sitio sigue siendo HTML, CSS y JavaScript estático: no necesita npm ni compilación. Las dependencias están instaladas localmente y se cargan con `defer` antes de `main.js` y `animations.js`.

## Dependencias

- GSAP 3.13.0: `js/vendor/gsap.min.js`.
- ScrollTrigger 3.13.0: `js/vendor/ScrollTrigger.min.js`.
- Lenis 1.3.11: `js/vendor/lenis.min.js` y `css/lenis.css`.

Distribuciones originales de jsDelivr, con versiones fijas. GSAP y ScrollTrigger conservan sus cabeceras de licencia; Lenis incluye su licencia MIT en `js/vendor/lenis.LICENSE.txt`. No editar archivos minificados para ajustar los efectos.

## Efectos

- Portada: entrada coordinada del título SVG, retrato y firmas.
- Textos: revelados por bloques con opacidad, desplazamiento y entradas escalonadas, conservando las fuentes, los saltos de línea y la accesibilidad.
- Fotografías: máscaras `clip-path` en los marcos existentes, también en los placeholders. Sin cambios en el encuadre ni archivos de imagen.
- ScrollTrigger: revelados una sola vez al entrar en pantalla. En escritorio, desplazamiento suave de 36 px en el título y 18 px en el retrato durante la salida de portada.
- Galería: transiciones FLIP con GSAP después del filtrado. Se completan los revelados antes de medir para evitar transformaciones superpuestas.
- Menú móvil, lightbox y testimonios: entradas y fundidos breves; se conservan controles, foco, Escape y swipe.
- Mouse y teclado: microinteracciones de servicios y flechas.

## Rendimiento y adaptación

Lenis usa el ticker de GSAP y notifica a ScrollTrigger, sin un segundo bucle RAF. El scroll se recalcula tras fuentes, imágenes, filtros, testimonios y cambios de altura. Se respetan las barras fijas al navegar por anclas. El lightbox pausa Lenis y vuelve a habilitarlo al cerrar.

Lenis y el parallax sólo se activan desde 992 px con mouse o trackpad. En pantallas menores o dispositivos táctiles se conserva el scroll nativo, con entradas de 12 px y 550 ms, sin stagger entre tarjetas; en escritorio son de 28 px y 850 ms. No se agregan secciones fijadas, preloader ni elementos gráficos.

Se animan principalmente `transform` y `opacity`, con máscaras únicamente durante las entradas. No se conserva `will-change`. Los listeners, observadores, triggers, tweens y Lenis se limpian al desactivar la capa o abandonar la página. Los revelados ya vistos no se repiten al cambiar de breakpoint.

## Controles y accesibilidad

- `VictoriaMotion.disable()` desactiva y restaura los estilos de la capa.
- `VictoriaMotion.enable()` vuelve a activarla.
- `VictoriaMotion.refresh()` recalcula las posiciones después de cambios externos de contenido.
- `data-motion="off"` en un elemento o sección lo excluye de los efectos nuevos al inicializar.
- `prefers-reduced-motion: reduce` cancela la capa y Lenis, también al cambiar la preferencia en vivo. El CSS original desactiva las animaciones preexistentes.

El contenido permanece visible sin JavaScript. Si GSAP o ScrollTrigger no cargan, `main.js` conserva el revelado original con IntersectionObserver. Si sólo falla Lenis, siguen funcionando GSAP y la navegación nativa. El contenido que recibe foco se revela inmediatamente.

## Ajustes

Modificar las distancias y duraciones en `js/animations.js`; las microinteracciones se controlan mediante `--vc-micro` y `--vc-ease` en `css/animations.css`. `main.js` sólo delega las transiciones del filtrado, los testimonios y la navegación; mantiene la lógica funcional.

Referencias: [GSAP context](https://gsap.com/docs/v3/GSAP/gsap.context()), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [Lenis](https://github.com/darkroomengineering/lenis).
