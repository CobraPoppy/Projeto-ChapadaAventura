import { apiFetch } from "./api.js";

export async function createBooking(payload) {
  const data = await apiFetch("/api/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function getAdminBookings() {
  const data = await apiFetch("/api/admin/bookings", {
    method: "GET",
  });
  return data;
}

export async function updateBookingStatus(id, status) {
  const data = await apiFetch(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data;
}

export async function deleteBooking(id) {
  await apiFetch(`/api/admin/bookings/${id}`, {
    method: "DELETE",
  });
}
