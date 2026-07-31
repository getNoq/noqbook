# noqbook — Frontend Prototype

A Vite + React + TypeScript + Tailwind recreation of the noqbook landing page,
meant to be dropped in as the frontend of a Django backend project.

## Getting started

```bash
npm install
npm run dev
```

Opens at http://localhost:5173.

## Project structure

```
src/
  components/     # One component per landing-page section
  lib/api.ts      # Fetch wrapper, ready to point at your Django API
  App.tsx         # Composes all sections
  index.css       # Tailwind entry + small utility classes
```

Everything is broken into self-contained section components
(`Navbar`, `Hero`, `HowItWorks`, `ProblemSection`, `LogShareKnow`,
`Lifestyle`, `DailyGlance`, `Pricing`, `FinalCta`, `Footer`) so you can
reorder, delete, or restyle sections independently.

## Wiring up the Django backend later

- Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` to your Django
  server's URL (e.g. `http://localhost:8000`), **or**
- Uncomment the `server.proxy` block in `vite.config.ts` to proxy `/api`
  requests to Django during local dev (avoids CORS entirely).
- Use `apiFetch` in `src/lib/api.ts` as the base for real requests — swap the
  stat numbers in `DailyGlance`, the plan data in `Pricing`, etc. for data
  fetched from your Django REST endpoints.

## Notes on the current build

- All copy, numbers (₦128,400 etc.), and images are placeholders recreated
  from the original design reference — swap them for real content/assets.
- Images currently point to Unsplash URLs as stand-ins; replace with your
  own product screenshots and photography.
- Colors/type live in `tailwind.config.js` (`ink`, `yolk`) — change those two
  tokens to reskin the whole page.
