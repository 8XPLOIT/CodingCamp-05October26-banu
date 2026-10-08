# 🗂️ To-Do Life Dashboard

A personal productivity dashboard that runs entirely in the browser — no server, no frameworks, no setup required. Just open `index.html` and start using it.

---

## ✨ Features

### 🕐 Greeting & Live Clock
- Displays current time, updated every second
- Shows today's date
- Greeting changes automatically based on time of day:
  - ☀️ **Good Morning** — 05:00–11:59
  - 🌤️ **Good Afternoon** — 12:00–17:59
  - 🌆 **Good Evening** — 18:00–20:59
  - 🌙 **Good Night** — 21:00–04:59

### ⏱️ Focus Timer
- 25-minute Pomodoro-style countdown
- **▶ Start** — begins or resumes the countdown
- **⏸ Stop** — pauses the timer
- **↺ Reset** — returns to 25:00
- Banner alert displayed when time is up

### ✅ To-Do List
- **Add** tasks with a text input
- **Edit** tasks inline
- **Complete** tasks with a checkbox (strike-through style)
- **Delete** tasks
- **Duplicate prevention** — case-insensitive check blocks duplicate entries
- **Sort** tasks three ways:
  - Newest First (default)
  - Name A–Z
  - Incomplete First
- All tasks persisted to **LocalStorage**

### 🔗 Quick Links
- Save favourite websites by name + URL
- Displayed as clickable cards that open in a new tab
- Delete any saved link
- All links persisted to **LocalStorage**

### 🌗 Light / Dark Mode
- Toggle between light and dark themes with one click
- Preference saved to **LocalStorage** — survives page refresh
- Implemented with CSS custom properties — instant, flicker-free switch

### 🌐 Language Switch
- Switch between **English (EN)** and **Bahasa Indonesia (ID)** using the pill-style toggle below the theme button
- All visible text updates instantly — greetings, section titles, button labels, placeholders, error messages, and the date format
- Selected language saved to **LocalStorage** — your preference is remembered across sessions

---

## 📁 Project Structure

```
to-do-life-dashboard/
│
├── index.html          # App entry point — open this in your browser
├── css/
│   └── style.css       # All styles (CSS custom properties, responsive grid)
├── js/
│   └── app.js          # All logic (clock, timer, tasks, links, theme)
│
├── .kiro/
│   ├── steering/
│   │   └── project.md          # Kiro: always-included project context
│   └── specs/
│       └── dashboard/
│           ├── requirements.md # Full requirements spec
│           ├── design.md       # Technical design document
│           └── tasks.md        # Implementation checklist
│
└── README.md
```

---

## 🚀 Getting Started

No installation needed.

1. Clone or download this repository
2. Open `index.html` in any modern browser

```bash
# or if you prefer a local server:
npx serve .
```

That's it. Everything runs client-side.

---

## 💾 Data & Storage

All data is stored in your browser's **LocalStorage** under these keys:

| Key | Contents |
|---|---|
| `tasks` | Array of task objects `{ id, text, done, createdAt }` |
| `links` | Array of link objects `{ id, name, url }` |
| `theme` | `"light"` or `"dark"` |
| `lang`  | `"en"` or `"id"` |

Data persists across page refreshes and browser restarts. To clear all data, open DevTools → Application → Local Storage → Clear.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 (semantic elements, ARIA attributes) |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Logic | Vanilla JavaScript (IIFE pattern, ES6+) |
| Storage | Browser LocalStorage API |
| Dependencies | **None** |

---

## 🔒 Security

- All user-supplied text is set via `textContent` — never injected as raw `innerHTML`
- Link URLs are assigned to `anchor.href` (browser-sanitized)
- No external requests, no cookies, no tracking

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome | ✅ |
| Firefox | ✅ |
| Edge | ✅ |
| Safari | ✅ |

---

## 🗺️ Roadmap

- [ ] Custom timer duration
- [ ] Sound notification when timer ends
- [ ] Task categories / tags
- [ ] Drag-and-drop task reordering
- [ ] Export tasks as JSON or CSV
- [ ] Keyboard shortcuts
- [ ] PWA manifest (installable as desktop/mobile app)

---

## 📄 License

This project was built as part of **CodingCamp — 05 October 2026 - Submitted by L. MOH. BANU PEBRIANTO**.  
Free to use and modify for personal or educational purposes.
