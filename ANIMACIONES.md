# Animaciones opcionales

Los únicos cambios en `index.html` son dos enlaces: `css/animations.css` después de `styles.css` y `js/animations.js` después de `main.js`, con `defer`. No se modificaron el HTML de las secciones, el CSS base ni el JavaScript funcional.

## Qué se anima

- **Portada:** se coordinan los tiempos de las entradas originales de título y retrato; las dos firmas aparecen escalonadas. Se mantienen el tamaño, la posición y la superposición actuales.
- **Sobre mí, galería, servicios y contacto:** se reutilizan los revelados, máscaras y observador existentes, unificando duración, curva y stagger. La galería conserva sus filtros y zoom originales.
- **Testimonios y filtros:** entradas sutiles con desplazamiento vertical de 8 px en móvil o 14 px en escritorio. El carrusel conserva su transición original.
- **Mouse:** elevación de 3 px en servicios, zoom de 1,8 % en la foto de Sobre mí y desplazamiento de 2 px en las flechas de enlaces y envío. No se agregan efectos de hover al tacto.
- **Navegación:** entrada de cortina y enlaces escalonados al abrir el menú móvil; pulso suave del enlace activo. Se mantiene el cierre inmediato original, sin alterar el foco ni los clics.
- **Lightbox:** desplazamiento sutil al abrir/cerrar y fundido al cambiar de fotografía, manteniendo los controles, Escape, swipe y retorno del foco.

No se agregó preloader, barra de progreso, contadores ni parallax: introducirían elementos nuevos, cifras inexistentes o movimiento del encuadre aprobado. La cinta continua y el footer mantienen su funcionamiento anterior. No se usa GSAP ni otra dependencia.

## Velocidades y retrasos

Al principio de `css/animations.css`:

```css
:root {
  --vc-ease:cubic-bezier(.22,1,.36,1);
  --vc-reveal:800ms;
  --vc-stagger:80ms;
  --vc-micro:280ms;
}
```

Los revelados duran 800 ms, las máscaras/retrato 960 ms y las interacciones 280–360 ms. `FEATURES`, al principio de `js/animations.js`, permite desactivar familias completas: `hero`, `reveals`, `hover`, `menu`, `lightbox` y `activeLink`.

## Desactivar

- **Un elemento o sección:** agregar `data-motion="off"` a su etiqueta. No cambia su estructura ni su diseño. Detiene las nuevas animaciones de ese elemento y sus descendientes; conserva las que la página ya tenía.
- **Toda la capa nueva temporalmente:** ejecutar `VictoriaMotion.disable()`; reactivar con `VictoriaMotion.enable()`.
- **Quitar la capa nueva permanentemente:** retirar los dos enlaces de `index.html` y, si se desea, borrar `css/animations.css` y `js/animations.js`. La página vuelve al comportamiento anterior, incluidas sus animaciones originales.
- **Reducir absolutamente todo el movimiento, también el original:** activar «Reducir movimiento» en el sistema. La capa escucha cambios en vivo, cancela sus efectos y deja el contenido visible; el CSS original ya contempla esa preferencia.

No se establecen estados ocultos por defecto ni se conserva `will-change`. Los efectos agregados animan sólo `transform`, `opacity` y `clip-path`; al finalizar se eliminan. Sin esta capa, los estilos de reposo, dimensiones, textos, imágenes y distribución siguen siendo los originales.
