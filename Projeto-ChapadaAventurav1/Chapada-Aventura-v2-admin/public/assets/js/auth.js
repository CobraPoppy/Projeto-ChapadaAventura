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

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Login de demonstração — aqui você pode integrar com seu backend futuramente.");
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Cadastro de demonstração — aqui você pode integrar com sua API de usuários.");
    });
  }

  // estado inicial
  setActive("login-panel");
});
