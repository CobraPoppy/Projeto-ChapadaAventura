import { getCurrentUser, logoutUser } from "./users.js";
import { getAdminReviews, updateReviewStatus, deleteReview } from "./reviews.js";

function ensureAdmin() {
  const user = getCurrentUser();

  if (!user) {
    alert("Você precisa fazer login como administrador para ver esta página.");
    window.location.href = "auth.html?redirect=admin-avaliacoes.html";
    return false;
  }

  if (user.role !== "admin") {
    alert("Somente administradores podem acessar esta tela.");
    window.location.href = "index.html";
    return false;
  }

  return true;
}

function bindLogout() {
  const btnLogout = document.getElementById("btn-logout");
  if (!btnLogout) return;
  btnLogout.addEventListener("click", () => {
    logoutUser();
    window.location.href = "auth.html";
  });
}

function formatDateTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function renderStars(rating) {
  const r = Number(rating) || 0;
  const full = "★".repeat(r);
  const empty = "☆".repeat(5 - r);
  return full + empty;
}

async function loadReviews() {
  const tbody = document.getElementById("reviews-body");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan=\"8\">Carregando avaliações...</td></tr>";

  try {
    const list = await getAdminReviews();
    if (!list || !list.length) {
      tbody.innerHTML = "<tr><td colspan=\"8\">Nenhuma avaliação encontrada.</td></tr>";
      return;
    }

    tbody.innerHTML = "";

    list.forEach((r) => {
      const tr = document.createElement("tr");

      const created = formatDateTime(r.created_at);
      const comment = (r.comment || "").trim();
      const shortComment = comment.length > 80 ? comment.substring(0, 80) + "…" : comment;

      tr.innerHTML = `
        <td>${created}</td>
        <td>${r.trail_name || ""}</td>
        <td>
          <span class="stars">${renderStars(r.rating || 0)}</span>
          <span class="rating-number">${r.rating || 0}/5</span>
        </td>
        <td>${r.author_name || ""}</td>
        <td>${r.author_email || ""}</td>
        <td title="${comment.replace(/"/g, "&quot;")}">
          ${shortComment || "<em>Sem comentário escrito.</em>"}
        </td>
        <td>
          <select data-review-status="${r.id}">
            <option value="pending"${r.status === "pending" ? " selected" : ""}>Pendente</option>
            <option value="approved"${r.status === "approved" ? " selected" : ""}>Aprovada</option>
            <option value="rejected"${r.status === "rejected" ? " selected" : ""}>Rejeitada</option>
          </select>
        </td>
        <td>
          <button class="btn btn-outline btn-sm" data-delete-id="${r.id}">Apagar</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Bind status changes
    tbody.querySelectorAll("select[data-review-status]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        const id = Number(sel.getAttribute("data-review-status"));
        const status = sel.value;
        try {
          await updateReviewStatus(id, status);
        } catch (err) {
          alert(err.message || "Erro ao atualizar status.");
        }
      });
    });

    // Bind delete buttons
    tbody.querySelectorAll("[data-delete-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = Number(btn.getAttribute("data-delete-id"));
        if (!id) return;
        if (!confirm("Tem certeza que deseja apagar esta avaliação?")) return;
        try {
          await deleteReview(id);
          const row = btn.closest("tr");
          if (row) row.remove();
        } catch (err) {
          alert(err.message || "Erro ao apagar avaliação.");
        }
      });
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan=\"8\">Erro ao carregar avaliações.</td></tr>";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAdmin()) return;
  bindLogout();
  await loadReviews();
});
