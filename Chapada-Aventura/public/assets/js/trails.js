const STORAGE_KEY = "chapada_trilhas_v2";

const defaultTrilhas = [
  {
    slug: "morro-do-pai-inacio",
    nome: "Morro do Pai Inácio",
    dias: "1 dia",
    nivel: "Moderado",
    partida: "Lençóis — BA",
    resumo: "Subida clássica da Chapada com vista panorâmica para vales e serras.",
    preco: "A partir de R$ 180",
    imagem: "assets/img/cliff-5155326_1280.jpg",
    destaque: "Pôr do sol inesquecível",
    destaqueHome: true
  },
  {
    slug: "vale-do-pati-3-dias",
    nome: "Vale do Pati — 3 dias",
    dias: "3 dias • 2 noites",
    nivel: "Intenso",
    partida: "Guia local • Vale do Capão ou Andaraí",
    resumo: "Travessia por um dos vales mais lindos do Brasil, com pernoites em casas de nativos.",
    preco: "A partir de R$ 1.450",
    imagem: "assets/img/nature-2331858_1280.jpg",
    destaque: "Vale considerado um dos mais bonitos do mundo",
    destaqueHome: true
  },
  {
    slug: "cachoeira-da-fumaca",
    nome: "Cachoeira da Fumaça — 4 dias",
    dias: "3 / 4 dias",
    nivel: "Difícil",
    partida: "Geralmente Vale do Capão ou Ibicoara",
    resumo: "Caminhada por cânions, mirantes e cachoeiras icônicas da Chapada Diamantina.",
    preco: "A partir de R$ 980",
    imagem: "assets/img/waterfall-2472165_1280.jpg",
    destaque: "Abismo impressionante com mais de 300 m",
    destaqueHome: true
  }
];

let trilhasCache = null;

function safeLoadFromStorage() {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function safeSaveToStorage(data) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

function ensureLoaded() {
  if (trilhasCache) return;
  const fromStorage = safeLoadFromStorage();
  if (fromStorage && fromStorage.length) {
    trilhasCache = fromStorage;
  } else {
    trilhasCache = defaultTrilhas.map((t) => ({ ...t }));
    safeSaveToStorage(trilhasCache);
  }
}

export function getTrilhas() {
  ensureLoaded();
  return [...trilhasCache];
}

export function getTrilhaBySlug(slug) {
  ensureLoaded();
  return trilhasCache.find((t) => t.slug === slug) || null;
}

export function setTrilhas(list) {
  trilhasCache = list.map((t) => ({ ...t }));
  safeSaveToStorage(trilhasCache);
}

export function upsertTrilha(trail) {
  ensureLoaded();
  const idx = trilhasCache.findIndex((t) => t.slug === trail.slug);
  if (idx >= 0) {
    trilhasCache[idx] = { ...trilhasCache[idx], ...trail };
  } else {
    trilhasCache.push({ ...trail });
  }
  safeSaveToStorage(trilhasCache);
}

export function deleteTrilha(slug) {
  ensureLoaded();
  trilhasCache = trilhasCache.filter((t) => t.slug !== slug);
  safeSaveToStorage(trilhasCache);
}

export function setDestaqueHome(slug, destaqueHome) {
  ensureLoaded();
  trilhasCache = trilhasCache.map((t) =>
    t.slug === slug ? { ...t, destaqueHome: !!destaqueHome } : t
  );
  safeSaveToStorage(trilhasCache);
}

export function getFeaturedTrilhas(max = 3) {
  ensureLoaded();
  const featured = trilhasCache.filter((t) => t.destaqueHome);
  const list = featured.length ? featured : trilhasCache;
  return list.slice(0, max);
}

export function renderTrilhas(containerId, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;

  const { featuredOnly = false } = options;
  const trilhas = featuredOnly ? getFeaturedTrilhas() : getTrilhas();

  el.innerHTML = "";
  trilhas.forEach((t) => {
    const card = document.createElement("article");
    card.className = "trail-card";
    card.innerHTML = `
      <div class="trail-thumb">
        <img src="${t.imagem}" alt="${t.nome}">
        <div class="trail-chip">${t.dias}</div>
      </div>
      <div class="trail-body">
        <h3 class="trail-title">${t.nome}</h3>
        <div class="trail-meta">${t.nivel} • ${t.partida}</div>
        <p class="trail-meta">${t.resumo}</p>
        <div class="trail-footer">
          <span class="price-tag">${t.preco}</span>
          <a href="trilha.html?slug=${t.slug}" class="btn btn-outline">Ver detalhes</a>
        </div>
      </div>
    `;
    el.appendChild(card);
  });
}
