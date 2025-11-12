
/* ===== Utilities ===== */
document.getElementById('year').textContent = new Date().getFullYear();

/* ===== Parallax =====
   - layers with data-speed attribute will move by scroll and mouse
*/
(function(){
  const layers = document.querySelectorAll('.parallax-layer');
  let mouseX = 0, mouseY = 0;
  function applyParallax(){
    const w = window.innerWidth;
    const h = window.innerHeight;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.03;
      const x = (mouseX - w/2) * speed;
      const y = (mouseY - h/2) * speed;
      layer.style.transform = `translate3d(${x}px,${y}px,0)`;
    });
  }
  window.addEventListener('mousemove', (e)=>{ mouseX = e.clientX; mouseY = e.clientY; applyParallax(); });
  window.addEventListener('scroll', ()=> {
    const sc = window.scrollY;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed) || 0.03;
      const y = sc * speed * -1;
      // keep mouse transform combined
      layer.style.transform = `translate3d(0,${y}px,0)`;
    });
  });
})();

/* ===== Reveal on scroll ===== */
(function(){
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if(ent.isIntersecting) ent.target.classList.add('show');
    });
  },{threshold:0.12});
  reveals.forEach(r=>io.observe(r));
})();

/* ===== Accordion (Itinerário) ===== */
(function(){
  const days = document.querySelectorAll('.itinerary .day');
  days.forEach(day=>{
    const head = day.querySelector('.day-head');
    const body = day.querySelector('.day-body');
    // open if data-open
    if(day.hasAttribute('data-open')) {
      body.style.maxHeight = body.scrollHeight + 'px';
    }
    head.addEventListener('click', ()=>{
      const isOpen = body.style.maxHeight && body.style.maxHeight !== '0px';
      if(isOpen){
        body.style.maxHeight = null;
      } else {
        // close others
        days.forEach(d=>{
          if(d !== day) d.querySelector('.day-body').style.maxHeight = null;
        });
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
    head.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' ') head.click(); });
  });
})();

/* ===== Simple Carousel w/ thumbnails ===== */
(function(){
  const carousel = document.getElementById('main-carousel');
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(track.children);
  const prevBtn = carousel.querySelector('[data-action="prev"]');
  const nextBtn = carousel.querySelector('[data-action="next"]');
  const thumbs = document.getElementById('thumbs');
  const thumbImgs = Array.from(thumbs.querySelectorAll('img'));

  // lazy load images (use data-src)
  slides.forEach(s=>{
    const img = s.querySelector('img');
    if(img && img.dataset.src){ img.src = img.dataset.src; img.removeAttribute('data-src'); }
  });

  let index = 0;
  let autoTimer = null;
  function goTo(i){
    index = (i + slides.length) % slides.length;
    const width = carousel.clientWidth;
    track.style.transform = `translateX(${-index * width}px)`;
    thumbImgs.forEach(t => t.classList.toggle('active', Number(t.dataset.index) === index));
  }
  function next(){ goTo(index+1); }
  function prev(){ goTo(index-1); }

  nextBtn.addEventListener('click', ()=>{ next(); resetAuto(); });
  prevBtn.addEventListener('click', ()=>{ prev(); resetAuto(); });

  // thumbnails click
  thumbImgs.forEach(t => {
    t.addEventListener('click', ()=>{ goTo(Number(t.dataset.index)); resetAuto(); });
  });

  // responsive - recalc on resize
  window.addEventListener('resize', ()=> goTo(index));

  // autoplay
  function startAuto(){ autoTimer = setInterval(next, 5000); }
  function resetAuto(){ clearInterval(autoTimer); startAuto(); }
  startAuto();

  // touch support
  (function(){
    let startX = 0, currentX=0, moving=false;
    carousel.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; moving=true; clearInterval(autoTimer); });
    carousel.addEventListener('touchmove', (e)=>{ if(!moving) return; currentX = e.touches[0].clientX; });
    carousel.addEventListener('touchend', ()=>{
      moving=false;
      const diff = startX - currentX;
      if(diff > 40) next();
      else if(diff < -40) prev();
      resetAuto();
    });
  })();

  // initial layout
  window.addEventListener('load', ()=> goTo(0));
})();

/* ===== Small enhancement: smooth scrolling to itinerary when button clicked ===== */
document.querySelectorAll('.btn.ghost').forEach(b=>{
  b.addEventListener('click', ()=> {
    const el = document.querySelector('.itinerary');
    if(!el) return;
    el.scrollIntoView({behavior:'smooth',block:'start'});
  });
});
