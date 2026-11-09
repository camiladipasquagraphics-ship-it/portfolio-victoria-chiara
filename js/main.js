/* Configuración de fotografías y destino de las consultas. */
const CONFIG = {
  useRealPhotos: false, // Cambiar a true después de cargar los archivos en /img/.
  whatsappNumber: '5491126232695', // Número internacional, sin espacios ni signos.
};

(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const transparent = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/%3E';

  // Unir las dos últimas palabras sin alterar etiquetas, controles ni textos ingresados.
  // Se complementa con text-wrap: pretty/balance para evitar palabras viudas.
  function preventWidows(root = document) {
    const selector = 'p, h2, h3, blockquote, figcaption, figcaption > span, label, small, .text-link, .footer-instagram, .nav-links a, .photo-overlay > span, .process span';
    const blocks = [...(root.matches?.(selector) ? [root] : []), ...$$(selector, root)];
    blocks.forEach(block => {
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
      let node; let lastText;
      while ((node = walker.nextNode())) {
        if (node.textContent.trim() && !node.parentElement.closest('[aria-hidden="true"], .visually-hidden, svg, textarea, input, select')) lastText = node;
      }
      if (lastText) lastText.textContent = lastText.textContent.replace(/[ \t\r\n]+([^\s]+)([ \t\r\n]*)$/, '\u00a0$1$2');
    });
  }

  // Las rutas están en data-src: no se solicitan archivos inexistentes en modo maqueta.
  $$('img[data-src]').forEach(img => {
    img.addEventListener('load', () => img.closest('.photo-slot').classList.toggle('has-photo', img.getAttribute('src') !== transparent));
    img.addEventListener('error', () => { img.closest('.photo-slot').classList.remove('has-photo'); img.src = transparent; });
    img.src = CONFIG.useRealPhotos ? img.dataset.src : transparent;
  });
  $('#year').textContent = new Date().getFullYear();
  const dateField = $('#fecha');
  const today = new Date();
  dateField.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Menú accesible: cierre por enlace, Escape, clic exterior y cambio a escritorio.
  const header = $('#cabecera');
  // Reservar la altura real de las barras fijas, incluso al cargar las fuentes.
  const footer = $('.site-footer');
  const footerBrand = $('.wordmark', footer);
  function updateFixedBars() {
    footer.style.setProperty('--footer-brand-width', `${footerBrand.getBoundingClientRect().width}px`);
    document.documentElement.style.setProperty('--header-height', `${header.offsetHeight}px`);
    document.documentElement.style.setProperty('--footer-height', `${footer.offsetHeight}px`);
  }
  updateFixedBars();
  document.fonts?.ready.then(updateFixedBars);
  if ('ResizeObserver' in window) {
    const barsObserver = new ResizeObserver(updateFixedBars);
    barsObserver.observe(header);
    barsObserver.observe(footer);
    barsObserver.observe(footerBrand);
  } else {
    window.addEventListener('resize', updateFixedBars);
  }
  const toggle = $('.menu-toggle');
  const menu = $('#menu');
  const navLinks = $$('.nav-links a');
  const sections = $$('main section[id]');
  let navigationTarget = null;

  function markSection(id) {
    navLinks.forEach(link => {
      const selected = link.hash === `#${id}`;
      if (link.classList.contains('active') !== selected) link.classList.toggle('active', selected);
      if (selected && link.getAttribute('aria-current') !== 'location') link.setAttribute('aria-current', 'location');
      else if (!selected) link.removeAttribute('aria-current');
    });
  }
  function updateActiveSection() {
    // Usar el mismo borde que los enlaces de anclaje, debajo de la barra fija.
    const anchorLine = header.getBoundingClientRect().bottom + 16;
    const atBottom = window.scrollY > 0 && window.scrollY + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 2;
    if (navigationTarget) {
      const arrived = Math.abs(navigationTarget.getBoundingClientRect().top - anchorLine) <= 3;
      if (!arrived && !(atBottom && navigationTarget === sections.at(-1))) { markSection(navigationTarget.id); return; }
      navigationTarget = null;
    }
    const current = atBottom ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= anchorLine + 3).at(-1);
    markSection(current?.id);
  }
  function finishNavigation() {
    navigationTarget = null;
    updateActiveSection();
  }
  function followSection(target) {
    navigationTarget = target;
    markSection(target.id);
    updateActiveSection();
  }
  function closeMenu(restoreFocus = false) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    menu.classList.remove('open'); header.classList.remove('menu-open');
    if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('open', open); header.classList.toggle('menu-open', open);
  });
  $$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = sections.find(section => `#${section.id}` === link.hash);
    if (!target) return;
    // Marcar la opción elegida desde el clic y conservarla durante el scroll
    // suave: las secciones intermedias no deben reemplazar esa selección.
    followSection(target);
    if (menu.contains(link)) closeMenu();
  }));
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true); });
  window.matchMedia('(min-width: 992px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  // Mostrar el footer al deslizar; mantenerlo fuera del foco mientras está oculto.
  let scrollScheduled = false;
  function updateScroll() {
    header.classList.toggle('scrolled', window.scrollY > 24);
    const showFooter = window.scrollY > 64;
    footer.classList.toggle('is-visible', showFooter);
    footer.inert = !showFooter;
    $('.back-top').classList.toggle('visible', window.scrollY > 650);
    scrollScheduled = false;
  }
  function scheduleScrollUpdate() {
    // Resolver la selección en cada evento, sin esperar otro frame ni usar
    // temporizadores que puedan vencer antes de terminar el scroll nativo.
    updateActiveSection();
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
  // Si el visitante interrumpe el desplazamiento, seguir su posición real.
  window.addEventListener('wheel', finishNavigation, { passive: true });
  window.addEventListener('touchstart', finishNavigation, { passive: true });
  document.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key) && !event.target.closest?.('input, textarea, select, [contenteditable]')) finishNavigation();
  });
  window.addEventListener('hashchange', () => {
    const target = sections.find(section => `#${section.id}` === window.location.hash);
    if (target) followSection(target);
  });
  document.fonts?.ready.then(scheduleScrollUpdate);
  updateScroll();
  updateActiveSection();

  if ('IntersectionObserver' in window) {
    if (!motion.matches) {
      document.body.classList.add('motion-ready');
      const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
      }), { threshold: .08 });
      $$('.reveal').forEach((element, index) => { element.style.setProperty('--delay', `${index % 3 * 75}ms`); reveals.observe(element); });
    }
  }

  // Filtrado con animación FLIP: las posiciones se calculan antes y después del cambio.
  const items = $$('.gallery-item');
  let selectedItems = items;
  let filterAnimations = [];
  $$('.filter').forEach(button => button.addEventListener('click', () => {
    filterAnimations.forEach(animation => animation.cancel()); filterAnimations = [];
    const before = new Map(items.filter(item => !item.hidden).map(item => [item, item.getBoundingClientRect()]));
    $$('.filter').forEach(filter => { const active = filter === button; filter.classList.toggle('active', active); filter.setAttribute('aria-pressed', String(active)); });
    $('.gallery').classList.toggle('is-filtered', button.dataset.filter !== 'all');
    items.forEach(item => { item.hidden = button.dataset.filter !== 'all' && item.dataset.category !== button.dataset.filter; });
    selectedItems = items.filter(item => !item.hidden);
    selectedItems.forEach(item => {
      item.classList.add('is-visible');
      const previous = before.get(item); const next = item.getBoundingClientRect();
      if (!motion.matches && item.animate) filterAnimations.push(item.animate([
        { opacity: previous ? 1 : 0, transform: previous ? `translate(${previous.left - next.left}px, ${previous.top - next.top}px)` : 'translateY(18px)' },
        { opacity: 1, transform: 'translate(0,0)' }
      ], { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)' }));
    });
    $('.gallery-announcement').textContent = `${selectedItems.length} fotografías. Categoría: ${button.textContent.trim()}.`;
  }));

  // Dialog nativo: foco contenido, fondo inerte y regreso al disparador al cerrar.
  const dialog = $('#lightbox');
  const lightImage = $('#lightbox-image');
  let photoIndex = 0; let opener; let closeTimer; let touchStart;
  function showPhoto(index) {
    photoIndex = (index + selectedItems.length) % selectedItems.length;
    const figure = selectedItems[photoIndex]; const source = $('img', figure);
    const realPhoto = source.closest('.photo-slot').classList.contains('has-photo');
    lightImage.src = realPhoto ? source.src : transparent; lightImage.alt = source.alt;
    $('.lightbox-photo').classList.toggle('has-photo', realPhoto);
    $('#lightbox-title').textContent = $('figcaption span', figure).textContent;
    $('#lightbox-count').textContent = `${String(photoIndex + 1).padStart(2, '0')} / ${String(selectedItems.length).padStart(2, '0')}`;
    preventWidows(dialog);
  }
  lightImage.addEventListener('error', () => { lightImage.src = transparent; $('.lightbox-photo').classList.remove('has-photo'); });
  $$('.gallery-open').forEach(button => button.addEventListener('click', () => {
    opener = button; clearTimeout(closeTimer);
    showPhoto(selectedItems.indexOf(button.closest('.gallery-item')));
    dialog.showModal(); document.body.classList.add('modal-open');
    requestAnimationFrame(() => dialog.classList.add('is-open'));
    $('#lightbox-close').focus();
  }));
  function closeLightbox() {
    dialog.classList.remove('is-open');
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => dialog.close(), motion.matches ? 0 : 240);
  }
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); opener?.focus(); });
  $('#lightbox-close').addEventListener('click', closeLightbox);
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeLightbox(); });
  $('#lightbox-prev').addEventListener('click', () => showPhoto(photoIndex - 1));
  $('#lightbox-next').addEventListener('click', () => showPhoto(photoIndex + 1));
  dialog.addEventListener('click', event => { if (event.target === dialog) closeLightbox(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(photoIndex - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(photoIndex + 1); }
  });
  const stage = $('.lightbox-photo');
  stage.addEventListener('touchstart', event => { touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }; }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x; const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(photoIndex + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });

  const quotes = [
    ['Nos hizo sentir tan cómodos que nos olvidamos de la cámara. Las fotos nos devuelven a ese día cada vez que las miramos.', 'MARÍA & TOMÁS', 'BODA'],
    ['Capturó todas las risas y esos pequeños detalles que se nos habían pasado. Un recuerdo hermoso para compartir.', 'SOFÍA', 'CUMPLEAÑOS & XV'],
    ['Entendió la idea del encuentro y la contó con muchísima sensibilidad. Nos encantó ver a nuestro equipo en sus fotos.', 'EQUIPO ORGANIZADOR', 'EVENTO CORPORATIVO']
  ];
  let quoteIndex = 0;
  function changeQuote(direction) {
    quoteIndex = (quoteIndex + direction + quotes.length) % quotes.length;
    const [quote, name, event] = quotes[quoteIndex];
    $('#opinion blockquote').textContent = `“${quote}”`;
    const credit = $('#opinion > p'); credit.replaceChildren(document.createTextNode(`${name} `));
    const detail = document.createElement('span'); detail.textContent = ` / ${event} · TEXTO DE EJEMPLO`; credit.append(detail);
    preventWidows($('#opinion'));
    $('#testimonial-count').textContent = `0${quoteIndex + 1} / 03`;
    $('#testimonial-count').setAttribute('aria-label', `Testimonio ${quoteIndex + 1} de 3`);
    if (!motion.matches && $('#opinion').animate) $('#opinion').animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400 });
  }
  $('#testimonial-prev').addEventListener('click', () => changeQuote(-1));
  $('#testimonial-next').addEventListener('click', () => changeQuote(1));
  $$('[data-event]').forEach(link => link.addEventListener('click', () => { $('#evento').value = link.dataset.event; }));

  // Validar antes de abrir WhatsApp con la consulta preparada; el usuario confirma allí el envío.
  const form = $('#contact-form'); const status = $('#form-status');
  const fields = $$('input, select, textarea', form);
  function validate(field) {
    let error = '';
    if (field.required && !field.value.trim()) error = 'Completá este campo.';
    else if (field.id === 'mensaje' && field.value.trim().length < 10) error = 'Contanos un poco más (al menos 10 caracteres).';
    else if (field.type === 'date' && (field.validity.rangeUnderflow || field.validity.badInput)) error = 'Elegí una fecha válida, desde hoy en adelante.';
    field.setAttribute('aria-invalid', String(Boolean(error))); $(`#${field.id}-error`).textContent = error;
    return !error;
  }
  fields.forEach(field => { field.addEventListener('blur', () => validate(field)); field.addEventListener('input', () => { if (field.getAttribute('aria-invalid') === 'true') validate(field); }); });
  form.addEventListener('submit', event => {
    event.preventDefault(); status.classList.remove('success');
    const valid = fields.map(validate).every(Boolean);
    if (!valid) { status.textContent = 'Revisá los campos señalados antes de continuar.'; preventWidows(status); $('[aria-invalid="true"]', form).focus(); return; }
    const value = id => $(`#${id}`).value.trim();
    const message = [
      '¡Hola Victoria! Quiero consultar por una cobertura fotográfica.',
      '',
      `Nombre: ${value('nombre')}`,
      `Tipo de evento: ${value('evento')}`,
      ...(value('fecha') ? [`Fecha: ${value('fecha').split('-').reverse().join('/')}`] : []),
      '',
      value('mensaje'),
    ].join('\n');
    status.textContent = 'Abriendo WhatsApp con tu consulta. Revisá el mensaje y tocá Enviar allí para confirmarlo.';
    preventWidows(status);
    window.location.assign(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`);
  });
  preventWidows();

  // Ajustar la prosa al ancho de la línea visible más larga del título,
  // en lugar de ocupar todo el ancho de la columna de Bootstrap.
  const aboutHeading = $('#about-title');
  function fitAboutText() {
    const range = document.createRange();
    range.selectNodeContents(aboutHeading);
    const lineWidths = [...range.getClientRects()].map(rect => rect.width);
    const width = Math.min(aboutHeading.clientWidth, Math.max(0, ...lineWidths));
    if (width > 0) aboutHeading.closest('.about-copy').style.setProperty('--about-prose-width', `${Math.ceil(width)}px`);
  }
  fitAboutText();
  document.fonts?.ready.then(fitAboutText);
  if ('ResizeObserver' in window) {
    const headingObserver = new ResizeObserver(fitAboutText);
    headingObserver.observe(aboutHeading);
  } else {
    window.addEventListener('resize', fitAboutText);
  }

  // En móvil, centrar las letras visibles del SVG con la foto y la pantalla.
  // Medir después de cargar Pesto Fresco evita depender de métricas de respaldo
  // o de diferencias en el renderizado de textPath entre navegadores.
  const coverTitle = $('.cover-title');
  const coverText = $('text', coverTitle);
  function centerMobileCover() {
    if (!window.matchMedia('(max-width: 767px)').matches) {
      coverTitle.style.removeProperty('--cover-text-offset');
      return;
    }
    const bounds = coverText.getBoundingClientRect();
    if (!bounds.width) return;
    const previous = parseFloat(coverTitle.style.getPropertyValue('--cover-text-offset')) || 0;
    const correction = document.documentElement.clientWidth / 2 - (bounds.left + bounds.width / 2);
    coverTitle.style.setProperty('--cover-text-offset', `${previous + correction}px`);
  }
  centerMobileCover();
  document.fonts?.ready.then(centerMobileCover);
  if ('ResizeObserver' in window) {
    const coverObserver = new ResizeObserver(centerMobileCover);
    coverObserver.observe($('svg', coverTitle));
  } else {
    window.addEventListener('resize', centerMobileCover);
  }
})();
