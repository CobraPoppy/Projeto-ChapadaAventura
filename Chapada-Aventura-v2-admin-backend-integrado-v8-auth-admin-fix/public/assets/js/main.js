
import { addContact } from "./contacts.js";
import { initPageTracking } from "./analytics.js";

function setupNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector("nav.main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
}

function setupContactPage() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const status = document.querySelector("#contact-status");

  if (status) {
    status.textContent = "Preencha os dados abaixo e entraremos em contato pelo e-mail ou WhatsApp informado.";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    if (btn) btn.disabled = true;
    if (status) status.textContent = "Enviando...";

    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      message: data.get("message")
    };

    try {
      await addContact(payload);
      if (status) status.textContent = "Mensagem enviada com sucesso! Em breve retornaremos.";
      form.reset();
    } catch (err) {
      if (status) status.textContent = err.message || "Erro ao enviar mensagem.";
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setupNav();

  const body = document.body;
  const pageId = body.dataset.page || "unknown";

  initPageTracking(pageId);

  if (pageId === "contato") {
    setupContactPage();
  }
});
