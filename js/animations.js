/*
 * Movimiento opcional, sin dependencias ni modificaciones a main.js.
 * Todo el contenido es visible por defecto: no hay clases de espera ocultas.
 * Web Animations API aplica únicamente transform, opacity y clip-path;
 * cada efecto se elimina al terminar o al activar movimiento reducido.
 */
(() => {
  'use strict';

  // Desactivar aquí una familia de efectos antes de cargar la página.
  const FEATURES = {
    hero:true,
    reveals:true,
    hover:true,
    menu:true,
    lightbox:true,
    activeLink:true,
  };
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 992px)');
  const smallScreen = window.matchMedia('(max-width: 767px)');
  const classes = ['vc-hero', 'vc-reveals', 'vc-hover'];
  const running = new Set();
  const owned = new Map();
  let dispose = [];
  let enabled = false;
  let stopped = false;

  const all = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const allowed = element => element && !element.closest('[data-motion="off"]');
  const ease = () => getComputedStyle(root).getPropertyValue('--vc-ease').trim() || 'cubic-bezier(.22,1,.36,1)';
  function time(name, fallback) {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    const number = parseFloat(value);
    return Number.isFinite(number) ? Math.max(0, number * (value.endsWith('ms') ? 1 : 1000)) : fallback;
  }

  // Sólo cancelar efectos propios, nunca los filtros, el carrusel o el hero originales.
  function cancelFor(element) {
    owned.get(element)?.cancel();
  }
  function play(element, frames, duration, delay = 0) {
    if (!enabled || reduced.matches || !allowed(element) || !element.animate) return;
    cancelFor(element);
    try {
      const animation = element.animate(frames, {
        duration, delay, easing:ease(), fill:'backwards',
      });
      running.add(animation);
      owned.set(element, animation);
      const release = () => {
        running.delete(animation);
        if (owned.get(element) === animation) owned.delete(element);
      };
      animation.onfinish = () => { release(); animation.cancel(); };
      animation.oncancel = release;
    } catch {
      // Sin soporte o ante un error, el estilo original permanece visible.
    }
  }
  function enter(element, index = 0) {
    const distance = smallScreen.matches ? 8 : 14;
    play(element, [
      { opacity:0, transform:`translateY(${distance}px)` },
      { opacity:1, transform:'translateY(0)' },
    ], time('--vc-reveal', 800), index * time('--vc-stagger', 80));
  }
  function listen(target, event, handler, options) {
    if (!target) return;
    target.addEventListener(event, handler, options);
    dispose.push(() => target.removeEventListener(event, handler, options));
  }
  function watch(element, callback, options) {
    if (!element || !window.MutationObserver) return;
    const observer = new MutationObserver(callback);
    observer.observe(element, options);
    dispose.push(() => observer.disconnect());
  }

  function start() {
    if (enabled || stopped || reduced.matches || !Element.prototype.animate) return;
    enabled = true;
    try {
      const revealTime = time('--vc-reveal', 800);
      const micro = time('--vc-micro', 280);
      if (FEATURES.hero && allowed(document.querySelector('.hero-cover'))) {
        root.classList.add('vc-hero');
        // Portada: completar el título y retrato originales con las dos firmas.
        all('.cover-caption p').forEach((element, index) => {
          play(element, [
            { opacity:0, transform:'translateY(10px)' },
            { opacity:1, transform:'translateY(0)' },
          ], revealTime, 360 + index * time('--vc-stagger', 80));
        });
      }
      if (FEATURES.hover) root.classList.add('vc-hover');

      if (FEATURES.reveals) {
        root.classList.add('vc-reveals');
        // Reutilizar los revelados y máscaras existentes; sólo asignar el orden.
        all('.reveal').forEach((element, index) => {
          const previous = element.style.getPropertyValue('--vc-order');
          element.style.setProperty('--vc-order', String(index % 3));
          dispose.push(() => {
            if (previous) element.style.setProperty('--vc-order', previous);
            else element.style.removeProperty('--vc-order');
          });
        });
        // Sólo revelar elementos que NO tienen ya el reveal de main.js.
        // Así las tarjetas, fotos y formulario no reciben dos animaciones iguales.
        if ('IntersectionObserver' in window) {
          const targets = all('.filters, #testimonials-title, .testimonial-slide, .testimonial-controls')
            .filter(element => allowed(element) && !element.closest('.reveal'));
          const observer = new IntersectionObserver(entries => {
            entries.filter(entry => entry.isIntersecting).forEach((entry, index) => {
              observer.unobserve(entry.target);
              enter(entry.target, Math.min(index, 2));
            });
          }, { threshold:.12 });
          targets.forEach(element => observer.observe(element));
          dispose.push(() => observer.disconnect());
        }
        // Si se cambia de testimonio durante su entrada, ceder al carrusel original.
        all('#testimonial-prev, #testimonial-next').forEach(button => {
          listen(button, 'click', () => cancelFor(document.querySelector('.testimonial-slide')), true);
        });
      }

      // Menú móvil: entrada de la cortina y sus enlaces. El cierre y el foco
      // siguen perteneciendo a main.js; no se demora ni intercepta ningún clic.
      const menu = document.querySelector('#menu');
      let menuOpen = menu?.classList.contains('open') || false;
      if (FEATURES.menu) {
        const cancelMenu = () => [menu, ...all('#menu a')].forEach(cancelFor);
        watch(menu, () => {
          const open = menu.classList.contains('open');
          if (open === menuOpen) return;
          menuOpen = open;
          if (!open || desktop.matches) { cancelMenu(); return; }
          play(menu, [
            { opacity:0, clipPath:'inset(0 0 12% 0)' },
            { opacity:1, clipPath:'inset(0)' },
          ], micro + 60);
          all('a', menu).forEach((link, index) => {
            play(link, [
              { opacity:0, transform:'translateY(6px)' },
              { opacity:1, transform:'translateY(0)' },
            ], micro, 40 + index * 45);
          });
        }, { attributes:true, attributeFilter:['class'] });
        listen(desktop, 'change', cancelMenu);
      }

      // Navegación: un pulso de opacidad acompaña el cambio de sección activa,
      // conservando exactamente el subrayado y color definidos por styles.css.
      if (FEATURES.activeLink) {
        const active = new WeakMap();
        all('#menu a').forEach(link => {
          active.set(link, link.classList.contains('active'));
          watch(link, () => {
            const selected = link.classList.contains('active');
            if (selected && !active.get(link) && (desktop.matches || menu?.classList.contains('open'))) {
              play(link, [{ opacity:.55 }, { opacity:1 }], micro);
            }
            active.set(link, selected);
          }, { attributes:true, attributeFilter:['class'] });
        });
      }

      // Lightbox: acompañar la apertura/cierre ya existentes con un movimiento
      // del escenario. El cierre dura menos que los 240 ms de main.js.
      const dialog = document.querySelector('#lightbox');
      const stage = dialog?.querySelector('.lightbox-stage');
      if (FEATURES.lightbox && stage) {
        let open = dialog.open && dialog.classList.contains('is-open');
        watch(dialog, () => {
          const next = dialog.open && dialog.classList.contains('is-open');
          if (next === open) return;
          open = next;
          if (next) play(stage, [
            { transform:'translateY(10px)' }, { transform:'translateY(0)' },
          ], micro + 80);
          else if (dialog.open) play(stage, [
            { transform:'translateY(0)' }, { transform:'translateY(6px)' },
          ], Math.min(micro, 200));
          else cancelFor(stage);
        }, { attributes:true, attributeFilter:['class', 'open'] });
        watch(document.querySelector('#lightbox-image'), () => {
          if (open) play(stage, [{ opacity:.55 }, { opacity:1 }], micro);
        }, { attributes:true, attributeFilter:['src'] });
        listen(dialog, 'close', () => cancelFor(stage));
      }
    } catch {
      // Una falla de la capa opcional nunca deja contenido escondido.
      stop();
    }
  }

  function stop() {
    enabled = false;
    root.classList.remove(...classes);
    [...running].forEach(animation => animation.cancel());
    running.clear();
    owned.clear();
    dispose.splice(0).forEach(cleanup => cleanup());
  }

  // Controles para probar o desactivar la capa sin tocar el diseño existente.
  window.VictoriaMotion = {
    disable() { stopped = true; stop(); },
    enable() { stopped = false; start(); },
    get enabled() { return enabled; },
  };
  reduced.addEventListener('change', () => { stop(); if (!reduced.matches) start(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  start();
})();
