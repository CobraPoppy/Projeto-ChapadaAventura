import { getCurrentUser } from "./users.js";

const ADMIN_FLAG_KEY = "chapada_admin_logged_v2";

export function isAdminLogged() {
  const user = getCurrentUser();
  return !!(user && user.role === "admin");
}

export function setAdminLogged(value) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (!value) {
      window.localStorage.removeItem(ADMIN_FLAG_KEY);
    } else {
      window.localStorage.setItem(ADMIN_FLAG_KEY, "1");
    }
  } catch {
    // ignore
  }
}
