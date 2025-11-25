import { apiFetch, setToken, getToken } from "./api.js";

const CURRENT_USER_KEY = "chapada_current_user_v2";

export function getCurrentUser() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    if (!user) {
      window.localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore
  }
}

export async function registerUser({ name, email, password }) {
  const payload = { name, email, password };
  const data = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (data && data.token && data.user) {
    setToken(data.token);
    setCurrentUser(data.user);
    return data.user;
  }
  throw new Error("Resposta inesperada do servidor.");
}

export async function loginUser(email, password) {
  const payload = { email, password };
  const data = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  if (data && data.token && data.user) {
    setToken(data.token);
    setCurrentUser(data.user);
    return data.user;
  }
  throw new Error("Resposta inesperada do servidor.");
}

export function logoutUser() {
  setToken(null);
  setCurrentUser(null);
}

export async function fetchCurrentUserFromApi() {
  const token = getToken();
  if (!token) return null;
  try {
    const data = await apiFetch("/api/auth/me", { method: "GET" });
    setCurrentUser(data);
    return data;
  } catch {
    logoutUser();
    return null;
  }
}
