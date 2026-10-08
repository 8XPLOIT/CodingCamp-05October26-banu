---
inclusion: always
---

# Project: To-Do Life Dashboard

## Overview
A fully client-side personal productivity dashboard built with HTML, CSS, and Vanilla JavaScript. No backend, no frameworks, no build tools required.

## Tech Stack
- **HTML5** — semantic structure
- **CSS3** — custom properties, responsive grid, flexbox
- **Vanilla JavaScript** — IIFE pattern, DOM manipulation, event delegation
- **LocalStorage** — all persistence (tasks, links, theme)

## File Structure
```
index.html          # App entry point
css/style.css       # Single stylesheet (all theming via CSS variables)
js/app.js           # Single JS file (all logic)
.kiro/              # Kiro IDE configuration and specs
```

## Coding Standards
- No frameworks (React, Vue, etc.)
- No backend or server required
- One CSS file only inside `css/`
- One JS file only inside `js/`
- Use `textContent` / `createElement` for user data — never raw `innerHTML` (XSS safety)
- CSS custom properties (`--var`) for all theme colors
- Light/dark mode toggled via a class on `<body>` or `<html>`
- All user data stored under LocalStorage keys: `tasks`, `links`, `theme`
- Keep code clean, well-commented, and readable
