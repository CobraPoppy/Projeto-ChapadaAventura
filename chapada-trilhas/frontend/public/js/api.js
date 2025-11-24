const API_BASE = window.location.origin.replace(":80", "") + "/api";

export async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function apiPost(path, body, token) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Erro na API");
  }
  return res.json();
}

export async function apiPut(path, body, token) {
  const res = await fetch(API_BASE + path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function apiDelete(path, token) {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Erro na API");
}
