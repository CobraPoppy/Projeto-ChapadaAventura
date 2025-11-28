import { apiFetch } from "./api.js";

export async function createReview(payload) {
  const data = await apiFetch("/api/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function getTrailReviews(slug) {
  const params = new URLSearchParams({ slug });
  const data = await apiFetch(`/api/reviews?${params.toString()}`, {
    method: "GET",
  });
  return data;
}

export async function getAdminReviews() {
  const data = await apiFetch("/api/admin/reviews", {
    method: "GET",
  });
  return data;
}

export async function updateReviewStatus(id, status) {
  const data = await apiFetch(`/api/admin/reviews/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  return data;
}

export async function deleteReview(id) {
  await apiFetch(`/api/admin/reviews/${id}`, {
    method: "DELETE",
  });
}
