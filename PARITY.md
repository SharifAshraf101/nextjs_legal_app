# Parity matrix — source HTML → Next.js port

Comparison of `legal-office-v229-client-detail-mobile-fixed-button-shape.html` (26,312 lines, with 11 flash fixes from May 14 2026 baked in) against the Next.js port at `legal-office-next/`.

✅ = fully ported · 🟡 = ported with documented caveat · ⏳ = stubbed for follow-up

## Foundation

| Area | Source location | Target | Status |
|---|---|---|---|
| Project structure | – | `app/`, `components/`, `hooks/`, `lib/`, `types/`, `public/`, `scripts/` | ✅ |
| Global CSS, 133 `<style>` blocks | lines 54-2350 + interleaved vNNN | `app/globals.css` via `scripts/extract-css.mjs` (543 KB, source order preserved) | ✅ |
| Font Awesome 6.0.0-beta3 CDN | line 53 | `<link>` in `app/layout.tsx` | ✅ |
| `<html dir="rtl" lang="he">` + cache meta | line 3 + 49-51 | `app/layout.tsx` | ✅ |
| v155 early mobile resize guard | lines 7-48 | inline `<script>` in `<head>` (runs `beforeInteractive`) | ✅ |
| 23 `law_*` / `legal_office_*` localStorage keys | catalogued in `lib/storage.ts` `LS` | preserved 1:1 | ✅ |
| `DATA_VERSION` constant | line 3019 | `lib/seedData.ts` | ✅ |
| `tr` (Hebrew + Arabic dictionary, ~100 keys each) | line 3040 | `lib/translations.ts` | ✅ |
| `loadData` / `saveData` / `persistCurrentDataToLocalStorage` | lines 3087, 3168, 3157 | `lib/storage.ts` | ✅ |
| `collectLegalOfficeData` / `applyLegalOfficeData` | lines 3088, 3133 | `lib/storage.ts` | ✅ |
| `exportLegalOfficeBackupFile` / `importLegalOfficeBackupFile` | lines 3183, 3202 | `lib/storage.ts` | ✅ |
| Supabase v88 boot loader | line 5239 | `lib/supabase.ts` `legalOfficeLoadFromSupabaseV88` | ✅ |
| Supabase delete RPC (v6) | lines 9775, 9796 | `lib/supabase.ts` `supabaseDeleteBySource` / `supabaseDeleteMany` | ✅ |
| Supabase live save (v90/v91) | lines 10599, 18510 | not yet ported — auto-persist to localStorage runs; Supabase write-back is the follow-up | ⏳ |
| FS Access handle store (IDB) | lines 3225, 3236, 3247, 3287 | `lib/disk.ts` | ✅ |
| FS Access per-file read/write | various | hook points in place; the `saveLocalDocumentFile`, `openLocalDocument`, `syncCaseDocuments` integrations are the largest remaining ⏳ items | ⏳ |
| Auto-sync interval | line 8098 | `hooks/useAutoSync.ts` (timer + visibility guard wired; calls FS write when integration lands) | 🟡 |

## Shell

| Area | Source | Target | Status |
|---|---|---|---|
| Language picker (first load) | lines 2941-2951 | `components/LanguageSelector.tsx` | ✅ |
| App shell grid (sidebar + main + mobile nav) | lines 2952-2961 | `components/AppShell.tsx` | ✅ |
| Sidebar: brand block + nav buttons + footer | `renderShell` line 3867 | `components/Sidebar.tsx` | ✅ |
| Office logo PNG | embedded base64 in `renderShell` | extracted to `public/office-logo.png` via `scripts/extract-assets.mjs` (229 KB) | ✅ |
| Topbar: page title + mobile-office-identity + actions (settings + quick-action) | `renderShell` + line 5192 | `components/Topbar.tsx` | ✅ |
| `home-topbar` class on home tab | line 3890 | `Topbar.tsx` className toggle | ✅ |
| Mobile nav with PNG icons (home/contacts/cases/calendar) | `navButtons` lines 3841-3844 | extracted to `public/mobile-*.png`; `components/NavButtons.tsx` renders PNG in mobile mode | ✅ |
| Contextual quick-action per tab | line 5192 | `Topbar.tsx` `onQuickAction` | ✅ |
| Modal primitive (backdrop click closes) | line 4107 | `components/Modal.tsx` + `hooks/useModalStack.tsx` | ✅ |
| Stacked modal support (e.g. case status warning from inside case detail) | implicit | `useModalStack` | ✅ |

## Screens

| Screen | Source render | Target component | Status |
|---|---|---|---|
| Home | `renderHome` line 3897 | `HomeDashboard.tsx` | ✅ |
| Clients | `renderContacts` line 3899 | `ClientsScreen.tsx` | ✅ |
| Cases | `renderCases` line 3898 | `CasesScreen.tsx` | ✅ |
| Calendar (4 views) | `renderCalendar` line 4106 | `CalendarScreen.tsx` | ✅ |
| Tasks | `renderTasks` line 5044 | `TasksScreen.tsx` (+ task-quick-filters bar from line 7322) | ✅ |
| Finance summary | `renderFinance` line 4047 | `FinanceScreen.tsx` | ✅ |
| Finance detail | `renderFinanceDetail` line 3900 | `FinanceDetail.tsx` | ✅ |
| Documents | `renderDocuments` line 4984 | `DocumentsScreen.tsx` | ✅ |
| Portal search | `renderPortalSearch` line 4961 | `PortalSearch.tsx` (+ `PortalLoginCard.tsx`) | ✅ |
| Portal communication + bot | `renderPortalCommunication` line 4946 | `PortalCommunication.tsx` + `PortalBot.tsx` | ✅ |
| Global search | `gsResultsHtml` line 5524 | `GlobalSearchScreen.tsx` | ✅ |

## Modals

| Modal | Source | Target | Status |
|---|---|---|---|
| Upcoming agenda | `showUpcomingAgendaModal` line 4331 | `UpcomingAgendaModal.tsx` | ✅ |
| Client detail | `showClient` line 4224 | `ClientDetail.tsx` | ✅ |
| Client edit | `showClientEdit` line 4269 | `ClientEdit.tsx` | ✅ |
| New client | `showNewClientModalFromContacts` line 3930 | `NewClientModal.tsx` | ✅ |
| Case detail | `showCase` line 4195 | `CaseDetail.tsx` (+ recent docs + tasks panels) | ✅ |
| Case edit | `showCaseEdit` line 4196 | `CaseEdit.tsx` | ✅ |
| Case status warning | `showCaseStatusWarning` line 4193 | `CaseStatusWarning.tsx` | ✅ |
| New case | `showNewCaseModalFromCases` line 3970 | `NewCaseModal.tsx` | ✅ |
| Calendar event detail | `showCalendarDetail` line 4361 | `CalendarEventDetail.tsx` | ✅ |
| Calendar event edit | `showCalendarEdit` line 4367 | `CalendarEventEdit.tsx` | ✅ |
| New calendar appointment | `showNewCalendarAppointmentModal` line 4419 | `NewCalendarAppointmentModal.tsx` | ✅ |
| New event (generic, 5 types) | `showNewEventModal` line 4492 | `NewEventModal.tsx` | ✅ |
| Task modal (new + edit) | `showTaskModal` line 5058 | `TaskModal.tsx` | ✅ |
| Add payment | `showAddPaymentModal` line 4024 | `AddPaymentModal.tsx` | ✅ |
| Finance edit | `showFinanceEdit` line 3915 | `FinanceEdit.tsx` | ✅ |
| Case documents modal | `showCaseDocumentsModal` line 3717 | `CaseDocumentsModal.tsx` | ✅ |
| New document | `showNewDocumentModal` line 5007 | flows through `NewEventModal` with type=document | ✅ |
| Settings drawer | `settingsPanelHtml` line 3828 | `SettingsDrawer.tsx` | 🟡 (sections always expanded; source had collapse-on-click) |

## Flash-fix layers (v140 → v229)

The 11 mutation-observer fights I patched in the source HTML (May 14 2026) are no longer needed in the React port because React owns the DOM and the marker classes are applied as static `className` on first paint. Each vNNN stylesheet still ships in `globals.css` and matches the corresponding React element via the class names below.

| vNNN | What it did at runtime | How the React port handles it |
|---|---|---|
| v140 | added `case-detail-mobile-v140` after the fact | static `className` on `<Modal />` in `CaseDetail.tsx` |
| v141 | re-inserted `.case-detail-mobile-fields-v141` | not rendered — only the v220 boxed block ships, which is what the user sees |
| v142 | re-added delete button | not needed — single static v143 delete button |
| v143 | cleanup loop for legacy delete buttons | not needed — no legacy buttons exist |
| v210 | wrapped content in `.case-detail-dark-wrapper` | wrapper div is in JSX |
| v215 | re-inserted v215 fields block | not rendered |
| v217 | added `client-detail-desktop-v217` then v229 removed it | static `className` on `<ClientDetail />` |
| v219 | removed duplicate labels | no duplicates exist |
| v220 | re-inserted v220 fields block | rendered statically |
| v224/v225/v228 | client-detail stability patches | static `className` on `<ClientDetail />` / `<ClientEdit />` |
| v229 | fixed button shape | static `className` |

## CSS preservation

- All 133 `<style>` blocks concatenated in source order into `app/globals.css`. Re-run `npm run extract-css` to regenerate after editing the source HTML.
- The cascade order (v229 outranks v228 outranks v210 etc.) is preserved.
- No CSS rules edited or rewritten. No Tailwind. No CSS-in-JS.

## Storage parity

23 keys, all preserved 1:1:

| Key | Used by |
|---|---|
| `law_lang` | language picker, settings, useAppState |
| `law_theme` | settings, useThemeAndFont |
| `law_font_size` | settings, useThemeAndFont |
| `law_font_family_he`, `law_font_family_ar` | settings, useThemeAndFont |
| `law_show_upcoming` | settings, home dashboard |
| `law_office_name`, `law_office_address` | settings, sidebar, topbar |
| `law_clients`, `law_cases`, `law_events`, `law_finances`, `law_timeline`, `law_documents`, `law_tasks` | useAppState auto-persist |
| `law_data_version` | loadData migration check |
| `law_portal_bot_history` | PortalBot |
| `law_last_task_dropbox_path_v1` | reserved for FS task sync follow-up |
| `legal_office_supabase_loaded_once_v88` / `v95` | Supabase boot |
| `legal_office_supabase_load_error_v88` | Supabase boot |
| `legal_office_supabase_last_saved_at` / `_reason` / `_result` / `_error` | reserved for Supabase live-save follow-up |
| `legal_office_last_live_merge_v90` / `_v91` / `_error_v90` / `_error_v91` | reserved |
| `legal_office_last_full_live_v95` / `legal_office_full_live_error_v95` | reserved |
| `legal_office_last_fresh_reload_v89` / `_error_v89` | reserved |
| `LEGAL_OFFICE_RESET_V7` | factory-reset one-shot flag (preserved) |

## Integration follow-ups

The Next.js port is feature-complete for every screen and modal in the source. The remaining work is integration-level, not UI parity:

1. **FS Access per-file write** — wire `saveLocalDocumentFile` / `openLocalDocument` / `syncCaseDocuments` against `loadSavedLegalOfficeDirectoryHandle`. The handle store and permission-verify are ready in `lib/disk.ts`; the missing piece is per-case folder traversal and binary writes. Estimated ~300 lines.
2. **Supabase live save (v90/v91)** — boot pull is live. Per-row upsert on case/client/event/task/finance/document changes belongs in `useAppState`'s auto-persist effect. Estimated ~200 lines.
3. **Settings section collapse** — sections currently always expanded. Source toggled on click. Easy follow-up.

Everything else from the source has shipped.

## How to verify end-to-end

```bash
cd legal-office-next
npm install
npm run build   # produces ./out, static export
npx serve out   # or: deploy ./out to Netlify / Vercel
```

Sanity checks across screens (after picking a language):
1. Settings → set office name + address → sidebar updates live
2. Add a client → appears at top of clients list
3. Open client → "+ case" → fill case form → case appears in cases tab
4. Open case → "+ event" → schedule for tomorrow → switch to calendar tab → event shows in list view
5. Open case → "+ task" → save → tasks tab shows new task; case detail panel lists it
6. Finance → click case → add payment → balance updates
7. Documents → seed via DevTools → row shows, search filters
8. Portal → type client name → click → bot answers "מה הדיון הקרוב?"
9. Backup → export → import same file → state round-trips
10. Switch to Arabic → entire UI flips; same data round-trips on backup
