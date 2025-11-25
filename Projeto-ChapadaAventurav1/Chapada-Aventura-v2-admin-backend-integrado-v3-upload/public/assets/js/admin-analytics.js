import { isAdminLogged } from "./admin-auth.js";
import { getCurrentUser } from "./users.js";
import { getAnalytics } from "./analytics.js";

function ensureAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== "admin" || !isAdminLogged()) {
    alert("Você precisa fazer login como administrador para ver esta página.");
    window.location.href = "admin.html";
    return false;
  }
  return true;
}

function msToReadable(ms) {
  const sec = Math.round(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return s + "s";
  return m + "min " + s + "s";
}

function getUsersSorted(analytics) {
  const emails = Object.keys(analytics.users || {});
  return emails
    .map((email) => analytics.users[email])
    .sort((a, b) => (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase()));
}

function renderAnalytics() {
  const tbody = document.getElementById("analytics-body");
  if (!tbody) return;

  const analytics = getAnalytics();
  const users = getUsersSorted(analytics);
  tbody.innerHTML = "";

  users.forEach((u) => {
    const pages = u.pages || {};
    let idx = 0;
    Object.keys(pages).forEach((pageId) => {
      const p = pages[pageId];
      const avgMs = p.views ? p.totalTimeMs / p.views : 0;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx === 0 ? (u.name || "") : ""}</td>
        <td>${idx === 0 ? u.email : ""}</td>
        <td>${pageId}</td>
        <td>${p.views}</td>
        <td>${msToReadable(p.totalTimeMs)}</td>
        <td>${msToReadable(avgMs)}</td>
        <td>${p.interactions.contactSubmit || 0}</td>
        <td>${p.interactions.register || 0}</td>
        <td>${p.interactions.login || 0}</td>
      `;
      tbody.appendChild(tr);
      idx += 1;
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!ensureAdmin()) return;
  renderAnalytics();
});
