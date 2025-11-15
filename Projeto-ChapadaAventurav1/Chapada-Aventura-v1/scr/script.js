
document.addEventListener('DOMContentLoaded', () => {
  // mobile menu
  const menuBtn = document.getElementById('menuBtn');
  const mainNav = document.getElementById('mainNav');
  menuBtn && menuBtn.addEventListener('click', () => mainNav.classList.toggle('show'));

  // carousel
  const slides = Array.from(document.querySelectorAll('.slide'));
  let idx = 0;
  function show(i){
    slides.forEach(s => s.classList.remove('active'));
    slides[i].classList.add('active');
  }
  if(slides.length) show(0);
  document.getElementById('next').addEventListener('click', ()=> { idx = (idx+1) % slides.length; show(idx); });
  document.getElementById('prev').addEventListener('click', ()=> { idx = (idx-1+slides.length) % slides.length; show(idx); });
  setInterval(()=> { idx = (idx+1) % slides.length; show(idx); }, 6000);
});

document.addEventListener('DOMContentLoaded', () => {
  const dropbtn = document.getElementById('meubotao');
  const roteirodrop = document.querySelector('.dropdown-content');

  dropbtn.onclick = function() {
    if (roteirodrop.style.display === 'block') {
      roteirodrop.style.display = 'none';
    } else {
      roteirodrop.style.display = 'block';
    }
  };
  
});
document.addEventListener('click', (event) => {
  const dropbtn = document.getElementById('meubotao');
  const roteirodrop = document.querySelector('.dropdown-content');

  if (!dropbtn.contains(event.target)) {
    roteirodrop.style.display = 'none';
  }
});