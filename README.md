# 🗂️ To-Do List Life Dashboard

A personal productivity dashboard that runs entirely in the browser — no server, no frameworks, no setup required. Just open `index.html` and start using it.

---

## ✨ Features

### 🕐 Greeting & Live Clock
- Displays current time (HH:MM:SS), updated every second
- Shows today's full date — weekday, month, day, year
- Greeting changes automatically based on time of day:
  - **Good Morning / Selamat Pagi** — 05:00–11:59
  - **Good Afternoon / Selamat Siang** — 12:00–17:59
  - **Good Evening / Selamat Sore** — 18:00–20:59
  - **Good Night / Selamat Malam** — 21:00–04:59
- Greeting text and date format follow the active language setting

### ⏱️ Focus Timer
- 25-minute Pomodoro-style countdown
- **▶ Start / Mulai** — begins or resumes the countdown
- **⏸ Stop / Berhenti** — pauses the timer
- **↺ Reset** — returns to 25:00
- In-page banner displayed when time is up; auto-hides after 6 seconds
- Document tab title updates with remaining time while the timer is running

### ✅ To-Do List
- **Add** tasks via text input (Enter key or Add button)
- **Edit** tasks inline — click the pencil icon button, save with Enter or by clicking away, cancel with Escape
- **Complete** tasks with a checkbox — completed tasks get a strike-through style
- **Delete** tasks via the trash icon button
- **Duplicate prevention** — case-insensitive check blocks identical entries on both add and edit
- **Sort** tasks three ways:
  - Newest First (default)
  - Name A–Z
  - Status — Incomplete First
- Scrollable task list (max height 380px) with custom scrollbar
- All tasks persisted to **LocalStorage**

#### Responsive layout (Tasks controls)
| Viewport | Layout |
|---|---|
| Desktop ≥ 768px | Two rows: text input + Add button on top; Sort label + select below |
| Mobile < 768px | Single row: text input + Add button on the left, sort select on the right |
- Sort label is hidden on mobile — the select dropdown is self-explanatory

### 🔗 Quick Links
- Save favourite websites by name + URL
- Auto-prefixes `https://` if the URL has no scheme
- Displayed as a responsive card grid — each card opens the link in a new tab
- Delete any saved link via the × icon button on the card
- All links persisted to **LocalStorage**

### 🌗 Light / Dark Mode
- Toggle between light and dark themes with one click
- Moon icon (light mode) / Sun icon (dark mode) — implemented as inline SVG, no emoji
- All colours switch via CSS custom properties — instant, flicker-free
- Preference saved to **LocalStorage** — survives page refresh

### 🌐 Language Switch
- Pill-style toggle in the header, directly below the theme button
- Two options: **EN** (English) and **ID** (Bahasa Indonesia)
- Switching updates all visible text instantly with no page reload:
  - Section headings, button labels, input placeholders
  - Error messages and ARIA labels
  - Greeting phrase and date locale (en-US ↔ id-ID)
- Selected language saved to **LocalStorage** — remembered across sessions
- Please note: We are providing this option purely as an optional feature to accommodate language preferences, and it may revert to being English-only (without a language toggle).

---

## 📁 Project Structure

```
CodingCamp-05October26-banu/
│
├── index.html          # App entry point — open this in your browser
├── css/
│   └── style.css       # All styles (CSS custom properties, grid, flexbox, responsive)
├── js/
│   └── app.js          # All logic (clock, timer, tasks, links, theme, i18n)
│
├── .kiro/
│   └── steering/
│       └── project.md  # Kiro: always-included project context
│
└── README.md
```

---

## 🚀 Getting Started

No installation needed.

1. Clone or download this repository
2. Open `index.html` in any modern browser

```bash
# optional — run a local dev server:
npx serve .
```

Everything runs client-side. No build step, no npm install.

---

## 💾 Data & Storage

All data is stored in your browser's **LocalStorage** under these keys:

| Key | Contents |
|---|---|
| `tasks` | Array of task objects `{ id, text, done, createdAt }` |
| `links` | Array of link objects `{ id, name, url }` |
| `theme` | `"light"` or `"dark"` |
| `lang`  | `"en"` or `"id"` |

Data persists across page refreshes and browser restarts. To clear all data, open DevTools → Application → Local Storage → Delete all.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 — semantic elements, ARIA attributes |
| Styling | CSS3 — custom properties, grid, flexbox, responsive breakpoints |
| Logic | Vanilla JavaScript — IIFE pattern, ES6+ |
| Storage | Browser LocalStorage API |
| Icons | Inline SVG (no icon library, no CDN) |
| Font | Inter — loaded from Google Fonts CDN (`fonts.googleapis.com`) |
| JS/CSS Frameworks | **None** |

---

## 🔒 Security

- All user-supplied text is set via `textContent` — never injected as raw `innerHTML`
- SVG icons are static, hardcoded strings — not derived from user input
- Link URLs are assigned to `anchor.href` (browser-validated via the `URL` constructor before storage)
- No cookies, no tracking, no external API calls at runtime

---

## 📱 Responsive Behaviour

| Breakpoint | Changes |
|---|---|
| ≥ 768px (desktop) | 3-column auto-fit grid; task controls in two rows |
| < 768px (mobile) | Single-column stacked layout; task input + sort on one row; Quick Links inputs stack vertically |

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Edge | ✅ |
| Chrome | ✅ |
| Firefox | ✅ |
| Safari | ✅ |

Requires a browser with support for CSS custom properties, `localStorage`, and the `URL` constructor (all modern browsers).

---

## 🗺️ Roadmap

- [x] Light / Dark mode toggle
- [x] Language switch (EN / ID)
- [x] Responsive task controls (sort beside Add on mobile)
- [ ] Custom timer duration
- [ ] Sound notification when timer ends
- [ ] Task categories / tags
- [ ] Drag-and-drop task reordering
- [ ] Export tasks as JSON or CSV
- [ ] Keyboard shortcuts
- [ ] PWA manifest (installable as desktop / mobile app)

---

## 📄 License

This project was built as part of **CodingCamp — 05 October 2026**.  
Submitted by **L. MOH. BANU PEBRIANTO**.  
Free to use and modify for personal or educational purposes.
