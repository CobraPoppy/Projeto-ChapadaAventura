import { apiFetch } from "./api.js";

export async function addContact(contact) {
  const data = await apiFetch("/api/contacts", {
    method: "POST",
    body: JSON.stringify(contact)
  });
  return data;
}

export async function getContacts() {
  const data = await apiFetch("/api/admin/contacts", {
    method: "GET"
  });
  return data;
}

export async function deleteContact(id) {
  await apiFetch(`/api/admin/contacts/${id}`, {
    method: "DELETE"
  });
}
