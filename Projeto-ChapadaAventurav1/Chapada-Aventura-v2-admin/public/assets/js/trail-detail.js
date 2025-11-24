import { getTrilhas } from "./trails.js";

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
        ? "Uma imersão de vários dias no coração da Chapada — com caminhadas por mirantes, vales e vilas históricas, hospedagem simples em casas de moradores e refeições preparadas com carinho."
        : "Roteiro cuidadosamente desenhado para aproveitar ao máximo os mirantes, poços e cachoeiras mais impressionantes dessa região da Chapada Diamantina.";
  }
  if (priceEl) priceEl.textContent = trail.preco;
  if (zapBtn) {
    const msg = `Olá! Tenho interesse no roteiro ${trail.nome}. Pode me enviar mais detalhes?`;
    zapBtn.href = `https://wa.me/5599999999999?text=${encodeURIComponent(msg)}`;
  }
});
