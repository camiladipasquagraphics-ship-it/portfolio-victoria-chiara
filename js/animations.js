/* Motion is progressive: without dependencies every section remains readable. */
(() => {
  'use strict';
  const { gsap, ScrollTrigger, Lenis } = window;
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  // Keep Lenis and scroll animations on the same elapsed-time clock.
  gsap.ticker.lagSmoothing(0);
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 992px) and (hover: hover) and (pointer: fine)');
  const all = (selector, scope = document) => [...scope.querySelectorAll(selector)]
    .filter(element => !element.closest('[data-motion="off"]'));
  const seen = new WeakSet();
  const entrances = new Map();
  let context, lenis, tick, refreshCall;
  let cleanups = [];
  let stopped = false;
  let enabled = false;
  let heroPlayed = false;

  function listen(target, type, handler, options) {
    target?.addEventListener(type, handler, options);
    cleanups.push(() => target?.removeEventListener(type, handler, options));
  }
  function watch(target, handler, options) {
    if (!target) return;
    const observer = new MutationObserver(handler);
    observer.observe(target, options);
    cleanups.push(() => observer.disconnect());
  }
  function refresh() {
    if (!enabled) return;
    refreshCall?.kill();
    refreshCall = gsap.delayedCall(.12, () => {
      lenis?.resize();
      ScrollTrigger.refresh();
    });
  }
  // Event-created tweens belong to this context too, so cleanup is complete.
  function animate(callback) {
    if (enabled && context) context.add(callback);
  }
  function start() {
    if (enabled || stopped || reduced.matches) return;
    enabled = true;
    root.classList.add('vc-motion', 'vc-hover');
    const compact = !desktop.matches;
    const distance = compact ? 12 : 28;
    const duration = compact ? .55 : .85;
    try {
      context = gsap.context(() => {});
      context.add(() => {
        if (!heroPlayed && scrollY < innerHeight * .5) {
          heroPlayed = true;
          gsap.timeline({ defaults:{ ease:'power3.out' } })
            .from(all('.cover-title'), { opacity:0, y:compact ? 12 : 30, duration }, 0)
            .from(all('.cover-portrait'), { opacity:0, y:compact ? 16 : 40, duration:duration + .2 }, .12)
            .from(all('.cover-caption p'), { opacity:0, y:12, duration:.6, stagger:.1 }, .4);
        }
        // Whole text blocks preserve wrapping, semantics and the SVG lettering.
        all('.reveal, .filters, #testimonials-title, .testimonial-slide, .testimonial-controls').forEach(element => {
          if (seen.has(element) || element.hidden) return;
          if (element.getBoundingClientRect().bottom <= 0) { seen.add(element); return; }
          const text = all('.eyebrow, h2, p', element).filter(node => !node.closest('form'));
          const isTextBlock = element.matches('.about-copy, .section-heading') || element.querySelector('#contact-title');
          const targets = text.length && isTextBlock ? text : [element];
          const siblings = [...element.parentElement.children].filter(node => node.matches('.reveal'));
          const delay = compact ? 0 : Math.max(0, siblings.indexOf(element)) % 3 * .07;
          const timeline = gsap.timeline({ paused:true, defaults:{ ease:'power3.out', duration } });
          timeline.from(targets, { opacity:0, y:distance, stagger:compact ? .05 : .09 });
          all('.photo-slot', element).forEach(slot => {
            // Reveal frames and placeholders without changing any image crop.
            timeline.fromTo(slot, { clipPath:'inset(0 0 100% 0)' }, {
              clipPath:'inset(0 0 0% 0)', duration:duration + .15, clearProps:'clipPath',
            }, 0);
          });
          entrances.set(element, timeline);
          ScrollTrigger.create({ trigger:element, start:'top 92%', once:true,
            onEnter:() => { seen.add(element); timeline.delay(delay).play(); },
          });
        });
        // Desktop only: slight relative travel, no pinning or layout changes.
        if (!compact) {
          all('.cover-title svg').forEach(element => gsap.to(element, {
            y:36, ease:'none', scrollTrigger:{ trigger:'.hero-cover', start:'top top', end:'bottom top', scrub:.6 },
          }));
          all('.cover-portrait img').forEach(element => gsap.to(element, {
            y:18, ease:'none', scrollTrigger:{ trigger:'.hero-cover', start:'top top', end:'bottom top', scrub:.6 },
          }));
        }
      });
      if (Lenis && !compact) {
        lenis = new Lenis({ autoRaf:false, duration:.95, smoothWheel:true, syncTouch:false,
          prevent:node => Boolean(node.closest('#lightbox, #menu, textarea, select, [data-lenis-prevent]')),
        });
        lenis.on('scroll', ScrollTrigger.update);
        tick = time => lenis?.raf(time * 1000);
        gsap.ticker.add(tick);
        const syncModal = () => document.querySelector('#lightbox').open ? lenis?.stop() : lenis?.start();
        watch(document.querySelector('#lightbox'), syncModal, { attributes:true, attributeFilter:['open'] });
        syncModal();
      }
      const menu = document.querySelector('#menu');
      let menuOpen = menu?.classList.contains('open');
      watch(menu, () => {
        const open = menu.classList.contains('open');
        if (open === menuOpen) return;
        menuOpen = open;
        animate(() => {
          const links = all('a', menu);
          gsap.killTweensOf(links);
          if (open && matchMedia('(max-width: 991px)').matches) {
            gsap.fromTo(links, { opacity:0, y:8 }, { opacity:1, y:0, duration:.3, stagger:.045, clearProps:'opacity,transform' });
          } else gsap.set(links, { clearProps:'opacity,transform' });
        });
      }, { attributes:true, attributeFilter:['class'] });
      const dialog = document.querySelector('#lightbox');
      watch(dialog, () => {
        if (dialog.open) animate(() => gsap.fromTo('.lightbox-stage', { y:10 }, {
          y:0, duration:.22, overwrite:true, clearProps:'transform',
        }));
      }, { attributes:true, attributeFilter:['open'] });
      watch(document.querySelector('#lightbox-image'), () => {
        if (dialog.open) animate(() => gsap.fromTo('.lightbox-photo', { opacity:.45 }, {
          opacity:1, duration:.28, overwrite:true, clearProps:'opacity',
        }));
      }, { attributes:true, attributeFilter:['src'] });
      all('img').forEach(img => { listen(img, 'load', refresh); listen(img, 'error', refresh); });
      listen(window, 'load', refresh);
      if (window.ResizeObserver) {
        const observer = new ResizeObserver(refresh);
        all('main > section, .site-header, .site-footer').forEach(element => observer.observe(element));
        cleanups.push(() => observer.disconnect());
      }
      document.fonts?.ready.then(refresh);
      listen(document, 'focusin', event => {
        for (const [element, timeline] of entrances) {
          if (element.contains(event.target)) { seen.add(element); timeline.progress(1); }
        }
      });
      refresh();
    } catch (error) {
      stop();
      console.warn('La capa de animaciones se desactivó; el contenido sigue disponible.', error);
    }
  }
  function stop() {
    enabled = false;
    refreshCall?.kill();
    cleanups.splice(0).forEach(cleanup => cleanup());
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = tick = null;
    context?.revert();
    context = null;
    entrances.clear();
    root.classList.remove('vc-motion', 'vc-hover');
  }
  window.VictoriaMotion = {
    get enabled() { return enabled; },
    disable() { stopped = true; stop(); },
    enable() { stopped = false; start(); },
    refresh,
    scrollTo(target, hash) {
      if (!enabled || !lenis) return false;
      lenis.scrollTo(target, { offset:-(document.querySelector('.site-header').offsetHeight + 16), onComplete:() => {
        if (location.hash !== hash) history.pushState(null, '', hash);
        const previous = target.getAttribute('tabindex');
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll:true });
        if (previous === null) target.removeAttribute('tabindex');
        else target.setAttribute('tabindex', previous);
      } });
      return true;
    },
    prepareFilter() {
      if (!enabled) return;
      for (const [element, timeline] of entrances) {
        if (element.matches('.gallery-item')) { seen.add(element); timeline.progress(1); }
      }
      gsap.killTweensOf(all('.gallery-item'));
      animate(() => gsap.set(all('.gallery-item'), { clearProps:'opacity,transform' }));
    },
    filterItem(item, before, after) {
      if (item.closest('[data-motion="off"]')) return;
      animate(() => gsap.fromTo(item, {
        opacity:before ? 1 : 0, x:before ? before.left - after.left : 0,
        y:before ? before.top - after.top : 12,
      }, { opacity:1, x:0, y:0, duration:.5, ease:'power3.out', clearProps:'opacity,transform', overwrite:true }));
    },
    testimonial() {
      const element = document.querySelector('#opinion');
      if (element.closest('[data-motion="off"]')) return;
      entrances.get(element)?.progress(1);
      animate(() => gsap.fromTo(element, { opacity:0, y:8 }, {
        opacity:1, y:0, duration:.4, overwrite:true, clearProps:'opacity,transform',
      }));
      refresh();
    },
  };
  reduced.addEventListener('change', () => { stop(); start(); });
  desktop.addEventListener('change', () => { stop(); start(); });
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  start();
})();
