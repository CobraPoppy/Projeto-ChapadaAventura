import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

let token = null;
const loginSection = document.getElementById("login-section");
const adminSection = document.getElementById("admin-section");
const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");
const tableBody = document.querySelector("#admin-trails-table tbody");
const modal = document.getElementById("trail-form-modal");
const form = document.getElementById("trail-form");
const formTitle = document.getElementById("trail-form-title");
const btnNew = document.getElementById("btn-new-trail");
const btnCancel = document.getElementById("trail-form-cancel");

let editingId = null;

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginStatus.textContent = "Entrando...";
  const data = Object.fromEntries(new FormData(loginForm).entries());
  try {
    const res = await apiPost("/auth/login", data);
    token = res.token;
    loginSection.classList.add("hidden");
    adminSection.classList.remove("hidden");
    loadAdminTrails();
  } catch (err) {
    loginStatus.textContent = "Credenciais inválidas";
  }
});

async function loadAdminTrails() {
  tableBody.innerHTML = "";
  const trails = await apiGet("/trails/admin/all");

  trails.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.name}</td>
      <td>${t.slug}</td>
      <td>${t.category}</td>
      <td>${t.difficulty}</td>
      <td>${t.isPublished ? "Sim" : "Não"}</td>
      <td>
        <button data-id="${t.id}" class="btn-small edit">Editar</button>
        <button data-id="${t.id}" class="btn-small danger delete">Excluir</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  tableBody.querySelectorAll(".edit").forEach((btn) =>
    btn.addEventListener("click", () => openEdit(btn.dataset.id))
  );
  tableBody.querySelectorAll(".delete").forEach((btn) =>
    btn.addEventListener("click", () => removeTrail(btn.dataset.id))
  );
}

async function openEdit(id) {
  const trails = await apiGet("/trails/admin/all");
  const trail = trails.find((t) => t.id == id);
  if (!trail) return;
  editingId = id;
  formTitle.textContent = "Editar Trilha";
  Object.entries(trail).forEach(([k, v]) => {
    if (form.elements[k]) {
      form.elements[k].value = v;
    }
  });
  form.elements["isPublished"].checked = trail.isPublished;
  modal.classList.remove("hidden");
}

btnNew.addEventListener("click", () => {
  editingId = null;
  form.reset();
  formTitle.textContent = "Nova Trilha";
  form.elements["isPublished"].checked = true;
  modal.classList.remove("hidden");
});

btnCancel.addEventListener("click", () => {
  modal.classList.add("hidden");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  data.distanceKm = Number(data.distanceKm);
  data.durationHours = Number(data.durationHours);
  data.price = Number(data.price);
  data.isPublished = form.elements["isPublished"].checked;

  if (editingId) {
    await apiPut(`/trails/${editingId}`, data, token);
  } else {
    await apiPost("/trails", data, token);
  }
  modal.classList.add("hidden");
  loadAdminTrails();
});

async function removeTrail(id) {
  if (!confirm("Excluir trilha?")) return;
  await apiDelete(`/trails/${id}`, token);
  loadAdminTrails();
}
