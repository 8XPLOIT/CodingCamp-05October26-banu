/**
 * app.js — Personal Dashboard Logic
 *
 * Covers:
 *  - Live clock & time-based greeting
 *  - Focus (Pomodoro) Timer with in-page notification
 *  - To-Do List: add, edit, complete, delete, sort, duplicate prevention
 *  - Quick Links: add, open, delete
 *  - Light / Dark mode toggle
 *
 * All persistence uses localStorage.
 * Keys: "tasks", "links", "theme"
 *
 * Security: user-supplied content is always set via textContent or
 * element properties — never injected as innerHTML.
 */

(function () {
  'use strict';

  /* ============================================================
     CONSTANTS & STATE
     ============================================================ */

  const STORAGE_KEYS = {
    tasks: 'tasks',
    links: 'links',
    theme: 'theme',
    lang:  'lang',
  };

  // Timer constants (seconds)
  const TIMER_DURATION = 25 * 60; // 25 minutes

  /* ============================================================
     TRANSLATIONS
     ============================================================ */

  const TRANSLATIONS = {
    en: {
      // Greeting
      greetingMorning:   'Good Morning',
      greetingAfternoon: 'Good Afternoon',
      greetingEvening:   'Good Evening',
      greetingNight:     'Good Night',
      // Timer
      timerTitle:  'Focus Timer',
      timerStart:  '▶ Start',
      timerStop:   '⏸ Stop',
      timerReset:  '↺ Reset',
      timerDone:   "⏰ Time's up! Take a break.",
      // Tasks
      tasksTitle:         'Tasks',
      taskPlaceholder:    'Add a new task…',
      addBtn:             'Add',
      sortLabel:          'Sort:',
      sortNewest:         'Newest First',
      sortName:           'Name (A–Z)',
      sortStatus:         'Status (Incomplete First)',
      taskEmpty:          'No tasks yet. Add one above!',
      taskErrEmpty:       'Task cannot be empty.',
      taskErrDuplicate:   (t) => `"${t}" is already in your list.`,
      taskErrEditDup:     (t) => `"${t}" already exists.`,
      taskAriaComplete:   (t) => `Mark "${t}" as complete`,
      taskAriaIncomplete: (t) => `Mark "${t}" as incomplete`,
      taskAriaEdit:       (t) => `Edit task: ${t}`,
      taskAriaDelete:     (t) => `Delete task: ${t}`,
      // Links
      linksTitle:          'Quick Links',
      linkNamePlaceholder: 'Link name…',
      linkUrlPlaceholder:  'URL',
      linksEmpty:          'No links saved yet. Add one above!',
      linkErrName:         'Link name cannot be empty.',
      linkErrUrl:          'Please enter a valid URL (e.g. https://example.com).',
      linkAriaDelete:      (n) => `Delete link: ${n}`,
      // Theme
      ariaLightMode: 'Switch to light mode',
      ariaDarkMode:  'Switch to dark mode',
      // Date locale
      dateLocale: 'en-US',
    },

    id: {
      // Greeting
      greetingMorning:   'Selamat Pagi',
      greetingAfternoon: 'Selamat Siang',
      greetingEvening:   'Selamat Sore',
      greetingNight:     'Selamat Malam',
      // Timer
      timerTitle:  'Timer Fokus',
      timerStart:  '▶ Mulai',
      timerStop:   '⏸ Berhenti',
      timerReset:  '↺ Reset',
      timerDone:   '⏰ Waktu habis! Istirahat dulu.',
      // Tasks
      tasksTitle:         'Tugas',
      taskPlaceholder:    'Tambah tugas baru…',
      addBtn:             'Tambah',
      sortLabel:          'Urut:',
      sortNewest:         'Terbaru',
      sortName:           'Nama (A–Z)',
      sortStatus:         'Status (Belum Selesai)',
      taskEmpty:          'Belum ada tugas. Tambahkan di atas!',
      taskErrEmpty:       'Tugas tidak boleh kosong.',
      taskErrDuplicate:   (t) => `"${t}" sudah ada di daftar.`,
      taskErrEditDup:     (t) => `"${t}" sudah ada.`,
      taskAriaComplete:   (t) => `Tandai "${t}" sebagai selesai`,
      taskAriaIncomplete: (t) => `Tandai "${t}" sebagai belum selesai`,
      taskAriaEdit:       (t) => `Ubah tugas: ${t}`,
      taskAriaDelete:     (t) => `Hapus tugas: ${t}`,
      // Links
      linksTitle:          'Tautan Cepat',
      linkNamePlaceholder: 'Nama tautan…',
      linkUrlPlaceholder:  'URL',
      linksEmpty:          'Belum ada tautan. Tambahkan di atas!',
      linkErrName:         'Nama tautan tidak boleh kosong.',
      linkErrUrl:          'Masukkan URL yang valid (mis. https://contoh.com).',
      linkAriaDelete:      (n) => `Hapus tautan: ${n}`,
      // Theme
      ariaLightMode: 'Ganti ke mode terang',
      ariaDarkMode:  'Ganti ke mode gelap',
      // Date locale
      dateLocale: 'id-ID',
    },
  };

  /* ============================================================
     UTILITIES
     ============================================================ */

  /** Generate a simple unique ID (timestamp + random suffix) */
  const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  /** Load JSON from localStorage; return fallback on missing/parse error */
  const loadStorage = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  };

  /** Persist a value as JSON to localStorage */
  const saveStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage write failed:', e);
    }
  };

  /**
   * Show a temporary error message in a given element.
   * Hides it automatically after `duration` ms.
   */
  const showError = (el, message, duration = 3500) => {
    el.textContent = message;
    el.classList.remove('hidden');
    clearTimeout(el._hideTimer);
    el._hideTimer = setTimeout(() => {
      el.classList.add('hidden');
      el.textContent = '';
    }, duration);
  };

  /**
   * Sanitise / normalise a URL.
   * If the URL doesn't start with http:// or https://, prepend https://.
   * Returns null if the resulting string is clearly not a URL.
   */
  const normaliseUrl = (raw) => {
    let url = raw.trim();
    if (!url) return null;
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    try {
      // Use the URL constructor to validate structure
      new URL(url);
      return url;
    } catch {
      return null;
    }
  };

  /* ============================================================
     1. LANGUAGE (i18n)
     ============================================================ */

  const langEnBtn = document.getElementById('lang-en');
  const langIdBtn = document.getElementById('lang-id');

  /** Currently active locale — initialised from storage below */
  let currentLang = loadStorage(STORAGE_KEYS.lang, 'en');

  /** Shorthand: get a translation string for the current language */
  const t = (key) => TRANSLATIONS[currentLang][key];

  /**
   * Apply all static translations to the DOM (data-i18n and
   * data-i18n-placeholder attributes), then re-render dynamic sections.
   */
  const applyTranslations = () => {
    // Update <html lang=""> attribute
    document.documentElement.lang = currentLang;

    // Static textContent targets
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const val = TRANSLATIONS[currentLang][key];
      if (val !== undefined && typeof val === 'string') {
        el.textContent = val;
      }
    });

    // Placeholder targets
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.dataset.i18nPlaceholder;
      const val = TRANSLATIONS[currentLang][key];
      if (val !== undefined) {
        el.placeholder = val;
      }
    });

    // Re-render dynamic content that contains translated strings
    // (guard with typeof check since functions may not be defined yet
    //  on the very first call; subsequent calls will always hit them)
    if (typeof renderTasks === 'function') renderTasks();
    if (typeof renderLinks === 'function') renderLinks();

    // Re-render the greeting (it's driven by the current hour + locale)
    if (typeof updateClock === 'function') updateClock();
  };

  /** Switch the active language, persist it, and refresh the page strings */
  const setLang = (lang) => {
    currentLang = lang;
    saveStorage(STORAGE_KEYS.lang, lang);

    // Update button active states
    langEnBtn.classList.toggle('active', lang === 'en');
    langIdBtn.classList.toggle('active', lang === 'id');
    langEnBtn.setAttribute('aria-pressed', String(lang === 'en'));
    langIdBtn.setAttribute('aria-pressed', String(lang === 'id'));

    applyTranslations();
  };

  langEnBtn.addEventListener('click', () => setLang('en'));
  langIdBtn.addEventListener('click', () => setLang('id'));

  /* ============================================================
     2. THEME (Light / Dark)
     ============================================================ */

  const themeToggleBtn = document.getElementById('theme-toggle');
  const iconMoon       = document.getElementById('icon-moon');
  const iconSun        = document.getElementById('icon-sun');
  const htmlEl         = document.documentElement;

  /** Apply the given theme ('light' or 'dark') to the page */
  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    // Show moon in light mode (click → go dark), sun in dark mode (click → go light)
    if (theme === 'dark') {
      iconMoon.classList.add('hidden');
      iconSun.classList.remove('hidden');
    } else {
      iconSun.classList.add('hidden');
      iconMoon.classList.remove('hidden');
    }
    themeToggleBtn.setAttribute(
      'aria-label',
      theme === 'dark' ? t('ariaLightMode') : t('ariaDarkMode')
    );
  };

  /** Toggle between light and dark, persisting the choice */
  const toggleTheme = () => {
    const current = htmlEl.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveStorage(STORAGE_KEYS.theme, next);
  };

  // Initialise theme from storage (default: light)
  const savedTheme = loadStorage(STORAGE_KEYS.theme, 'light');
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', toggleTheme);

  /* ============================================================
     3. CLOCK & GREETING
     ============================================================ */

  const greetingEl    = document.getElementById('greeting');
  const currentTimeEl = document.getElementById('current-time');
  const currentDateEl = document.getElementById('current-date');

  /** Return a time-based greeting string based on the current hour */
  const getGreeting = (hour) => {
    if (hour >= 5  && hour < 12) return t('greetingMorning');
    if (hour >= 12 && hour < 18) return t('greetingAfternoon');
    if (hour >= 18 && hour < 21) return t('greetingEvening');
    return t('greetingNight');
  };

  /** Format a Date as HH:MM:SS (24-hour, zero-padded) */
  const formatTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  /** Format a Date using the active locale */
  const formatDate = (date) =>
    date.toLocaleDateString(t('dateLocale'), {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
    });

  /** Update the clock and greeting DOM elements */
  const updateClock = () => {
    const now = new Date();
    currentTimeEl.textContent = formatTime(now);
    currentDateEl.textContent = formatDate(now);
    greetingEl.textContent    = getGreeting(now.getHours());
  };

  // Tick immediately, then every second
  updateClock();
  setInterval(updateClock, 1000);

  /* ============================================================
     4. FOCUS TIMER
     ============================================================ */

  const timerDisplayEl = document.getElementById('timer-display');
  const timerBannerEl  = document.getElementById('timer-banner');
  const startBtn       = document.getElementById('timer-start');
  const stopBtn        = document.getElementById('timer-stop');
  const resetBtn       = document.getElementById('timer-reset');

  let timerSeconds  = TIMER_DURATION; // remaining seconds
  let timerInterval = null;           // setInterval handle
  let timerRunning  = false;

  /** Render the timer display as MM:SS */
  const renderTimer = () => {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    const label = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    timerDisplayEl.textContent = label;
    // Also update the document title for background-tab awareness
    document.title = timerRunning ? `(${label}) Dashboard` : 'To-Do List Life Dashboard';
  };

  /** Update Start/Stop button disabled states */
  const updateTimerButtons = () => {
    startBtn.disabled = timerRunning;
    stopBtn.disabled  = !timerRunning;
  };

  /** Called every second while timer is running */
  const tickTimer = () => {
    timerSeconds -= 1;
    renderTimer();

    if (timerSeconds <= 0) {
      // Timer finished
      clearInterval(timerInterval);
      timerInterval = null;
      timerRunning  = false;
      timerSeconds  = 0;

      // Visual cue: flash the display + show banner
      timerDisplayEl.classList.add('finished');
      timerBannerEl.textContent = t('timerDone');
      timerBannerEl.classList.remove('hidden');

      // Auto-hide banner after 6 seconds
      setTimeout(() => {
        timerBannerEl.classList.add('hidden');
        timerDisplayEl.classList.remove('finished');
      }, 6000);

      document.title = 'Personal Dashboard';
      updateTimerButtons();
    }
  };

  /** Start the countdown */
  const startTimer = () => {
    if (timerRunning || timerSeconds <= 0) return;
    timerBannerEl.classList.add('hidden');
    timerDisplayEl.classList.remove('finished');
    timerRunning = true;
    updateTimerButtons();
    timerInterval = setInterval(tickTimer, 1000);
  };

  /** Pause the countdown */
  const stopTimer = () => {
    if (!timerRunning) return;
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning  = false;
    updateTimerButtons();
  };

  /** Reset to 25:00 */
  const resetTimer = () => {
    stopTimer();
    timerSeconds = TIMER_DURATION;
    timerBannerEl.classList.add('hidden');
    timerDisplayEl.classList.remove('finished');
    document.title = 'Personal Dashboard';
    renderTimer();
    updateTimerButtons();
  };

  startBtn.addEventListener('click', startTimer);
  stopBtn.addEventListener('click', stopTimer);
  resetBtn.addEventListener('click', resetTimer);

  // Initial render
  renderTimer();
  updateTimerButtons();

  /* ============================================================
     5. TASKS
     ============================================================ */

  const taskInput   = document.getElementById('task-input');
  const taskAddBtn  = document.getElementById('task-add');
  const taskErrorEl = document.getElementById('task-error');
  const taskListEl  = document.getElementById('task-list');
  const taskSortSel = document.getElementById('task-sort');

  // In-memory task array; each task: { id, text, done, createdAt }
  let tasks = loadStorage(STORAGE_KEYS.tasks, []);

  /** Persist the current tasks array */
  const saveTasks = () => saveStorage(STORAGE_KEYS.tasks, tasks);

  /**
   * Return a sorted copy of tasks based on the current dropdown value.
   * Does NOT mutate the original array.
   */
  const getSortedTasks = () => {
    const mode = taskSortSel.value;
    const copy = [...tasks];

    if (mode === 'name-asc') {
      copy.sort((a, b) => a.text.localeCompare(b.text));
    } else if (mode === 'status') {
      // Incomplete (done=false) first, then done
      copy.sort((a, b) => Number(a.done) - Number(b.done));
    } else {
      // 'date-desc' — newest createdAt first
      copy.sort((a, b) => b.createdAt - a.createdAt);
    }

    return copy;
  };

  /**
   * Render the task list into the DOM.
   * Uses createElement / textContent — no innerHTML with user data.
   */
  const renderTasks = () => {
    taskListEl.innerHTML = ''; // clear existing (safe: no user content)

    const sorted = getSortedTasks();

    if (sorted.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'task-item';
      const msg = document.createElement('span');
      msg.textContent = t('taskEmpty');
      msg.style.color = 'var(--text-muted)';
      msg.style.fontSize = '0.875rem';
      empty.appendChild(msg);
      taskListEl.appendChild(empty);
      return;
    }

    sorted.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item';
      li.dataset.id = task.id;

      // --- Checkbox ---
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label',
        task.done ? t('taskAriaIncomplete')(task.text) : t('taskAriaComplete')(task.text)
      );
      checkbox.addEventListener('change', () => toggleTask(task.id));

      // --- Text span ---
      const textSpan = document.createElement('span');
      textSpan.className = `task-text${task.done ? ' done' : ''}`;
      textSpan.textContent = task.text; // safe: textContent

      // --- Edit button (pencil SVG) ---
      const editBtn = document.createElement('button');
      editBtn.className = 'task-btn edit';
      editBtn.setAttribute('aria-label', t('taskAriaEdit')(task.text));
      editBtn.addEventListener('click', () => startEditTask(task.id, li, textSpan));
      // Pencil / edit icon
      editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

      // --- Delete button (trash SVG) ---
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-btn delete';
      deleteBtn.setAttribute('aria-label', t('taskAriaDelete')(task.text));
      deleteBtn.addEventListener('click', () => deleteTask(task.id));
      // Trash icon
      deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

      li.appendChild(checkbox);
      li.appendChild(textSpan);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      taskListEl.appendChild(li);
    });
  };

  /**
   * Begin inline editing for a task.
   * Replaces the text span with an <input>, wires up save on blur/Enter.
   */
  const startEditTask = (id, li, textSpan) => {
    // Prevent double-editing
    if (li.querySelector('.task-edit-input')) return;

    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Hide the span
    textSpan.classList.add('hidden');

    // Hide the edit button to avoid re-entering edit mode
    const editBtn = li.querySelector('.task-btn.edit');
    if (editBtn) editBtn.classList.add('hidden');

    // Create the inline input
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-edit-input';
    input.maxLength = 200;
    input.value = task.text;
    input.setAttribute('aria-label', 'Edit task text');

    /** Save the edit — check for duplicate before committing */
    const saveEdit = () => {
      const newText = input.value.trim();

      if (!newText) {
        // Empty — revert
        cancelEdit();
        return;
      }

      // Duplicate check (case-insensitive, ignoring the task itself)
      const isDuplicate = tasks.some(
        (t) => t.id !== id && t.text.toLowerCase() === newText.toLowerCase()
      );

      if (isDuplicate) {
        showError(taskErrorEl, t('taskErrEditDup')(newText));
        input.focus();
        return;
      }

      task.text = newText;
      saveTasks();
      renderTasks();
    };

    const cancelEdit = () => {
      input.remove();
      textSpan.classList.remove('hidden');
      if (editBtn) editBtn.classList.remove('hidden');
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
      } else if (e.key === 'Escape') {
        cancelEdit();
      }
    });

    // Save on blur (clicking away)
    input.addEventListener('blur', saveEdit);

    // Insert input after the (now hidden) span
    li.insertBefore(input, editBtn || li.querySelector('.task-btn.delete'));
    input.focus();
    input.select();
  };

  /** Toggle the done state of a task */
  const toggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveTasks();
    renderTasks();
  };

  /** Permanently remove a task */
  const deleteTask = (id) => {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    renderTasks();
  };

  /** Add a new task from the input field */
  const addTask = () => {
    const text = taskInput.value.trim();

    if (!text) {
      showError(taskErrorEl, t('taskErrEmpty'));
      taskInput.focus();
      return;
    }

    // Case-insensitive duplicate check
    const isDuplicate = tasks.some(
      (t2) => t2.text.toLowerCase() === text.toLowerCase()
    );

    if (isDuplicate) {
      showError(taskErrorEl, t('taskErrDuplicate')(text));
      taskInput.focus();
      return;
    }

    const newTask = {
      id:        genId(),
      text,
      done:      false,
      createdAt: Date.now(),
    };

    tasks.unshift(newTask); // add to front so "newest first" shows it at top
    saveTasks();
    renderTasks();

    taskInput.value = '';
    taskInput.focus();
  };

  // Wire up add task
  taskAddBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });

  // Re-render when sort changes
  taskSortSel.addEventListener('change', renderTasks);

  // Initial render
  renderTasks();

  /* ============================================================
     6. QUICK LINKS
     ============================================================ */

  const linkNameInput = document.getElementById('link-name-input');
  const linkUrlInput  = document.getElementById('link-url-input');
  const linkAddBtn    = document.getElementById('link-add');
  const linkErrorEl   = document.getElementById('link-error');
  const linksGrid     = document.getElementById('links-grid');

  // In-memory links array; each link: { id, name, url }
  let links = loadStorage(STORAGE_KEYS.links, []);

  /** Persist the current links array */
  const saveLinks = () => saveStorage(STORAGE_KEYS.links, links);

  /**
   * Render all quick-link cards.
   * Anchors are created with element.href — never innerHTML with user URLs.
   */
  const renderLinks = () => {
    linksGrid.innerHTML = ''; // safe: no user content in the grid itself

    if (links.length === 0) {
      const msg = document.createElement('p');
      msg.textContent = t('linksEmpty');
      msg.style.color = 'var(--text-muted)';
      msg.style.fontSize = '0.875rem';
      linksGrid.appendChild(msg);
      return;
    }

    links.forEach((link) => {
      const card = document.createElement('div');
      card.className = 'link-card';
      card.dataset.id = link.id;

      // Delete button (top-right corner)
      const delBtn = document.createElement('button');
      delBtn.className = 'link-delete-btn';
      // X / close icon
      delBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      delBtn.setAttribute('aria-label', t('linkAriaDelete')(link.name));
      delBtn.addEventListener('click', () => deleteLink(link.id));

      // Anchor — href set via property, not attribute string, to prevent injection
      const anchor = document.createElement('a');
      anchor.href   = link.url;   // safe: validated before storage
      anchor.target = '_blank';
      anchor.rel    = 'noopener noreferrer';
      anchor.className = 'link-anchor';
      anchor.textContent = link.name; // safe: textContent

      card.appendChild(delBtn);
      card.appendChild(anchor);
      linksGrid.appendChild(card);
    });
  };

  /** Delete a link by id */
  const deleteLink = (id) => {
    links = links.filter((l) => l.id !== id);
    saveLinks();
    renderLinks();
  };

  /** Add a new quick link */
  const addLink = () => {
    const name = linkNameInput.value.trim();
    const rawUrl = linkUrlInput.value.trim();

    if (!name) {
      showError(linkErrorEl, t('linkErrName'));
      linkNameInput.focus();
      return;
    }

    const url = normaliseUrl(rawUrl);

    if (!url) {
      showError(linkErrorEl, t('linkErrUrl'));
      linkUrlInput.focus();
      return;
    }

    const newLink = { id: genId(), name, url };
    links.push(newLink);
    saveLinks();
    renderLinks();

    linkNameInput.value = '';
    linkUrlInput.value  = '';
    linkNameInput.focus();
  };

  linkAddBtn.addEventListener('click', addLink);

  // Allow Enter in the URL field to trigger add
  linkUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink();
  });
  linkNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addLink();
  });

  // Initial render
  renderLinks();

  /* ============================================================
     INITIALISE LANGUAGE
     Must run after all render functions are defined above.
     ============================================================ */
  setLang(currentLang);

  /* ============================================================
     END OF IIFE - CodingCamp — 05 October 2026
     ============================================================ */
})();
