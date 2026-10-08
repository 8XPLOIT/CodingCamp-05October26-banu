# Requirements — To-Do Life Dashboard

## Project Goal
Build a personal productivity dashboard that runs entirely in the browser. It combines a live clock, a focus timer, a to-do list, and quick-access links into one clean, minimal interface.

---

## Technical Constraints

### TC-1: Technology Stack
- HTML for structure
- CSS for styling
- Vanilla JavaScript (no frameworks: no React, Vue, Angular, etc.)
- No backend server required — runs as a standalone HTML file

### TC-2: Data Storage
- Use browser **LocalStorage API**
- All data stored client-side only
- LocalStorage keys: `tasks`, `links`, `theme`

### TC-3: Browser Compatibility
- Must work in modern browsers: Chrome, Firefox, Edge, Safari
- Can be used as a standalone web app or browser extension

---

## Non-Functional Requirements

### NFR-1: Simplicity
- Clean, minimal interface
- Easy to understand and use with no setup
- No test suite required

### NFR-2: Performance
- Fast load time
- Responsive UI interactions
- No noticeable lag when updating data

### NFR-3: Visual Design
- User-friendly aesthetic
- Clear visual hierarchy
- Readable typography

---

## Functional Requirements (MVP)

### FR-1: Greeting & Date/Time
- Display current time, updating live every second
- Display current date
- Show a greeting based on time of day:
  - 05:00–11:59 → "Good Morning"
  - 12:00–17:59 → "Good Afternoon"
  - 18:00–20:59 → "Good Evening"
  - 21:00–04:59 → "Good Night"

### FR-2: Focus Timer
- 25-minute countdown timer
- **Start** button — begins or resumes countdown
- **Stop/Pause** button — pauses the countdown
- **Reset** button — returns to 25:00
- Visual/audio cue when timer reaches 00:00

### FR-3: To-Do List
- **Add** a task via text input + button
- **Edit** tasks inline
- **Mark as done** — checkbox or click toggles completion (strike-through style)
- **Delete** tasks
- **Prevent duplicates** — case-insensitive check before adding
- **Sort tasks** — user-selectable sort order:
  - By name (A–Z)
  - By status (incomplete first)
  - By creation date (newest first)
- Persist all tasks to LocalStorage

### FR-4: Quick Links
- **Add a link** — name + URL
- **Display as buttons/cards** that open in a new tab
- **Delete links**
- Persist all links to LocalStorage

### FR-5: Light / Dark Mode
- Toggle button (sun/moon icon or label)
- Applied immediately to the entire page
- Preference persisted to LocalStorage
- Implemented via a CSS class toggle on `<body>` using CSS custom properties

---

## Folder Rules
- Only **1 CSS file** inside `css/`
- Only **1 JavaScript file** inside `js/`
- `index.html` at project root
- Code must be clean and readable

---

## Security
- All user-supplied strings rendered via `textContent` or `createElement`
- Never use raw `innerHTML` with user data to prevent XSS

---

## Out of Scope
- User accounts or authentication
- Cloud sync
- Multiple users
- Server-side logic
- Automated tests
