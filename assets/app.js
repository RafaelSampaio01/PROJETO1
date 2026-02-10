/* =========================
   CONFIGURAÇÃO (edite aqui)
========================= */

const CONFIG = {
  products: [
    {
      id: "mihu_s3",
      label: "MIHU S3",
      sub: "v2.0",
      img: "assets/img/MIHU-S3.png",
    },
    {
      id: "mihu_m1",
      label: "MIHU M1",
      sub: "v2.0",
      img: "assets/img/MIHU-LEDS.png",
    },
  ],

  // Modos que aparecem na tela 2
  modes: [
    { id: "blocos", label: "BLOCOS", icon: "🧩" },
    { id: "fluxograma", label: "FLUXOGRAMA", icon: "🔷" },
    { id: "texto", label: "TEXTO", icon: "⌨️" },
  ],

  // ✅ Rotas globais (independe do produto)
  // Ajuste aqui de acordo com suas pastas
  globalRoutes: {
    blocos: "editorBlock/index.html",
    texto: "editorText/index.html",
    fluxograma: "editorFlow/index.html", // <- troque se seu fluxograma estiver em outro lugar
  },
};

/* =========================
   Helpers
========================= */
const $ = (sel) => document.querySelector(sel);

function toast(msg) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("show"), 1800);
}

function getQueryParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

function placeholderSVG(title = "IMG") {
  const safe = (title || "IMG").replace(/[<>&"]/g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="240" height="180">
    <defs>
      <linearGradient id="g" x1="0" x2="1">
        <stop offset="0" stop-color="rgba(255,255,255,.10)"/>
        <stop offset="1" stop-color="rgba(255,255,255,.04)"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" rx="22" ry="22" fill="url(#g)"/>
    <text x="50%" y="52%" text-anchor="middle" font-family="Nunito, Arial" font-size="26"
      fill="rgba(255,255,255,.75)" font-weight="900">${safe}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function scrollByCard(track, dir) {
  const first = track?.querySelector(".card");
  if (!first) return;
  const style = window.getComputedStyle(track);
  const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
  const delta = first.getBoundingClientRect().width + gap;
  track.scrollBy({ left: dir * delta, behavior: "smooth" });
}

function bindCarouselNav(track) {
  const prev = $("#btnPrev");
  const next = $("#btnNext");
  if (prev) prev.addEventListener("click", () => scrollByCard(track, -1));
  if (next) next.addEventListener("click", () => scrollByCard(track, +1));

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") scrollByCard(track, -1);
    if (e.key === "ArrowRight") scrollByCard(track, +1);
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   Tela 1: Produtos
========================= */
function initProducts() {
  const track = $("#productTrack");
  if (!track) return;

  track.innerHTML = "";

  CONFIG.products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Selecionar ${p.label}`);

    const imgSrc = p.img || placeholderSVG(p.label);

    card.innerHTML = `
      <div class="card-top">
        <img class="card-img" alt="${escapeHtml(p.label)}" src="${imgSrc}" />
      </div>
      <div>
        <div class="card-label">${escapeHtml(p.label)}</div>
        ${p.sub ? `<div class="card-sub">${escapeHtml(p.sub).replace(/\n/g, "<br>")}</div>` : `<div class="card-sub">&nbsp;</div>`}
      </div>
    `;

    const img = card.querySelector("img");
    img.addEventListener("error", () => {
      img.src = placeholderSVG(p.label);
    });

    const go = () => {
      localStorage.setItem("selected_product_id", p.id);
      window.location.href = `mode.html?product=${encodeURIComponent(p.id)}`;
    };

    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });

    track.appendChild(card);
  });

  bindCarouselNav(track);
}

/* =========================
   Tela 2: Modos
========================= */
function initModes() {
  const track = $("#modeTrack");
  if (!track) return;

  const productId = getQueryParam("product") || localStorage.getItem("selected_product_id");
  const product = CONFIG.products.find((p) => p.id === productId);

  const labelEl = $("#selectedProductLabel");
  if (labelEl) {
    labelEl.textContent = product ? `Produto: ${product.label}` : "Produto: (não selecionado)";
  }

  const back = $("#btnBack");
  if (back) {
    back.addEventListener("click", () => (window.location.href = "index.html"));
  }

  track.innerHTML = "";

  CONFIG.modes.forEach((m) => {
    const card = document.createElement("div");
    card.className = "card mode";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Abrir modo ${m.label}`);

    card.innerHTML = `
      <div class="card-top">
        <div class="mode-icon">${m.icon}</div>
      </div>
      <div>
        <div class="card-label">${escapeHtml(m.label)}</div>
        <div class="card-sub">&nbsp;</div>
      </div>
    `;

    const go = () => {
      if (!product) {
        toast("Selecione um produto primeiro.");
        return;
      }

      // ✅ rota global por modo
      const target = CONFIG.globalRoutes?.[m.id];

      if (!target) {
        toast("Rota não configurada para este modo.");
        return;
      }

      // passa o produto/mode para o editor
      const url = new URL(target, window.location.href);
      url.searchParams.set("product", product.id);
      url.searchParams.set("mode", m.id);

      window.location.href = url.toString();
    };

    card.addEventListener("click", go);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });

    track.appendChild(card);
  });

  bindCarouselNav(track);
}

/* =========================
   Boot
========================= */
(function boot() {
  const page = document.body?.dataset?.page;
  if (page === "products") initProducts();
  if (page === "modes") initModes();
})();
