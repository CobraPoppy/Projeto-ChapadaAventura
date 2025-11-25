import { isAdminLogged } from "./admin-auth.js";
import { getCurrentUser } from "./users.js";
import { getContacts, deleteContact } from "./contacts.js";

function ensureAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin" || !isAdminLogged()) {
    alert("Você precisa fazer login como administrador para ver esta página.");
    window.location.href = "admin.html";
    return false;
  }
  return true;
}

function renderContacts(list) {
  const tbody = document.getElementById("contacts-body");
  if (!tbody) return;
  tbody.innerHTML = "";
  list.forEach((c) => {
    const tr = document.createElement("tr");
    const msgPreview = (c.message || "").replace(/\s+/g, " ").slice(0, 120);
    tr.innerHTML = `
      <td>${c.created_at ? new Date(c.created_at).toLocaleString() : ""}</td>
      <td>${c.user_name || ""}</td>
      <td>${c.user_email || ""}</td>
      <td>${c.name || ""}</td>
      <td>${c.email || ""}</td>
      <td>${c.phone || ""}</td>
      <td>${msgPreview}</td>
      <td>
        <button class="btn btn-outline btn-sm" data-delete="${c.id}">Apagar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-delete");
      if (!id) return;
      const nome = btn.closest("tr")?.children[3]?.textContent || "";
      if (!confirm(\`Tem certeza que deseja apagar a mensagem de "\${nome}"? Esta ação não pode ser desfeita.\`)) {
        return;
      }
      try {
        await deleteContact(id);
        const updated = await getContacts();
        renderContacts(updated);
      } catch (err) {
        alert(err.message || "Erro ao apagar contato.");
      }
    });
  });
}

async function loadContacts() {
  try {
    const list = await getContacts();
    renderContacts(list);
  } catch (err) {
    alert(err.message || "Erro ao carregar contatos.");
  }
}

function setupCopy() {
  const btn = document.getElementById("btn-copy-contacts");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      const list = await getContacts();
      if (!list.length) {
        alert("Não há contatos para copiar.");
        return;
      }
      const header = ["Data", "Nome usuário", "E-mail usuário", "Nome formulário", "E-mail formulário", "WhatsApp", "Mensagem"];
      const lines = [header.join("\t")];
      list.forEach((c) => {
        lines.push([
          c.created_at || "",
          c.user_name || "",
          c.user_email || "",
          c.name || "",
          c.email || "",
          c.phone || "",
          (c.message || "").replace(/\s+/g, " ")
        ].join("\t"));
      });
      const text = lines.join("\n");
      await navigator.clipboard.writeText(text);
      alert("Contatos copiados para a área de transferência em formato de planilha (separado por TAB).");
    } catch (err) {
      alert(err.message || "Erro ao copiar contatos.");
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAdmin()) return;
  await loadContacts();
  setupCopy();
});
