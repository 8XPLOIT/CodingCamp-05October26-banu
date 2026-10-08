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
  };

  // Timer constants (seconds)
  const TIMER_DURATION = 25 * 60; // 25 minutes

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
     1. THEME (Light / Dark)
     ============================================================ */

  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon      = document.getElementById('theme-icon');
  const htmlEl         = document.documentElement;

  /** Apply the given theme ('light' or 'dark') to the page */
  const applyTheme = (theme) => {
    htmlEl.setAttribute('data-theme', theme);
    // Sun means "switch to light"; Moon means "switch to dark"
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeToggleBtn.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
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
     2. CLOCK & GREETING
     ============================================================ */

  const greetingEl    = document.getElementById('greeting');
  const currentTimeEl = document.getElementById('current-time');
  const currentDateEl = document.getElementById('current-date');

  /** Return a time-based greeting string based on the current hour */
  const getGreeting = (hour) => {
    if (hour >= 5  && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 18) return 'Good Afternoon';
    if (hour >= 18 && hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  /** Format a Date as HH:MM:SS (24-hour, zero-padded) */
  const formatTime = (date) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  /** Format a Date as "Weekday, Month Day, Year" */
  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
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
    greetingEl.textContent    = `${getGreeting(now.getHours())} 👋`;
  };

  // Tick immediately, then every second
  updateClock();
  setInterval(updateClock, 1000);

  /* ============================================================
     3. FOCUS TIMER
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
    document.title = timerRunning ? `(${label}) Dashboard` : 'Personal Dashboard';
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
     4. TO-DO LIST
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
      msg.textContent = 'No tasks yet. Add one above!';
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
      checkbox.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`);
      checkbox.addEventListener('change', () => toggleTask(task.id));

      // --- Text span ---
      const textSpan = document.createElement('span');
      textSpan.className = `task-text${task.done ? ' done' : ''}`;
      textSpan.textContent = task.text; // safe: textContent

      // --- Edit button (pencil icon) ---
      const editBtn = document.createElement('button');
      editBtn.className = 'task-btn edit';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', `Edit task: ${task.text}`);
      editBtn.addEventListener('click', () => startEditTask(task.id, li, textSpan));

      // --- Delete button ---
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-btn delete';
      deleteBtn.textContent = '🗑️';
      deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

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
        showError(taskErrorEl, `"${newText}" already exists.`);
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
      showError(taskErrorEl, 'Task cannot be empty.');
      taskInput.focus();
      return;
    }

    // Case-insensitive duplicate check
    const isDuplicate = tasks.some(
      (t) => t.text.toLowerCase() === text.toLowerCase()
    );

    if (isDuplicate) {
      showError(taskErrorEl, `"${text}" is already in your list.`);
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
     5. QUICK LINKS
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
      msg.textContent = 'No links saved yet. Add one above!';
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
      delBtn.textContent = '✕';
      delBtn.setAttribute('aria-label', `Delete link: ${link.name}`);
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
      showError(linkErrorEl, 'Link name cannot be empty.');
      linkNameInput.focus();
      return;
    }

    const url = normaliseUrl(rawUrl);

    if (!url) {
      showError(linkErrorEl, 'Please enter a valid URL (e.g. https://example.com).');
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
     END OF IIFE
     ============================================================ */
})();
