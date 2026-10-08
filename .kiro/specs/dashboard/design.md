# Technical Design — To-Do Life Dashboard

## Architecture

Single-page application. No build step, no module bundler. One HTML file, one CSS file, one JS file.

```
index.html
├── <link> → css/style.css
└── <script> → js/app.js

css/style.css       — all styles, CSS variables for theming
js/app.js           — all logic wrapped in an IIFE
```

---

## HTML Structure

```
<body class="dark">          ← theme class toggled here
  <header>                   ← greeting, clock, date, theme toggle
  <main>
    <section #timer>         ← focus timer
    <section #todo>          ← to-do list
    <section #links>         ← quick links
```

---

## CSS Architecture

### Theming via CSS Custom Properties
All colors defined as variables on `:root` (light) and `body.dark` (dark):

```css
:root {
  --bg: #f5f5f5;
  --surface: #ffffff;
  --text: #1a1a1a;
  --accent: #4f46e5;
  /* ... */
}

body.dark {
  --bg: #0f0f0f;
  --surface: #1e1e1e;
  --text: #f0f0f0;
  /* ... */
}
```

Switching themes = toggling `.dark` on `<body>`. No JS color manipulation.

### Layout
- CSS Grid for the main 3-section layout (responsive: 1-col on mobile, multi-col on desktop)
- Flexbox for component internals (buttons, task rows, link cards)

---

## JavaScript Architecture

All code wrapped in an **IIFE** `(function() { ... })()` to avoid polluting the global scope.

### Modules (logical sections inside the IIFE)

#### 1. Theme
```js
// Keys: localStorage 'theme'
// On load: reads saved theme, applies class to body
// Toggle: flips class, saves to localStorage
```

#### 2. Clock & Greeting
```js
// setInterval(updateClock, 1000)
// updateClock(): new Date() → formats time, date, greeting string
// Greetings: Morning (5-11), Afternoon (12-17), Evening (18-20), Night (21-4)
```

#### 3. Focus Timer
```js
// State: timeLeft (seconds), intervalId, running (bool)
// start(): setInterval ticks timeLeft down, updates display
// stop(): clearInterval
// reset(): stop + set timeLeft = 25*60
// onEnd(): clearInterval, show alert/visual cue
```

#### 4. To-Do List
```js
// State: tasks[] in localStorage key 'tasks'
// Task shape: { id, text, done, createdAt }

// addTask(text): dedupe check (case-insensitive), push, save, render
// editTask(id, newText): find by id, update text, save, render
// toggleDone(id): flip done bool, save, render
// deleteTask(id): filter out, save, render
// sortTasks(mode): 'name' | 'status' | 'date' — returns sorted copy for render
// renderTasks(): builds DOM from sorted tasks array
```

#### 5. Quick Links
```js
// State: links[] in localStorage key 'links'
// Link shape: { id, name, url }

// addLink(name, url): push, save, render
// deleteLink(id): filter out, save, render
// renderLinks(): builds DOM, each card opens url in new tab
```

### LocalStorage Helpers
```js
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
```

### XSS Safety
- All user text → `element.textContent = userInput`
- Links → `anchor.href = url` (browser sanitizes)
- Never: `element.innerHTML = userInput`

---

## Data Shapes (LocalStorage)

### `tasks` (Array)
```json
[
  {
    "id": "1696789200000",
    "text": "Buy groceries",
    "done": false,
    "createdAt": 1696789200000
  }
]
```

### `links` (Array)
```json
[
  {
    "id": "1696789300000",
    "name": "GitHub",
    "url": "https://github.com"
  }
]
```

### `theme` (String)
```json
"dark"
```
or
```json
"light"
```

---

## Responsive Breakpoints

| Breakpoint | Layout |
|---|---|
| < 640px | Single column, stacked sections |
| 640px–1024px | 2-column grid |
| > 1024px | 3-column grid (timer, todo, links side by side) |
