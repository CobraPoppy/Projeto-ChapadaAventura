document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector("nav.main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const contactForm = document.querySelector("#contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button[type=submit]");
      const status = document.querySelector("#contact-status");
      if (btn) btn.disabled = true;
      if (status) status.textContent = "Enviando...";
      setTimeout(() => {
        if (status) status.textContent = "Mensagem enviada! Em breve retornaremos pelo WhatsApp ou e-mail.";
        contactForm.reset();
        if (btn) btn.disabled = false;
      }, 900);
    });
  }
});
