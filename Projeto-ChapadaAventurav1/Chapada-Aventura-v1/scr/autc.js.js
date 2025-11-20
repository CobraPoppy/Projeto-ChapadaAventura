document.addEventListener('DOMContentLoaded', () => {
    // ==================================
    // 1. FUNCIONALIDADE DO CARROSSEL
    // ==================================
    const carouselSlide = document.getElementById('carousel-slide');
    const slides = document.querySelectorAll('.carousel-slide .slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // Configurações
    let currentIndex = 0;
    const totalSlides = slides.length;
    const intervalTime = 10000; // 10.000 milissegundos = 10 segundos

    // Função para mover o carrossel
    function moveToSlide(index) {
        if (index >= totalSlides) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = totalSlides - 1;
        } else {
            currentIndex = index;
        }

        // Calcula a distância de deslocamento (100% * número do slide atual)
        const offset = -currentIndex * 100;
        carouselSlide.style.transform = `translateX(${offset}vw)`;
    }
  

    // Inicializa o slide
    moveToSlide(currentIndex);

    // Navegação Manual (Setas)
    prevBtn.addEventListener('click', () => {
        // Para a passagem automática temporariamente ao navegar manualmente
        clearInterval(autoSlide); 
        moveToSlide(currentIndex - 1);
        // Reinicia a passagem automática
        autoSlide = setInterval(nextSlide, intervalTime);
    });

    nextBtn.addEventListener('click', () => {
        clearInterval(autoSlide);
        moveToSlide(currentIndex + 1);
        autoSlide = setInterval(nextSlide, intervalTime);
    });

    // Função para avançar para o próximo slide
    function nextSlide() {
        moveToSlide(currentIndex + 1);
    }

    // Inicia a passagem automática a cada 10 segundos
    let autoSlide = setInterval(nextSlide, intervalTime);

    // ==================================
    // 2. FUNCIONALIDADE DO MENU HAMBÚRGUER
    // ==================================
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navLinks = document.getElementById('nav-links');

    hamburgerMenu.addEventListener('click', () => {
        // Alterna a classe 'active' para mostrar/esconder o menu
        navLinks.classList.toggle('active');
        // Alterna a classe 'active' para animar o ícone (barra -> X)
        hamburgerMenu.classList.toggle('active');
    });

    // Opcional: Fechar o menu ao clicar em um link (útil em mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
 const nextBtn = document.getElementById('nextBtn'); 
class Point {
  #x = 0;
  #y = 0;
  

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  set x(value) {
    this.#x = value;
  }

  set y(value) {
    this.#y = value;
  }
}

class Line {
  #p1;
  #p2;

  get p1() {
    return this.#p1;
  }

  get p2() {
    return this.#p2;
  }

  set p1(point) {
    this.#p1 = point;
  }

  set p2(point) {
    this.#p2 = point;
  }
}

const p1 = new Point();
p1.x = 10;
p1.y = 20;

const p2 = new Point();
p2.x = 30;
p2.y = 40;

const line = new Line();
line.p1 = p1;
line.p2 = p2;

console.log(line.p1.x, line.p1.y); // 10 20
console.log(line.p2.x, line.p2.y);q

});
