// ────────────────────────────────────────────────────────────
//  REEL — shared app logic
//  Loaded on every page after config.js
// ────────────────────────────────────────────────────────────

/* ---------- TMDB fetch helper ---------- */
async function tmdb(path, params = {}) {
  const url = new URL(`${CONFIG.TMDB_BASE}${path}`);
  url.searchParams.set("api_key", CONFIG.TMDB_API_KEY);
  url.searchParams.set("language", "en-US");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB request failed (${res.status}). Check your API key in config.js.`);
  }
  return res.json();
}

function posterUrl(path, size = CONFIG.IMG_BASE) {
  return path ? `${size}${path}` : null;
}

/* ---------- Watchlist (localStorage, per-browser) ---------- */
const Watchlist = {
  KEY: "reel_watchlist",
  all() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY)) || [];
    } catch {
      return [];
    }
  },
  has(id) {
    return this.all().some((m) => m.id === id);
  },
  toggle(movie) {
    const list = this.all();
    const idx = list.findIndex((m) => m.id === movie.id);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(movie);
    }
    localStorage.setItem(this.KEY, JSON.stringify(list));
    return this.has(movie.id);
  },
};

/* ---------- Public-domain library ----------
   Curated titles that are genuinely in the public domain (US),
   streamed via Internet Archive's embeddable player — legal to
   host/link, no video files stored in this repo. TMDB id (if any)
   is used to pull matching poster/metadata; "ia" is the Internet
   Archive identifier used for the embedded player.
------------------------------------------------ */
const PUBLIC_DOMAIN_LIBRARY = [
  { title: "Night of the Living Dead", year: 1968, ia: "night_of_the_living_dead", tmdbId: 383 },
  { title: "His Girl Friday", year: 1940, ia: "His_Girl_Friday", tmdbId: 3082 },
  { title: "The Cabinet of Dr. Caligari", year: 1920, ia: "TheCabinetOfDrCaligari1920", tmdbId: 291 },
  { title: "Nosferatu", year: 1922, ia: "Nosferatu1922", tmdbId: 653 },
  { title: "Metropolis", year: 1927, ia: "Metropolis_201612", tmdbId: 19 },
  { title: "The General", year: 1926, ia: "TheGeneral1926", tmdbId: 888 },
  { title: "Charade", year: 1963, ia: "charade1963", tmdbId: 894 },
  { title: "D.O.A.", year: 1950, ia: "DOA_1950", tmdbId: 30320 },
  { title: "The Phantom of the Opera", year: 1925, ia: "ThePhantomOfTheOpera1925", tmdbId: 725 },
  { title: "A Trip to the Moon", year: 1902, ia: "LeVoyageDansLaLune", tmdbId: 653 },
  { title: "Plan 9 from Outer Space", year: 1959, ia: "Plan9fromOuterSpace1959", tmdbId: 17217 },
  { title: "The Little Shop of Horrors", year: 1960, ia: "LittleShopOfHorrors1960", tmdbId: 297 },
];

/* ---------- Header / Footer injection ---------- */
function renderChrome(activePage = "") {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  if (header) {
    header.innerHTML = `
      <div class="wrap">
        <a href="index.html" class="brand">REEL<span class="dot">.</span></a>
        <form class="search-form" action="search.html" method="get">
          <input type="search" name="q" placeholder="Search movies & shows…" aria-label="Search movies">
        </form>
        <nav class="main-nav" aria-label="Main">
          <a href="index.html" class="${activePage === "home" ? "active" : ""}">Browse</a>
          <a href="archive.html" class="${activePage === "archive" ? "active" : ""}">Free Archive</a>
          <a href="watchlist.html" class="${activePage === "watchlist" ? "active" : ""}">My List</a>
        </nav>
      </div>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <div class="wrap">
        <div>REEL — a free, open movie guide. Metadata via TMDB. Public-domain films streamed via the Internet Archive.</div>
        <div>Not affiliated with any studio or streaming service.</div>
      </div>
    `;
  }
}

/* ---------- Card rendering ---------- */
function movieCard(movie, { pdBadge = false } = {}) {
  const poster = posterUrl(movie.poster_path);
  const year = (movie.release_date || "").slice(0, 4) || movie.year || "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;
  const inList = Watchlist.has(movie.id);

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <a href="movie.html?id=${movie.id}" style="display:block">
      <div class="poster-wrap">
        ${poster
          ? `<img src="${poster}" alt="${escapeHtml(movie.title)} poster" loading="lazy">`
          : `<div class="no-poster">${escapeHtml(movie.title)}</div>`}
        ${rating ? `<span class="rating-badge">★ ${rating}</span>` : ""}
        ${pdBadge ? `<span class="pd-badge">Free</span>` : ""}
      </div>
      <div class="meta">
        <div class="title">${escapeHtml(movie.title)}</div>
        <div class="year">${year}</div>
      </div>
    </a>
    <button class="watchlist-toggle ${inList ? "active" : ""}"
      aria-label="${inList ? "Remove from" : "Add to"} watchlist" title="Watchlist">
      ${inList ? "✓" : "+"}
    </button>
  `;
  const btn = card.querySelector(".watchlist-toggle");
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const nowIn = Watchlist.toggle({
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
    });
    btn.classList.toggle("active", nowIn);
    btn.textContent = nowIn ? "✓" : "+";
    btn.setAttribute("aria-label", nowIn ? "Remove from watchlist" : "Add to watchlist");
  });
  return card;
}

function renderShelf(container, movies, opts = {}) {
  container.innerHTML = "";
  if (!movies || movies.length === 0) {
    container.innerHTML = `<div class="state-msg">Nothing here yet.</div>`;
    return;
  }
  movies.forEach((m) => container.appendChild(movieCard(m, opts)));
}

/* ---------- Loading / error states ---------- */
function showLoading(container, label = "Loading…") {
  container.innerHTML = `
    <div class="state-msg">
      <div class="spinner"></div>
      <div>${label}</div>
    </div>
  `;
}
function showError(container, message) {
  container.innerHTML = `
    <div class="state-msg">
      <div class="display">Something went sideways</div>
      <div>${escapeHtml(message)}</div>
    </div>
  `;
}

/* ---------- Utils ---------- */
function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function qs(name) {
  return new URLSearchParams(window.location.search).get(name);
}
