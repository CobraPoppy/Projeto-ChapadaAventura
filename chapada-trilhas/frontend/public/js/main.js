import { apiGet, apiPost } from "./api.js";

const path = window.location.pathname;

if (path.endsWith("index.html") || path === "/") {
  loadHome();
} else if (path.endsWith("trilhas.html")) {
  loadTrilhas();
} else if (path.endsWith("trilha.html")) {
  loadTrilhaDetail();
} else if (path.endsWith("contato.html")) {
  setupContactForm();
}

async function loadHome() {
  const container = document.getElementById("home-trails");
  if (!container) return;
  const trails = await apiGet("/trails");
  trails.slice(0, 3).forEach((t) => container.appendChild(createTrailCard(t)));
}

async function loadTrilhas() {
  const list = document.getElementById("trails-list");
  const selectCat = document.getElementById("filter-category");
  const selectDiff = document.getElementById("filter-difficulty");
  const trails = await apiGet("/trails");

  function render() {
    list.innerHTML = "";
    const cat = selectCat.value;
    const diff = selectDiff.value;
    trails
      .filter((t) => (!cat || t.category === cat) && (!diff || t.difficulty === diff))
      .forEach((t) => list.appendChild(createTrailCard(t)));
  }

  selectCat.addEventListener("change", render);
  selectDiff.addEventListener("change", render);
  render();
}

async function loadTrilhaDetail() {
  const container = document.getElementById("trail-detail");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  if (!slug) {
    container.textContent = "Trilha não encontrada";
    return;
  }
  const trail = await apiGet(`/trails/${slug}`);
  document.title = trail.name + " - Chapada Diamantina";

  container.innerHTML = `
    <section class="trail-detail fade-in">
      <img src="${trail.mainImageUrl || "https://placehold.co/800x400"}" alt="${trail.name}" class="trail-image" />
      <h1>${trail.name}</h1>
      <p class="trail-meta">
        ${trail.location} · ${trail.distanceKm} km · ${trail.durationHours} h · 
        <strong>${trail.difficulty.toUpperCase()}</strong> · ${trail.category.toUpperCase()}
      </p>
      <p>${trail.description}</p>
      <p class="trail-price">Valor a partir de R$ ${trail.price.toFixed(2)}</p>
      <a class="btn" href="https://wa.me/5599999999999?text=Tenho interesse na trilha ${encodeURIComponent(trail.name)}" target="_blank">
        Falar com guia no WhatsApp
      </a>
    </section>
  `;
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("contact-status");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());
    statusEl.textContent = "Enviando...";
    try {
      await apiPost("/contacts", body);
      statusEl.textContent = "Mensagem enviada com sucesso!";
      form.reset();
    } catch (err) {
      statusEl.textContent = "Erro ao enviar mensagem.";
    }
  });
}

function createTrailCard(t) {
  const div = document.createElement("article");
  div.className = "card fade-in";
  div.innerHTML = `
    <img src="${t.mainImageUrl || "https://placehold.co/600x300"}" alt="${t.name}" />
    <div class="card-body">
      <h3>${t.name}</h3>
      <p>${t.location}</p>
      <p>${t.distanceKm} km · ${t.durationHours} h · ${t.difficulty.toUpperCase()}</p>
      <p class="price">R$ ${t.price.toFixed(2)}</p>
      <a class="btn" href="trilha.html?slug=${t.slug}">Ver detalhes</a>
    </div>
  `;
  return div;
}
