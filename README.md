# REEL — a free, legal movie site

A static site (no build step) with:

- **Browse & search** every movie via [TMDB](https://www.themoviedb.org/) (posters, cast, ratings, trailers, genres)
- **Where to watch** — legal streaming/rent/buy links per movie (Netflix, Prime, etc.)
- **Free Archive** — public-domain classics (*Nosferatu*, *Metropolis*, *Night of the Living Dead*, etc.) streamed for free, in-browser, via the [Internet Archive](https://archive.org)
- **Watchlist** — saved locally in the visitor's browser (no backend needed)

It's plain HTML/CSS/JS, so it runs on GitHub Pages with zero configuration.

## ⚠️ What this is (and isn't)

This is **not** a piracy site. It doesn't host or link to unauthorized copies of copyrighted films.
- Metadata (posters, cast, descriptions) comes from TMDB's public API.
- Actual free playback is limited to films whose **US copyright has expired** — meaning anyone can legally stream them.
- Everything else links out to the legitimate service that actually licenses it (Netflix, Prime Video, Tubi, etc.) via TMDB's watch-provider data.

## 1. Get a free TMDB API key

1. Create a free account at https://www.themoviedb.org/signup
2. Go to **Settings → API → Create** (choose "Developer", fill in the short form — a personal/hobby project is fine)
3. Copy your **API Key (v3 auth)**
4. Open `config.js` and paste it in:

```js
const CONFIG = {
  TMDB_API_KEY: "paste-your-key-here",
  ...
};
```

That's the only setup step. TMDB's free tier is generous (no credit card, no billing) and is meant for exactly this kind of project.

## 2. Try it locally

Just open `index.html` in a browser — or, better, run a tiny local server so `fetch()` works smoothly:

```bash
# from inside the project folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 3. Deploy to GitHub Pages

1. Create a new GitHub repo (e.g. `reel`)
2. Push all these files to the repo root (or a `/docs` folder — your choice)
3. In the repo: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: `main`, folder `/ (root)` (or `/docs` if you used that)
4. Save. GitHub gives you a URL like `https://yourusername.github.io/reel/` within a minute or two.

That's it — no build step, no server, no database. Every visitor's browser talks directly to TMDB and the Internet Archive.

## Files

| File | Purpose |
|---|---|
| `index.html` | Home page — trending, genres, free-archive teaser |
| `movie.html` | Movie detail — synopsis, cast, trailer, where to watch |
| `search.html` | Search results |
| `archive.html` | Public-domain library with an embedded player |
| `watchlist.html` | Locally-saved watchlist |
| `app.js` | Shared logic: TMDB calls, card rendering, watchlist, header/footer |
| `style.css` | The whole visual design (cinema-marquee theme) |
| `config.js` | **Put your TMDB API key here** |

## Extending it

- **Add more public-domain titles**: edit the `PUBLIC_DOMAIN_LIBRARY` array at the top of `app.js`. Find more at https://archive.org/details/feature_films — grab the identifier from the URL (`archive.org/details/<identifier>`) and its TMDB id if you want matching poster art.
- **TV shows**: TMDB has a parallel `/tv/...` API family (`/trending/tv/week`, `/tv/{id}`, `/search/tv`) — same pattern as the movie calls in `app.js`.
- **Legal free platforms**: Tubi and Pluto TV are ad-supported and fully licensed; you could add a "Watch free (ad-supported)" link using their catalogs instead of embedding video directly.
- **Note on the TMDB key**: it's visible in the page source since this is a static site — that's normal and fine for TMDB's free client-side use case, but don't reuse a key that has other permissions attached.

## Why not host pirated streams?

Sites that stream copyrighted films without a license operate illegally and routinely get taken down, sued, or blocked by ISPs — which is a bad foundation for a project you actually want to keep online. This build gets you the same "browse everything, watch some of it free" feel, built on sources you're actually allowed to use.
