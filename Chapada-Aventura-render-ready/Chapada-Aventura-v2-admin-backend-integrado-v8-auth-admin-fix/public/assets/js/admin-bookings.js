import { getCurrentUser, logoutUser } from "./users.js";
import { getAdminBookings, updateBookingStatus, deleteBooking } from "./bookings.js";

function ensureAdmin() {
  const user = getCurrentUser();

  if (!user) {
    alert("Você precisa fazer login como administrador para ver esta página.");
    window.location.href = "auth.html?redirect=admin-agendamentos.html";
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

async function loadBookings() {
  const tbody = document.getElementById("bookings-body");
  if (!tbody) return;

  tbody.innerHTML = "<tr><td colspan=\"10\">Carregando agendamentos...</td></tr>";

  try {
    const list = await getAdminBookings();
    if (!list || !list.length) {
      tbody.innerHTML = "<tr><td colspan=\"10\">Nenhum agendamento encontrado.</td></tr>";
      return;
    }

    tbody.innerHTML = "";

    list.forEach((b) => {
      const tr = document.createElement("tr");

      const createdAt = formatDateTime(b.created_at);
      const trailDate = b.date ? new Date(b.date).toLocaleDateString("pt-BR") : "";

      const msg = b.message || "";
      const msgShort = msg.length > 80 ? msg.substring(0, 80) + "…" : msg;

      tr.innerHTML = `
        <td>${createdAt}</td>
        <td>${trailDate}</td>
        <td>${b.trail_name || ""}</td>
        <td>${b.people_count || 1}</td>
        <td>${b.customer_name || ""}</td>
        <td>${b.customer_email || ""}</td>
        <td>${b.customer_phone || ""}</td>
        <td>
          <select data-booking-status="${b.id}">
            <option value="pending"${b.status === "pending" ? " selected" : ""}>Pendente</option>
            <option value="confirmed"${b.status === "confirmed" ? " selected" : ""}>Confirmado</option>
            <option value="cancelled"${b.status === "cancelled" ? " selected" : ""}>Cancelado</option>
          </select>
        </td>
        <td title="${msg.replace(/"/g, "&quot;")}">
          ${msgShort}
        </td>
        <td>
          <button class="btn btn-outline btn-sm" data-delete-id="${b.id}">Apagar</button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // Bind status changes
    tbody.querySelectorAll("select[data-booking-status]").forEach((sel) => {
      sel.addEventListener("change", async () => {
        const id = Number(sel.getAttribute("data-booking-status"));
        const status = sel.value;
        try {
          await updateBookingStatus(id, status);
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
        if (!confirm("Tem certeza que deseja apagar este agendamento?")) return;
        try {
          await deleteBooking(id);
          const row = btn.closest("tr");
          if (row) row.remove();
        } catch (err) {
          alert(err.message || "Erro ao apagar agendamento.");
        }
      });
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan=\"10\">Erro ao carregar agendamentos.</td></tr>";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!ensureAdmin()) return;
  bindLogout();
  await loadBookings();
});
