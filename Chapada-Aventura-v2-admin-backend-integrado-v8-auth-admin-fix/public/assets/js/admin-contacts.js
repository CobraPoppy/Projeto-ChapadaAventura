import { getCurrentUser } from "./users.js";
import { getContacts, deleteContact } from "./contacts.js";

function ensureAdmin() {
  const user = getCurrentUser();

  if (!user) {
    alert("Você precisa fazer login como administrador para ver esta página.");
    // manda para o login central, voltando depois para esta tela
    window.location.href = "auth.html?redirect=admin-contatos.html";
    return false;
  }

  if (user.role !== "admin") {
    alert("Somente administradores podem acessar esta tela.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

// Carrega os contatos da API e preenche a tabela
async function loadContacts() {
  const tbody = document.getElementById("contacts-body");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8">Carregando contatos...</td></tr>`;

  try {
    const list = await getContacts();
    if (!list || !list.length) {
      tbody.innerHTML = `<tr><td colspan="8">Nenhum contato encontrado até o momento.</td></tr>`;
      return;
    }

    tbody.innerHTML = "";

    list.forEach((c) => {
      const tr = document.createElement("tr");

      const data = c.created_at
        ? new Date(c.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

      // Hoje o backend só envia name / email / phone / message.
      // Mantemos as colunas de "usuário" como campos separados, se um dia
      // você quiser enriquecer isso. Por enquanto ficam vazios.
      const userName = c.user_name || "";
      const userEmail = c.user_email || "";
      const formName = c.name || "";
      const formEmail = c.email || "";
      const phone = c.phone || "";
      const fullMessage = c.message || "";
      const messageStart = fullMessage.substring(0, 80);

      tr.innerHTML = `
        <td>${data}</td>
        <td>${userName}</td>
        <td>${userEmail}</td>
        <td>${formName}</td>
        <td>${formEmail}</td>
        <td>${phone}</td>
        <td title="${fullMessage.replace(/"/g, "&quot;")}">
          ${messageStart}${fullMessage.length > 80 ? "…" : ""}
        </td>
        <td>
          <button class="btn btn-outline btn-sm" data-delete-id="${c.id}">
            Apagar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Liga os botões de apagar
    tbody.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.getAttribute("data-delete-id"));
        if (!id) return;
        if (!confirm("Tem certeza que deseja apagar este contato?")) return;
        try {
          await deleteContact(id);
          const row = btn.closest("tr");
          if (row) row.remove();
        } catch (err) {
          alert(err.message || "Erro ao apagar contato.");
        }
      });
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="8">Erro ao carregar contatos. Tente novamente mais tarde.</td></tr>`;
  }
}

// Botão "Copiar tudo como planilha"
function setupCopy() {
  const btn = document.getElementById("btn-copy-contacts");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    try {
      const list = await getContacts();
      if (!list || !list.length) {
        alert("Não há contatos para copiar.");
        return;
      }

      const lines = [];
      // Cabeçalho da “planilha”
      lines.push([
        "Data",
        "Nome usuário",
        "E-mail usuário",
        "Nome formulário",
        "E-mail formulário",
        "WhatsApp",
        "Mensagem",
      ].join("\t"));

      list.forEach((c) => {
        const data = c.created_at
          ? new Date(c.created_at).toLocaleString("pt-BR")
          : "";
        const userName = c.user_name || "";
        const userEmail = c.user_email || "";
        const formName = c.name || "";
        const formEmail = c.email || "";
        const phone = c.phone || "";
        const msg = (c.message || "").replace(/\s+/g, " ");
        lines.push([
          data,
          userName,
          userEmail,
          formName,
          formEmail,
          phone,
          msg,
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
