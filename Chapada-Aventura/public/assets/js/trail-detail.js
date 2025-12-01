import { getTrilhas } from "./trails.js";
import { createBooking } from "./bookings.js";
import { createReview, getTrailReviews } from "./reviews.js";

function renderStars(rating) {
  const r = Number(rating) || 0;
  const full = "★".repeat(r);
  const empty = "☆".repeat(5 - r);
  return full + empty;
}

document.addEventListener("DOMContentLoaded", () => {
  const trilhas = getTrilhas();
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const trail = trilhas.find((t) => t.slug === slug) || trilhas[0];

  const titleEl = document.getElementById("trail-title");
  const metaEl = document.getElementById("trail-meta");
  const descEl = document.getElementById("trail-desc");
  const heroImg = document.getElementById("trail-hero-img");
  const priceEl = document.getElementById("trail-price");
  const zapBtn = document.getElementById("trail-zap");

  if (heroImg) heroImg.src = trail.imagem;
  if (titleEl) titleEl.textContent = trail.nome;
  if (metaEl) metaEl.textContent = `${trail.dias} • ${trail.nivel} • ${trail.partida}`;
  if (descEl) {
    descEl.textContent =
      trail.slug === "vale-do-pati-3-dias"
        ? "Uma imersão de vários dias no coração da Chapada — com pernoites simples em casas de moradores e refeições preparadas com carinho."
        : "Roteiro cuidadosamente desenhado para aproveitar ao máximo o dia de caminhada, passando por mirantes e cachoeiras mais impressionantes dessa região da Chapada Diamantina.";
  }
  if (priceEl) priceEl.textContent = trail.preco;
  if (zapBtn) {
    const msg = `Olá! Tenho interesse no roteiro ${trail.nome}. Pode me enviar mais detalhes?`;
    zapBtn.href = `https://wa.me/5599999999999?text=${encodeURIComponent(msg)}`;
  }

  // -------- Agendamento --------
  const bookingForm = document.getElementById("booking-form");
  const bookingStatus = document.getElementById("booking-status");

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const dateEl = document.getElementById("booking-date");
      const peopleEl = document.getElementById("booking-people");
      const nameEl = document.getElementById("booking-name");
      const emailEl = document.getElementById("booking-email");
      const phoneEl = document.getElementById("booking-phone");
      const msgEl = document.getElementById("booking-message");

      const date = dateEl && dateEl.value;
      const peopleCount = peopleEl && peopleEl.value;
      const customerName = nameEl && nameEl.value;
      const customerEmail = emailEl && emailEl.value;
      const customerPhone = phoneEl && phoneEl.value;
      const message = msgEl && msgEl.value;

      if (!date) {
        if (bookingStatus) bookingStatus.textContent = "Escolha uma data para o agendamento.";
        return;
      }

      if (bookingStatus) {
        bookingStatus.textContent = "Enviando solicitação de agendamento...";
      }

      try {
        await createBooking({
          trailSlug: trail.slug,
          trailName: trail.nome,
          date,
          timeSlot: "",
          peopleCount,
          customerName,
          customerEmail,
          customerPhone,
          message
        });
        if (bookingStatus) {
          bookingStatus.textContent = "Solicitação enviada com sucesso! O guia entrará em contato para confirmar a disponibilidade.";
        }
        bookingForm.reset();
      } catch (err) {
        if (bookingStatus) {
          bookingStatus.textContent = err && err.message ? err.message : "Erro ao enviar agendamento. Tente novamente mais tarde.";
        }
      }
    });
  }

  // -------- Avaliações --------
  const reviewsListEl = document.getElementById("reviews-list");
  const reviewForm = document.getElementById("review-form");
  const reviewStatus = document.getElementById("review-status");

  async function loadReviews() {
    if (!reviewsListEl) return;
    reviewsListEl.innerHTML = "<p class=\"muted\">Carregando avaliações...</p>";
    try {
      const data = await getTrailReviews(trail.slug);
      const reviews = (data && data.reviews) || [];
      const stats = data && data.stats;

      if (!reviews.length) {
        reviewsListEl.innerHTML = "<p class=\"muted\">Ainda não há avaliações para esta trilha. Seja o primeiro a avaliar!</p>";
        return;
      }

      const list = document.createElement("div");
      list.className = "reviews-list-inner";

      reviews.forEach((r) => {
        const item = document.createElement("article");
        item.className = "review-item";

        const created =
          r.created_at &&
          new Date(r.created_at).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          });

        item.innerHTML = `
          <header class="review-header">
            <div class="review-author">
              <strong>${r.author_name || "Visitante"}</strong>
              ${created ? `<span class="review-date">${created}</span>` : ""}
            </div>
            <div class="review-rating">
              <span class="stars">${renderStars(r.rating || 0)}</span>
              <span class="rating-number">${r.rating || 0}/5</span>
            </div>
          </header>
          <p class="review-comment">
            ${(r.comment || "").trim() || "<em>Sem comentário escrito.</em>"}
          </p>
        `;
        list.appendChild(item);
      });

      reviewsListEl.innerHTML = "";
      reviewsListEl.appendChild(list);

      const badge = document.getElementById("trail-rating-badge");
      if (badge && stats) {
        const avg = stats.average || 0;
        const count = stats.count || 0;
        badge.textContent = `${avg.toFixed(1)} • ${count} avaliação(ões)`;
      }
    } catch (err) {
      console.error(err);
      reviewsListEl.innerHTML = "<p class=\"muted\">Erro ao carregar avaliações.</p>";
    }
  }

  if (reviewForm) {
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nameEl = document.getElementById("review-name");
      const ratingEl = document.getElementById("review-rating");
      const emailEl = document.getElementById("review-email");
      const commentEl = document.getElementById("review-comment");

      const authorName = nameEl && nameEl.value;
      const rating = ratingEl && ratingEl.value;
      const authorEmail = emailEl && emailEl.value;
      const comment = commentEl && commentEl.value;

      if (!rating) {
        if (reviewStatus) {
          reviewStatus.textContent = "Selecione uma nota para a trilha.";
        }
        return;
      }

      if (reviewStatus) {
        reviewStatus.textContent = "Enviando avaliação...";
      }

      try {
        await createReview({
          trailSlug: trail.slug,
          trailName: trail.nome,
          rating,
          authorName,
          authorEmail,
          comment
        });

        if (reviewStatus) {
          reviewStatus.textContent = "Avaliação enviada com sucesso! Assim que for aprovada pelo administrador, aparecerá nesta página.";
        }
        reviewForm.reset();
      } catch (err) {
        if (reviewStatus) {
          reviewStatus.textContent = err && err.message ? err.message : "Erro ao enviar avaliação. Tente novamente.";
        }
      }
    });
  }

  loadReviews();
});
