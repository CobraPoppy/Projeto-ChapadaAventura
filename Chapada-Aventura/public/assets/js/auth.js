import { registerUser, loginUser } from "./users.js";
import { trackInteraction } from "./analytics.js";

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".auth-tab");
  const forms = document.querySelectorAll(".auth-form");

  function setActive(target) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.target === target));
    forms.forEach((f) => f.classList.toggle("hidden", f.id !== target));
  }

  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      setActive(tab.dataset.target);
    })
  );

  const loginForm = document.getElementById("login-panel");
  const signupForm = document.getElementById("signup-panel");
  let statusEl = document.getElementById("auth-status");
  if (!statusEl) {
    statusEl = document.createElement("p");
    statusEl.id = "auth-status";
    statusEl.style.marginTop = ".7rem";
    statusEl.style.fontSize = ".85rem";
    statusEl.style.color = "var(--muted)";
    const panel = document.querySelector(".auth-panel");
    if (panel) panel.appendChild(statusEl);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailEl = document.getElementById("login-email");
      const passEl = document.getElementById("login-password");
      const email = emailEl ? emailEl.value : "";
      const senha = passEl ? passEl.value : "";
      if (statusEl) statusEl.textContent = "Entrando...";
      try {
        const user = await loginUser(email, senha);
        trackInteraction("auth", "login");
        if (statusEl) statusEl.textContent = "";
        const params = new URLSearchParams(window.location.search);
        let redirect = params.get("redirect");
        if (!redirect) {
          redirect = user && user.role === "admin" ? "admin.html" : "index.html";
        } else {
          // limpa coisas estranhas tipo admin.html?email=...&senha=...
          if (redirect.startsWith("admin.html")) redirect = "admin.html";
          if (redirect.startsWith("admin-contatos.html")) redirect = "admin-contatos.html";
        }
        window.location.href = redirect;
      } catch (err) {
        if (statusEl) statusEl.textContent = err.message || "Erro ao fazer login.";
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nameEl = document.getElementById("signup-name");
      const emailEl = document.getElementById("signup-email");
      const passEl = document.getElementById("signup-password");
      const name = nameEl ? nameEl.value : "";
      const email = emailEl ? emailEl.value : "";
      const senha = passEl ? passEl.value : "";
      if (statusEl) statusEl.textContent = "Criando conta...";
      try {
        await registerUser({ name, email, password: senha });
        trackInteraction("auth", "register");
        if (statusEl) statusEl.textContent = "Cadastro realizado com sucesso! Você já está logado.";
        setTimeout(() => {
          window.location.href = "index.html";
        }, 900);
      } catch (err) {
        if (statusEl) statusEl.textContent = err.message || "Erro ao cadastrar.";
      }
    });
  }

  setActive("login-panel");
});
