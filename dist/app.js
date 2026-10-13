'use strict';
const $ = selector => document.querySelector(selector);
const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion:reduce)');
let finishEntrances = () => {};
document.addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || (event.key.length === 1 && event.key !== ' ')) return;
  root.dataset.input = 'keyboard';
  finishEntrances();
});
const usePointer = () => { if (root.dataset.input === 'keyboard') delete root.dataset.input; };
document.addEventListener('pointerdown', usePointer, {passive:true});
document.addEventListener('pointermove', usePointer, {passive:true});
const menu = $('.menu-button');
const mobileNav = $('#mobile-nav');
function closeMenu() { menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Abrir menú'); mobileNav.hidden = true; }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded',String(!open)); menu.setAttribute('aria-label',open ? 'Abrir menú' : 'Cerrar menú'); mobileNav.hidden = open; });
mobileNav.addEventListener('click',event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown',event => { if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menu.focus(); } });
document.addEventListener('click',event => { if (!event.target.closest('.header') && !mobileNav.hidden) closeMenu(); });
matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
let headerFrame = 0;
function paintHeader() { headerFrame = 0; $('.header').classList.toggle('is-solid',scrollY > 30); }
addEventListener('scroll',() => { if (!headerFrame) headerFrame = requestAnimationFrame(paintHeader); },{passive:true});
paintHeader();
const slices = [...document.querySelectorAll('.service-slice')];
const hover = matchMedia('(hover:hover) and (pointer:fine)');
let refreshTimer;
function openService(slice) {
  if (slice.classList.contains('is-open') && document.documentElement.classList.contains('js-ready')) return;
  slices.forEach(item => {
    const open = item === slice;
    item.classList.toggle('is-open',open);
    item.querySelector('.service-toggle').setAttribute('aria-expanded',String(open));
    const copy = item.querySelector('.slice-copy');
    copy.inert = !open;
    copy.setAttribute('aria-hidden',String(!open));
  });
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => window.ScrollTrigger?.refresh(),root.dataset.input === 'keyboard' || reducedMotion.matches ? 0 : 280);
}
slices.forEach(slice => {
  slice.querySelector('.service-toggle').addEventListener('click',() => openService(slice));
  slice.querySelector('.service-toggle').addEventListener('focus',() => openService(slice));
  slice.addEventListener('pointerenter',() => { if (hover.matches && !$('.service-accordion').contains(document.activeElement)) openService(slice); });
});
openService(slices[0]);
document.documentElement.classList.add('js-ready');
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click',() => { $('#servicio').value = link.dataset.service; resetConsultation(); updateQuickWhatsApp(); }));
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click',() => { clearTimeout(refreshTimer); window.ScrollTrigger?.refresh(); }));
const navSections = ['servicios','proyectos','resenas','nosotros','contacto'].map(id => document.getElementById(id));
const visibleNavSections = new Set();
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) visibleNavSections.add(entry.target); else visibleNavSections.delete(entry.target); });
  const current = navSections.find(section => visibleNavSections.has(section));
  document.querySelectorAll('.desktop-nav a').forEach(link => {
    if (current && link.hash === `#${current.id}`) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current');
  });
},{rootMargin:'-20% 0px -55% 0px',threshold:0});
navSections.forEach(section => navObserver.observe(section));

// Native disclosure and dialog keep the portfolio usable without JavaScript.
const galleryMore = $('.gallery-more');
galleryMore.addEventListener('toggle',() => window.ScrollTrigger?.refresh());
const projectLinks = [...document.querySelectorAll('.project-image')];
const viewer = $('#project-viewer');
const viewerImage = $('.viewer-image');
let projectIndex = 0, projectOpener;
function showProject(index) {
  projectIndex = (index + projectLinks.length) % projectLinks.length;
  const link = projectLinks[projectIndex];
  viewerImage.alt = link.querySelector('img').alt;
  viewerImage.hidden = false;
  $('.viewer-error').hidden = true;
  $('.viewer-original').href = link.href;
  viewerImage.src = link.href;
  $('.viewer-count').textContent = `${String(projectIndex + 1).padStart(2,'0')} / ${projectLinks.length}`;
}
if (typeof viewer.showModal === 'function') {
  projectLinks.forEach((link,index) => link.addEventListener('click',event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    projectOpener = link;
    showProject(index);
    root.classList.add('gallery-open');
    viewer.showModal();
  }));
  $('.viewer-close').addEventListener('click',() => viewer.close());
  $('.viewer-prev').addEventListener('click',() => showProject(projectIndex - 1));
  $('.viewer-next').addEventListener('click',() => showProject(projectIndex + 1));
  viewer.addEventListener('keydown',event => {
    if (event.key === 'Tab') {
      const controls = [...viewer.querySelectorAll('button,a[href]')].filter(element => element.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showProject(projectIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let backdropPress = false;
  viewer.addEventListener('pointerdown',event => { backdropPress = event.target === viewer; });
  viewer.addEventListener('click',event => { if (backdropPress && event.target === viewer) viewer.close(); backdropPress = false; });
  viewer.addEventListener('close',() => {
    root.classList.remove('gallery-open');
    projectOpener?.focus({preventScroll:true});
  });
  viewerImage.addEventListener('error',() => { viewerImage.hidden = true; $('.viewer-error').hidden = false; });
}
const form = $('#quote-form');
const status = $('#form-status');
const submitButton = $('.form-submit');
const reviewLink = $('.form-whatsapp');
const businessNumber = '56946603752';
const whatsappUrl = text => `https://wa.me/${businessNumber}?text=${encodeURIComponent(text)}`;
function resetConsultation() {
  status.hidden = true;
  status.textContent = '';
  submitButton.hidden = false;
  reviewLink.hidden = true;
  reviewLink.setAttribute('href',`https://wa.me/${businessNumber}`);
}
function updateQuickWhatsApp() {
  const service = $('#servicio').value;
  const message = service === 'Necesito orientación' ? 'Hola, Estudio 105. Quisiera orientación para mi proyecto.' : `Hola, Estudio 105. Quisiera consultar por ${service.toLowerCase()} para mi proyecto.`;
  document.querySelectorAll('.contact-whatsapp').forEach(link => link.href = whatsappUrl(message));
}
function validateField(field) {
  field.setCustomValidity('');
  const value = field.value.trim();
  if (field.id === 'nombre' && value.length < 2) field.setCustomValidity('Escribe tu nombre, con al menos 2 caracteres.');
  if (field.id === 'whatsapp' && value) { const digits = value.replace(/\D/g,''); if (!/^[+\d\s().-]+$/.test(value) || digits.length < 8 || digits.length > 15) field.setCustomValidity('Escribe un número de WhatsApp válido, por ejemplo +56 9 1234 5678.'); }
}
form.querySelectorAll('input,textarea').forEach(field => {
  const handleEdit = () => { validateField(field); resetConsultation(); };
  field.addEventListener('input',handleEdit);
  field.addEventListener('change',handleEdit);
});
$('#servicio').addEventListener('change',() => { resetConsultation(); updateQuickWhatsApp(); });
form.addEventListener('reset',() => { resetConsultation(); requestAnimationFrame(updateQuickWhatsApp); });
form.addEventListener('submit',event => {
  event.preventDefault();
  form.querySelectorAll('input,textarea').forEach(validateField);
  if (!form.reportValidity()) return;
  const message = [
    'Hola, Estudio 105.',
    `Soy ${$('#nombre').value.trim()}.`,
    `Servicio: ${$('#servicio').value}.`,
    $('#whatsapp').value.trim() ? `Mi WhatsApp: ${$('#whatsapp').value.trim()}.` : '',
    $('#mensaje').value.trim() ? `Mi proyecto: ${$('#mensaje').value.trim()}` : 'Quisiera conversar sobre mi proyecto y conocer el siguiente paso.'
  ].filter(Boolean).join('\n');
  reviewLink.href = whatsappUrl(message);
  submitButton.hidden = true;
  reviewLink.hidden = false;
  status.textContent = 'Consulta preparada. Envíala desde WhatsApp.';
  status.hidden = false;
  reviewLink.focus({preventScroll:true});
});
updateQuickWhatsApp();
$('#form-fields').disabled = false;
async function startMotion() {
  if (!window.gsap || !window.ScrollTrigger) return;
  await document.fonts.ready;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion:no-preference)',() => {
    const entrances = [];
    const endEntrance = tween => { tween.scrollTrigger?.kill(); tween.progress(1).kill(); };
    finishEntrances = () => entrances.forEach(endEntrance);
    if ($('.hero').getBoundingClientRect().bottom > 0 && root.dataset.input !== 'keyboard' && !$('.hero-copy').contains(document.activeElement)) {
      entrances.push(gsap.from('.hero-copy > *',{y:18,opacity:0,duration:.7,ease:'power3.out',stagger:.07,clearProps:'opacity,transform'}));
    }
    gsap.fromTo($('.hero-photo img'),{scale:1.08,y:0},{scale:1.02,y:80,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.4}});
    document.querySelectorAll('.reveal').forEach(element => {
      if (root.dataset.input === 'keyboard' || element.contains(document.activeElement) || element.getBoundingClientRect().bottom <= 0) return;
      entrances.push(gsap.from(element,{y:24,opacity:0,duration:.65,ease:'power3.out',clearProps:'opacity,transform',scrollTrigger:{trigger:element,start:'top 90%',once:true}}));
    });
    document.querySelectorAll('.media-banner').forEach(banner => {
      const frame = banner.querySelector('.media-frame');
      const image = frame.querySelector('img');
      gsap.fromTo(frame,{scale:.82},{scale:1,ease:'none',scrollTrigger:{trigger:banner,start:'top 95%',end:'top 25%',scrub:.4}});
      gsap.fromTo(image,{scale:1.2,y:35},{scale:1.13,y:-35,ease:'none',scrollTrigger:{trigger:banner,start:'top bottom',end:'bottom top',scrub:.4}});
      gsap.to(image,{opacity:.45,ease:'none',scrollTrigger:{trigger:banner,start:'bottom 35%',end:'bottom top',scrub:.3}});
    });
    document.querySelectorAll('.steps li').forEach(element => gsap.fromTo(element.querySelector('.step-rule'),{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:element,start:'top 88%',end:'top 55%',scrub:.3}}));
    const track = $('.marquee-track');
    let distance = 0, loop, resizeFrame = 0;
    let inView = false;
    const syncLoop = () => { if (inView && !document.hidden) loop.play(); else loop.pause(); };
    const measureLoop = () => {
      resizeFrame = 0;
      const nextDistance = track.children[3].offsetLeft - track.children[0].offsetLeft;
      if (Math.abs(nextDistance - distance) < .5) return;
      const progress = loop?.progress() || 0;
      loop?.kill(); distance = nextDistance;
      gsap.set(track,{x:0});
      loop = gsap.to(track,{x:-distance,duration:34,ease:'none',repeat:-1,paused:true}).progress(progress);
      syncLoop();
    };
    measureLoop();
    const loopObserver = new ResizeObserver(() => { if (!resizeFrame) resizeFrame = requestAnimationFrame(measureLoop); });
    loopObserver.observe(track);
    ScrollTrigger.create({trigger:'.design-marquee',start:'top bottom',end:'bottom top',onToggle:self => { inView = self.isActive; syncLoop(); }});
    document.addEventListener('visibilitychange',syncLoop);
    ScrollTrigger.refresh();
    return () => { document.removeEventListener('visibilitychange',syncLoop); loopObserver.disconnect(); cancelAnimationFrame(resizeFrame); loop.kill(); gsap.set(track,{clearProps:'transform'}); finishEntrances = () => {}; };
  });
  document.addEventListener('focusin',event => {
    if (root.dataset.input === 'keyboard') { finishEntrances(); return; }
    const reveal = event.target.closest('.reveal');
    if (reveal) { gsap.killTweensOf(reveal); gsap.set(reveal,{clearProps:'opacity,transform'}); }
  });
}
startMotion();
