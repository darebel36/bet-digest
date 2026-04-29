---
type: spec
date: 2026-04-28
project: Sports Betting Platform
---

# Sports Betting Platform — v1 Spec

## What we're building

A clean, visually stunning daily picks page that reads from the existing Sports Bet Digest. Same 6 picks the email sends, but as a proper web page that looks great on desktop and mobile.

This is v1 of what will grow into a small platform (history, W/L tracking, live odds, filters). v1 is just the daily snapshot done well.

## Locked decisions

| Decision | Choice |
|---|---|
| **Hosting** | Netlify Drop (drag-to-deploy, free, instant) |
| **Audience** | Private (just Kevin + friends) — but built public-ready |
| **Disclaimer** | "For entertainment purposes only" baked in from day one |
| **Stack** | Static HTML + Tailwind (CDN) + vanilla JS — no build step |
| **Data source** | Digest generator writes a JSON sidecar; page fetches latest |
| **v2** | W/L tracking + pick history |
| **v3** | Live odds + sport filtering |

## Data contract

The Cowork daily task writes the JSON directly into this project's `picks/` folder:

```
picks/latest.json           ← what the website reads
picks/2026-04-28.json       ← dated archive (sets up v2 W/L tracking)
```

The email digest path has been retired — the platform is now the only consumer.

### JSON schema

```json
{
  "date": "2026-04-28",
  "generated_at": "2026-04-28T08:00:00-04:00",
  "summary": "Top 6 +EV picks · MLB & NBA Player Props",
  "picks": [
    {
      "id": "2026-04-28-osuna-hits-over-0.5",
      "rank": 1,
      "sport": "MLB",
      "matchup": "NYY @ TEX",
      "game_time": "2026-04-28T20:05:00-04:00",
      "player": "Alejandro Osuna",
      "market": "Hits",
      "line": "Over 0.5",
      "odds": "+112",
      "projection": "1.0 hits (median)",
      "win_prob": 0.739,
      "ev_pct": 0.566,
      "book": "Sportsbook Rhode Island",
      "book_is_ri": true,
      "reasoning": "The model projects Osuna for a median of 1 hit...",
      "result": null
    }
  ]
}
```

**Why these fields:**
- `id` — stable, deterministic. Lets v2 backfill `result` ("win" / "loss" / "push" / "void") without breaking anything.
- `result: null` in v1, populated in v2.
- `ev_pct` and `win_prob` as numbers (not strings) so the page can format/sort them.
- `book_is_ri` flag separates the location pin styling from the book name.

## Page anatomy

```
┌─────────────────────────────────────────┐
│ [Header]                                │
│   SPORTS BET DIGEST · ⚡EDGE             │
│   Tuesday, April 28 · Updated 8:02 AM   │
│   Top 6 +EV picks · MLB & NBA           │
├─────────────────────────────────────────┤
│ [Pick Card 1]  ← rank 1, biggest EV     │
│ [Pick Card 2]                           │
│ [Pick Card 3]                           │
│ [Pick Card 4]                           │
│ [Pick Card 5]                           │
│ [Pick Card 6]                           │
├─────────────────────────────────────────┤
│ [Footer]                                │
│   For entertainment purposes only.      │
│   Please gamble responsibly. 1-800-...  │
└─────────────────────────────────────────┘
```

### Pick card layout (mirrors the email, leveled up)

```
┌──────────────────────────────────────────┐
│ #1  Alejandro Osuna — Hits OVER 0.5      │
│     MLB · NYY @ TEX · 8:05 PM EDT        │
│                              [+56.6% EV] │
│                                          │
│ ┌─ LINE ──┐ ┌─ PROJ ──┐ ┌─ WIN PROB ──┐  │
│ │ +112    │ │ 1.0     │ │ 73.9%       │  │
│ └─────────┘ └─────────┘ └─────────────┘  │
│                                          │
│ │ WHY THIS BET                           │
│ │ The model projects Osuna...            │
│                                          │
│ 📍 Sportsbook Rhode Island               │
└──────────────────────────────────────────┘
```

### Visual direction

- **Palette:** dark slate base (`#0f172a`), cyan accent (`#38bdf8`) — same as email, but pushed further.
- **Type:** larger headlines, generous line-height, tabular numbers for stats.
- **Motion:** cards stagger-fade in on load (50ms each). EV badge pulses subtly on the top pick. Otherwise still — no distracting animation.
- **EV badge tiers:** `+25%+` glows brighter green; `+10–25%` standard green; `<10%` muted.
- **Mobile:** single column, full-width cards, edge-to-edge with 16px gutter. Tap-and-hold on reasoning expands if truncated.
- **Desktop:** centered column maxing at ~720px. No multi-column grid — it's a focused read, not a dashboard.

## Page behavior

1. On load, fetch `picks/latest.json` (a symlink/copy of today's file).
2. If today's file is missing, show a calm empty state: "No picks today. Check back tomorrow."
3. Render header → 6 cards → footer.
4. Show "Updated [time]" so it's clear when picks were generated.
5. No interactions in v1: no filters, no sort, no modal. Click on a card does nothing. Keep it pure.

## File structure

```
Sports Betting Platform/
├── index.html                    ← the page
├── assets/
│   ├── styles.css                ← any custom CSS beyond Tailwind
│   └── app.js                    ← fetch + render
├── picks/
│   ├── latest.json               ← copy of today's picks
│   └── 2026-04-28.json           ← archived by date (v2 needs this)
├── [C] Sports Betting Platform Spec.md   ← this file
└── [C] Deployment Notes.md       ← Netlify Drop instructions
```

## Disclaimer (baked in)

Footer on every page, always visible:

> **For entertainment purposes only.** Picks are model projections, not financial or gambling advice. You must be 21+ and in a jurisdiction where sports betting is legal. If you or someone you know has a gambling problem, call **1-800-GAMBLER**.

## v2 preview (not building yet, but designing toward)

- New page: `/history` — list past dates, click into any day's picks.
- Each pick shows W/L/Push badge once `result` is populated.
- Running stats: hit rate, ROI by sport, ROI by EV tier.
- Manual or scripted result-grading workflow.
- The JSON schema above already supports this — `id` is stable, `result` is a defined field.

## v3 preview

- Live odds refresh (current line vs digest line — flag if it moved).
- Filter by sport / book / EV threshold.
- Multiple digests per day (morning + evening).

## Open problems for v1

1. **Daily Cowork task instructions.** Update the Cowork routine prompt so it writes `picks/latest.json` and `picks/YYYY-MM-DD.json` directly into this project folder. Schema is documented above.
2. **Where the JSON lives in deploy.** Netlify Drop is a static upload, so each deploy carries `picks/latest.json` in the bundle. That's fine for daily — we just redeploy with the new file each morning.
3. **Auto-deploy.** Manual drag-and-drop works for v1. Once it's stable, set up a Netlify build hook so the daily Cowork task can `curl` to trigger a redeploy automatically — fully hands-off.

## Definition of done for v1

- [ ] `index.html` renders all 6 picks beautifully on iPhone + desktop Chrome
- [ ] Disclaimer footer visible on every viewport
- [ ] Empty state works when JSON is missing
- [ ] `send_digest.py` produces both HTML and JSON
- [ ] Sample `picks/latest.json` checked in so the page works standalone
- [ ] Deployed to a Netlify URL
- [ ] Kevin opens it on his phone, smiles, sends to a friend
