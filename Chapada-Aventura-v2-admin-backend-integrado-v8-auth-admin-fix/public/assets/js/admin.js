import { getTrilhas, upsertTrilha, deleteTrilha, setDestaqueHome } from "./trails.js";
import { loginUser, getCurrentUser, logoutUser } from "./users.js";
import { getToken } from "./api.js";
import { isAdminLogged, setAdminLogged } from "./admin-auth.js";

function toggleSections() {
  const loginSection = document.getElementById("admin-login");
  const appSection = document.getElementById("admin-app");
  if (!loginSection || !appSection) return;
  const user = getCurrentUser();
  const ok = isAdminLogged() && user && user.role === "admin";
  if (ok) {
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
  const tbody = document.getElementById("admin-trails-body");
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
    btn.addEventListener("click", () => openForm(btn.getAttribute("data-edit")));
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

function openForm(slug) {
  const modal = document.getElementById("trail-modal");
  const form = document.getElementById("trail-form");
  const title = document.getElementById("trail-form-title");
  if (!modal || !form || !title) return;

  const trilhas = getTrilhas();
  const t = trilhas.find((x) => x.slug === slug);

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
  modal.classList.remove("hidden");
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

  toggleSections();

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      setAdminLogged(false);
      logoutUser();
      window.location.href = "auth.html";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(loginForm);
      const email = String(data.get("email") || "");
      const senha = String(data.get("senha") || "");
      if (loginStatus) loginStatus.textContent = "Verificando...";
      try {
        const user = await loginUser(email, senha);
        if (!user || user.role !== "admin") {
          if (loginStatus) loginStatus.textContent = "Apenas contas com perfil de administrador podem acessar este painel.";
          return;
        }
        setAdminLogged(true);
        if (loginStatus) loginStatus.textContent = "";
        toggleSections();
      } catch (err) {
        if (loginStatus) loginStatus.textContent = err.message || "Erro ao fazer login.";
      }
    });
  }

  if (btnNew) {
    btnNew.addEventListener("click", () => openForm(null));
  }

  if (btnCloseModal && modal) {
    btnCloseModal.addEventListener("click", () => {
      modal.classList.add("hidden");
    });
  }

    if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);

      // Primeiro decide qual imagem usar: upload ou URL
      const fileInput = document.getElementById("trail-image-file");
      let imagem = String(data.get("imagem")).trim();

      if (fileInput && fileInput.files && fileInput.files[0]) {
        try {
          const token = getToken();
          const fd = new FormData();
          fd.append("image", fileInput.files[0]);
          const headers = {};
          if (token) {
            headers["Authorization"] = "Bearer " + token;
          }
          const resp = await fetch("/api/uploads/trail-image", {
            method: "POST",
            body: fd,
            headers
          });
          const respData = await resp.json();
          if (!resp.ok) {
            throw new Error(respData.message || "Erro ao enviar imagem.");
          }
          imagem = respData.url;
        } catch (err) {
          alert(err.message || "Não foi possível enviar a imagem. Tente novamente ou use uma URL.");
          return;
        }
      }

      const trilha = {
        slug: String(data.get("slug")).trim(),
        nome: String(data.get("nome")).trim(),
        dias: String(data.get("dias")).trim(),
        nivel: String(data.get("nivel")).trim(),
        partida: String(data.get("partida")).trim(),
        resumo: String(data.get("resumo")).trim(),
        preco: String(data.get("preco")).trim(),
        imagem: imagem || "assets/img/bridge-4818827_1280.jpg",
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
