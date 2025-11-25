import { getCurrentUser } from "./users.js";

const ADMIN_FLAG_KEY = "chapada_admin_logged_v2";

export function isAdminLogged() {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const user = getCurrentUser();
  if (!user || user.role !== "admin") return false;
  try {
    return window.localStorage.getItem(ADMIN_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function setAdminLogged(value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(ADMIN_FLAG_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}
