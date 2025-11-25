import { getCurrentUser, fetchCurrentUserFromApi, logoutUser } from "./users.js";
import { addContact } from "./contacts.js";
import { initPageTracking, trackInteraction } from "./analytics.js";
import { setAdminLogged } from "./admin-auth.js";

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

function setupUserStatus(user, pageId) {
  const statusEl = document.querySelector(".nav-user-status");
  const logoutBtn = document.querySelector(".nav-user-logout");
  const loginLink = document.querySelector(".nav-user-login");

  if (!statusEl) return;

  if (!user) {
    statusEl.textContent = "Você não entrou";
    if (loginLink) {
      loginLink.classList.remove("hidden");
    }
    if (logoutBtn) {
      logoutBtn.classList.add("hidden");
    }
    return;
  }

  const isAdmin = user.role === "admin";
  statusEl.textContent = isAdmin
    ? `Logado como ADM: ${user.name || user.email}`
    : `Logado como: ${user.name || user.email}`;

  if (loginLink) {
    loginLink.classList.add("hidden");
  }
  if (logoutBtn) {
    logoutBtn.classList.remove("hidden");
    logoutBtn.addEventListener("click", () => {
      // sair de qualquer página
      logoutUser();
      setAdminLogged(false);
      window.location.href = isAdmin ? "admin.html" : "index.html";
    });
  }

  // impedir admin em páginas de usuário
  const userPages = ["home", "trilhas", "trilha", "sobre", "contato", "auth"];
  if (isAdmin && userPages.includes(pageId)) {
    window.location.href = "admin.html";
  }
}

async function setupContactPage(pageId, user) {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const status = document.querySelector("#contact-status");

  if (!user) {
    if (status) {
      status.textContent = "Para enviar uma mensagem você precisa criar uma conta ou fazer login.";
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Crie uma conta ou faça login antes de enviar a mensagem.");
      window.location.href = "auth.html";
    });
    return;
  }

  if (status) {
    status.textContent = "Você está logado. Sua mensagem será associada ao seu cadastro.";
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
      trackInteraction(pageId, "contactSubmit");
      if (status) status.textContent = "Mensagem enviada! Em breve retornaremos pelo WhatsApp ou e-mail.";
      form.reset();
    } catch (err) {
      if (status) status.textContent = err.message || "Erro ao enviar mensagem.";
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  setupNav();

  const body = document.body;
  const pageId = body.dataset.page || "unknown";

  // tenta obter usuário atual
  let user = getCurrentUser();
  if (!user) {
    user = await fetchCurrentUserFromApi();
  }

  // analytics
  initPageTracking(pageId);

  // status de login / logout global
  setupUserStatus(user, pageId);

  // regras de contato
  if (pageId === "contato") {
    await setupContactPage(pageId, user);
  }
});
