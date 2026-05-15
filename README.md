# Legal Office — Next.js port

Faithful migration of `legal-office-v229-client-detail-mobile-fixed-button-shape.html`
into a Next.js 14 static-export app.

## Stage status

- **Stage 1** — migration map: complete (in chat).
- **Stage 2** — app shell, global CSS, layout: complete.
- **Stage 3** — state/storage layer: complete (`useAppState`, `lib/storage.ts`, `lib/supabase.ts`, `lib/disk.ts`, `lib/translations.ts`, hooks).
- **Stage 4a-1** — screen-router scaffold + HomeDashboard + populated Sidebar/Topbar/MobileNav + Modal primitive + ModalStack: complete.
- **Stage 4a-2** — Clients screen + ClientDetail + ClientEdit + NewClient modal: complete.
- **Stage 4a-3** — Cases screen + CaseDetail + CaseEdit + NewCase modal + CaseStatusWarning: complete.
- **Stage 4b-1** — Calendar screen (day/week/month/list) + Upcoming-Agenda modal: complete.
- **Stage 4b-2** — Tasks screen + Task modal + CaseDetail tasks panel: complete.
- **Stage 4b-3** — Finance screen + FinanceDetail + AddPayment + FinanceEdit: complete.
- **Stage 4b-4** — Calendar event modals (detail / edit / new event / new appointment): complete.
- **Stage 4c-1** — Documents screen + CaseDocumentsModal + CaseDetail docs panel + Dropbox sync UI: complete.
- **Stage 4c-2** — Portal screen + client search + WhatsApp panel + chat bot + history: complete.
- **Stage 4c-3** — Settings drawer (office name+address, language, theme, font family+size, alerts toggle, backup export/import): complete.
- **Stage 5** — integration polish: complete (office logo, mobile-nav PNG icons, PortalLoginCard, task quick-filters, GlobalSearchScreen, auto-sync hook, full [PARITY.md](PARITY.md)).

## Local dev

```bash
npm install
npm run dev
# open http://localhost:3000
```

At Stage 2 you should see:

- The original full-screen language picker centered on screen, Hebrew + Arabic buttons, gavel icon
- Picking a language swaps to the (empty) app shell — sidebar on desktop, mobile-nav bar on phones
- RTL layout, Hebrew default
- Font Awesome icons rendering (same CDN/version as the source)

Screen content, navigation, and modals are not yet wired up — they arrive in Stage 4.

## Regenerating globals.css

`app/globals.css` is concatenated from every `<style>` block in the source HTML, in source order. Re-run after editing the source:

```bash
npm run extract-css
```

The script lives at [scripts/extract-css.mjs](scripts/extract-css.mjs).

## Static export

```bash
npm run build
# output is in ./out — upload to Netlify/Vercel as a static site
```
