import { getTrilhas, upsertTrilha, deleteTrilha, setDestaqueHome } from "./trails.js";

const ADMIN_USER = "admin@chapada.com";
const ADMIN_PASS = "123456";
const LOGIN_KEY = "chapada_admin_logged";

function isLogged() {
  if (typeof window === "undefined" || !window.localStorage) return false;
  return window.localStorage.getItem(LOGIN_KEY) === "1";
}

function setLogged(value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  window.localStorage.setItem(LOGIN_KEY, value ? "1" : "0");
}

function showSection(logged) {
  const loginSection = document.getElementById("admin-login");
  const appSection = document.getElementById("admin-app");
  if (!loginSection || !appSection) return;
  if (logged) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    renderTrailsTable();
    fillHomeHighlights();
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
}

function renderTrailsTable() {
  const tbody = document.querySelector("#admin-trails-body");
  if (!tbody) return;
  const trilhas = getTrilhas();
  tbody.innerHTML = "";
  trilhas.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.nome}</td>
      <td>${t.slug}</td>
      <td>${t.nivel}</td>
      <td>${t.partida}</td>
      <td>${t.dias}</td>
      <td>${t.destaqueHome ? "Sim" : "Não"}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-edit="${t.slug}">Editar</button>
        <button class="btn btn-outline btn-sm" data-delete="${t.slug}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => openFormForSlug(btn.getAttribute("data-edit")));
  });
  tbody.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.getAttribute("data-delete");
      if (confirm("Tem certeza que deseja excluir esta trilha?")) {
        deleteTrilha(slug);
        renderTrailsTable();
        fillHomeHighlights();
      }
    });
  });
}

function openFormForSlug(slug) {
  const trilhas = getTrilhas();
  const t = trilhas.find((x) => x.slug === slug);
  const form = document.getElementById("trail-form");
  const title = document.getElementById("trail-form-title");
  if (!form || !title) return;
  if (t) {
    title.textContent = "Editar trilha";
    form.slug.value = t.slug;
    form.nome.value = t.nome;
    form.dias.value = t.dias;
    form.nivel.value = t.nivel;
    form.partida.value = t.partida;
    form.resumo.value = t.resumo;
    form.preco.value = t.preco;
    form.imagem.value = t.imagem;
    form.destaqueHome.checked = !!t.destaqueHome;
    form.slug.readOnly = true;
  } else {
    title.textContent = "Nova trilha";
    form.reset();
    form.slug.readOnly = false;
  }
  document.getElementById("trail-modal").classList.remove("hidden");
}

function fillHomeHighlights() {
  const list = document.getElementById("home-highlights-list");
  if (!list) return;
  const trilhas = getTrilhas();
  list.innerHTML = "";
  trilhas.forEach((t) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.marginBottom = "0.4rem";
    li.innerHTML = `
      <span>${t.nome}</span>
      <label style="font-size:.8rem;display:flex;align-items:center;gap:.35rem;">
        <input type="checkbox" ${t.destaqueHome ? "checked" : ""} data-feature="${t.slug}" />
        Destaque na home
      </label>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll("[data-feature]").forEach((chk) => {
    chk.addEventListener("change", () => {
      const slug = chk.getAttribute("data-feature");
      setDestaqueHome(slug, chk.checked);
      renderTrailsTable();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("admin-login-form");
  const loginStatus = document.getElementById("login-status");
  const btnNew = document.getElementById("btn-new-trail");
  const modal = document.getElementById("trail-modal");
  const btnCloseModal = document.getElementById("trail-modal-close");
  const form = document.getElementById("trail-form");
  const btnLogout = document.getElementById("btn-logout");

  showSection(isLogged());

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      setLogged(false);
      showSection(false);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(loginForm);
      const email = data.get("email");
      const senha = data.get("senha");
      if (email === ADMIN_USER && senha === ADMIN_PASS) {
        setLogged(true);
        if (loginStatus) loginStatus.textContent = "";
        showSection(true);
      } else {
        if (loginStatus) loginStatus.textContent = "Credenciais inválidas. Use admin@chapada.com / 123456";
      }
    });
  }

  if (btnNew) {
    btnNew.addEventListener("click", () => openFormForSlug(null));
  }

  if (btnCloseModal && modal) {
    btnCloseModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const trilha = {
        slug: String(data.get("slug")).trim(),
        nome: String(data.get("nome")).trim(),
        dias: String(data.get("dias")).trim(),
        nivel: String(data.get("nivel")).trim(),
        partida: String(data.get("partida")).trim(),
        resumo: String(data.get("resumo")).trim(),
        preco: String(data.get("preco")).trim(),
        imagem: String(data.get("imagem")).trim() || "assets/img/bridge-4818827_1280.jpg",
        destaque: "",
        destaqueHome: data.get("destaqueHome") === "on"
      };
      if (!trilha.slug || !trilha.nome) {
        alert("Preencha ao menos o slug e o nome da trilha.");
        return;
      }
      upsertTrilha(trilha);
      modal.classList.add("hidden");
      renderTrailsTable();
      fillHomeHighlights();
    });
  }
});
