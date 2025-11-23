/* script.js
   Comportamento JS para:
   - Menu hamburger acessível
   - Hero carousel (autoplay 8s, pausa no hover, indicadores, prev/next, swipe)
   - Info carousel (autoplay 5s, pausa no hover, prev/next, indicadores)
   - Função para alternar autoplay On/Off para desenvolvimento
   - Parallax simples do hero
*/

/* --------------------------
   Configurações (troque aqui)
   -------------------------- */
const HERO_INTERVAL = 8000; // ms (autoplay hero)
const INFO_INTERVAL = 5000; // ms (autoplay info carousel)

/* --------------------------
   Header / Hamburger menu
   -------------------------- */


/* --------------------------
   HERO CAROUSEL
   -------------------------- */
(function(){
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const indicators = Array.from(document.querySelectorAll('.hero-indicators .indicator'));
  const prevBtn = document.querySelector('.hero-control.prev');
  const nextBtn = document.querySelector('.hero-control.next');
  let current = 0;
  let autoplay = true;
  let timer = null;

  function goTo(index, animate=true){
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    slides.forEach((s,i)=>{
      s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      if (i === index) s.style.zIndex = 2;
      else s.style.zIndex = 0;
    });
    indicators.forEach((ind,i)=> ind.classList.toggle('active', i===index));
    current = index;
  }

  function next(){ goTo(current+1) }
  function prev(){ goTo(current-1) }

  // Start autoplay
  function startAuto(){
    stopAuto();
    if (!autoplay) return;
    timer = setInterval(next, HERO_INTERVAL);
  }
  function stopAuto(){ if (timer) { clearInterval(timer); timer = null; } }

  // Pause on hover/focus for accessibility
  const heroEl = document.querySelector('.hero');
  heroEl.addEventListener('mouseenter', ()=> stopAuto());
  heroEl.addEventListener('mouseleave', ()=> startAuto());
  heroEl.addEventListener('focusin', ()=> stopAuto());
  heroEl.addEventListener('focusout', ()=> startAuto());

  // Controls
  nextBtn.addEventListener('click', ()=> { next(); if (autoplay) startAuto(); });
  prevBtn.addEventListener('click', ()=> { prev(); if (autoplay) startAuto(); });

  indicators.forEach(ind=>{
    ind.addEventListener('click', ()=> {
      const idx = Number(ind.getAttribute('data-slide'));
      goTo(idx);
      if (autoplay) startAuto();
    });
  });

  // Keyboard navigation (left/right)
  document.addEventListener('keydown', (e)=>{
    if (e.target.tagName.toLowerCase() === 'input' || e.target.isContentEditable) return;
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe support for mobile
  let startX = 0, endX = 0;
  heroEl.addEventListener('touchstart', (e)=> startX = e.changedTouches[0].clientX);
  heroEl.addEventListener('touchend', (e)=> {
    endX = e.changedTouches[0].clientX;
    if (startX - endX > 40) next();
    if (endX - startX > 40) prev();
  });

  // Simple lazy load: images already have loading="lazy"
  // Parallax: adjust background offset on scroll (simple effect)
  const heroSlidesEl = document.getElementById('heroSlides');
  window.addEventListener('scroll', ()=> {
    const scrolled = window.scrollY;
    // small translate effect
    heroSlidesEl.style.transform = `translateY(${scrolled * 0.08}px)`;
  });

  // Initialize
  goTo(0);
  startAuto();

  // Expose ability to toggle autoplay for development
  window.toggleHeroAutoplay = function(on){
    autoplay = Boolean(on);
    if (autoplay) startAuto();
    else stopAuto();
    console.info('Hero autoplay set to', autoplay);
  };
})();

/* --------------------------
   INFO CAROUSEL (4:3)
   -------------------------- */
(function(){
  const carousel = document.getElementById('infoCarousel');
  const slides = Array.from(carousel.querySelectorAll('.info-slide'));
  const prev = document.querySelector('.info-prev');
  const next = document.querySelector('.info-next');
  const indicators = Array.from(document.querySelectorAll('.info-indicators .info-ind'));
  let current = 0;
  let timer = null;
  let autoplay = true;

  function goTo(i){
    if (i < 0) i = slides.length -1;
    if (i >= slides.length) i = 0;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === i));
    indicators.forEach((ind, idx) => ind.classList.toggle('active', idx === i));
    current = i;
  }
  function nextSlide(){ goTo(current+1) }
  function prevSlide(){ goTo(current-1) }

  function startAuto(){
    stopAuto();
    if (!autoplay) return;
    timer = setInterval(nextSlide, INFO_INTERVAL);
  }
  function stopAuto(){ if (timer) { clearInterval(timer); timer = null; } }

  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);

  next.addEventListener('click', ()=> { nextSlide(); if (autoplay) startAuto(); });
  prev.addEventListener('click', ()=> { prevSlide(); if (autoplay) startAuto(); });

  indicators.forEach(ind => {
    ind.addEventListener('click', ()=> {
      const idx = Number(ind.getAttribute('data-slide'));
      goTo(idx);
      if (autoplay) startAuto();
    });
  });

  // Touch support
  let sx=0, ex=0;
  carousel.addEventListener('touchstart', (e)=> sx = e.changedTouches[0].clientX);
  carousel.addEventListener('touchend', (e)=> {
    ex = e.changedTouches[0].clientX;
    if (sx - ex > 30) nextSlide();
    if (ex - sx > 30) prevSlide();
  });

  // init
  goTo(0);
  startAuto();

  window.toggleInfoAutoplay = function(on){
    autoplay = Boolean(on);
    if (autoplay) startAuto();
    else stopAuto();
    console.info('Info carousel autoplay set to', autoplay);
  };
})();

/* --------------------------
   Small script: set year in footer
   -------------------------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* --------------------------
   Smooth scrolling for anchor links
   -------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', function(e){
    const href = this.getAttribute('href');
    if (href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
      // If nav was open (mobile), close it
      const nav = document.getElementById('main-nav');
      if (!nav.hidden) {
        nav.hidden = true;
        document.getElementById('hamburger').setAttribute('aria-expanded','false');
      }
    }
  });
});

/* --------------------------
   Notes:
   - Para desativar/ativar autoplay em runtime (útil p/ dev):
       toggleHeroAutoplay(false);
       toggleInfoAutoplay(false);
   - Para trocar tempos, edite HERO_INTERVAL e INFO_INTERVAL no topo.
*/

const hamburger = document.getElementById("hamburger");
const mainNav = document.getElementById("main-nav");

hamburger.addEventListener("click", () => {
  const expanded = hamburger.getAttribute("aria-expanded") === "true";

  hamburger.classList.toggle("active");
  mainNav.hidden = expanded; // alterna visibilidade
  hamburger.setAttribute("aria-expanded", !expanded);
});
