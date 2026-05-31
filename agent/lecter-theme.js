/* VENDORED COPY of lecter/public/lecter-theme.js — DO NOT EDIT HERE.
   Source of truth is the canon; re-sync with: bash lecter/sync-theme.sh
   canon-js-sha256: 823deb865b5aa3955147b8a596e5a60391344e3ee02379bdd4701dc2d13710f2 */
(function () {
  "use strict";

  var STORAGE_KEY = "lecter.theme";
  var DEFAULT_THEME = "ember-blue";
  var THEMES = [
    { id: "ember-blue", label: "Ember / Blue", accent: "#ff6e3c", secondary: "#6cb7ff" },
    { id: "violet-green", label: "Violet / Green", accent: "#6f72ff", secondary: "#36df6f" },
    { id: "rose-cyan", label: "Rose / Cyan", accent: "#ff4f9a", secondary: "#38d8ff" },
    { id: "gold-teal", label: "Gold / Teal", accent: "#f6c945", secondary: "#2bd6bd" },
    { id: "lime-azure", label: "Lime / Azure", accent: "#b8f052", secondary: "#33b7ff" },
  ];
  var themeIds = THEMES.map(function (theme) { return theme.id; });

  function safeGetStoredTheme() {
    try {
      return window.localStorage ? window.localStorage.getItem(STORAGE_KEY) : "";
    } catch {
      return "";
    }
  }

  function safeStoreTheme(id) {
    try {
      if (window.localStorage) window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* Theme persistence is optional. */
    }
  }

  function normalizeTheme(id) {
    return themeIds.indexOf(id) >= 0 ? id : DEFAULT_THEME;
  }

  function themeFromUrl() {
    try {
      var raw = new URLSearchParams(window.location.search).get("theme");
      return raw ? normalizeTheme(raw) : "";
    } catch {
      return "";
    }
  }

  function setPressedState(activeId) {
    var buttons = document.querySelectorAll("[data-lecter-theme-choice]");
    buttons.forEach(function (button) {
      button.setAttribute("aria-pressed", button.dataset.lecterThemeChoice === activeId ? "true" : "false");
    });
  }

  function applyTheme(id, opts) {
    var next = normalizeTheme(id);
    var persist = !opts || opts.persist !== false;
    document.documentElement.setAttribute("data-lecter-theme", next);
    if (persist) safeStoreTheme(next);
    setPressedState(next);
    window.dispatchEvent(new CustomEvent("lecter-theme-change", { detail: { theme: next } }));
    return next;
  }

  function getTheme() {
    return normalizeTheme(document.documentElement.getAttribute("data-lecter-theme") || safeGetStoredTheme());
  }

  function cycleTheme() {
    var current = getTheme();
    var index = themeIds.indexOf(current);
    return applyTheme(themeIds[(index + 1) % themeIds.length]);
  }

  function injectPickerStyles() {
    if (document.getElementById("lecter-theme-picker-style")) return;
    var style = document.createElement("style");
    style.id = "lecter-theme-picker-style";
    style.textContent = [
      ".lecter-theme-control{position:fixed;right:12px;bottom:12px;z-index:2147483000;font:12px/1.3 -apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;color:var(--lecter-text,#e6e8ee)}",
      ".lecter-theme-toggle{width:34px;height:34px;border-radius:999px;border:1px solid var(--lecter-line,#262b38);background:var(--lecter-panel,#161922);color:var(--lecter-text,#e6e8ee);box-shadow:var(--lecter-shadow,0 8px 24px rgba(0,0,0,.35));display:grid;place-items:center;padding:0;cursor:pointer}",
      ".lecter-theme-toggle:hover,.lecter-theme-toggle[aria-expanded='true']{border-color:var(--lecter-accent,#ff6e3c)}",
      ".lecter-theme-menu{position:absolute;right:0;bottom:42px;width:184px;display:grid;gap:5px;padding:8px;border-radius:8px;border:1px solid var(--lecter-line,#262b38);background:var(--lecter-panel,#161922);box-shadow:var(--lecter-shadow,0 8px 24px rgba(0,0,0,.35))}",
      ".lecter-theme-menu[hidden]{display:none}",
      ".lecter-theme-choice{width:100%;min-height:32px;display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:6px;border:1px solid transparent;background:transparent;color:var(--lecter-text,#e6e8ee);font:inherit;text-align:left;cursor:pointer}",
      ".lecter-theme-choice:hover,.lecter-theme-choice[aria-pressed='true']{background:var(--lecter-panel-2,#1d212c);border-color:var(--lecter-line,#262b38)}",
      ".lecter-theme-choice[aria-pressed='true']{border-color:var(--lecter-accent,#ff6e3c)}",
      ".lecter-theme-swatch{display:inline-grid;grid-template-columns:1fr 1fr;width:23px;height:23px;border-radius:7px;overflow:hidden;border:1px solid rgb(255 255 255 / .16);flex:0 0 auto;background:var(--lecter-panel-2,#1d212c)}",
      ".lecter-theme-toggle .lecter-theme-swatch{width:20px;height:20px}",
      ".lecter-theme-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      "@media (max-width:520px){.lecter-theme-control{right:10px;bottom:10px}.lecter-theme-menu{width:176px}}",
    ].join("");
    document.head.appendChild(style);
  }

  function swatch(theme) {
    var el = document.createElement("span");
    el.className = "lecter-theme-swatch";
    el.setAttribute("aria-hidden", "true");
    var a = document.createElement("span");
    var b = document.createElement("span");
    a.style.background = theme.accent;
    b.style.background = theme.secondary;
    el.append(a, b);
    return el;
  }

  function buildPicker() {
    if (document.querySelector("[data-lecter-theme-control]")) return;
    if (!document.body) return;
    injectPickerStyles();

    var active = getTheme();
    var activeTheme = THEMES.find(function (theme) { return theme.id === active; }) || THEMES[0];
    var wrap = document.createElement("div");
    wrap.className = "lecter-theme-control";
    wrap.dataset.lecterThemeControl = "true";

    var toggle = document.createElement("button");
    toggle.className = "lecter-theme-toggle";
    toggle.type = "button";
    toggle.title = "Theme";
    toggle.setAttribute("aria-label", "Choose Lecter theme");
    toggle.setAttribute("aria-haspopup", "true");
    toggle.setAttribute("aria-expanded", "false");
    toggle.appendChild(swatch(activeTheme));

    var menu = document.createElement("div");
    menu.className = "lecter-theme-menu";
    menu.hidden = true;

    THEMES.forEach(function (theme) {
      var choice = document.createElement("button");
      choice.type = "button";
      choice.className = "lecter-theme-choice";
      choice.dataset.lecterThemeChoice = theme.id;
      choice.setAttribute("aria-pressed", theme.id === active ? "true" : "false");
      choice.appendChild(swatch(theme));
      var label = document.createElement("span");
      label.className = "lecter-theme-label";
      label.textContent = theme.label;
      choice.appendChild(label);
      choice.addEventListener("click", function () {
        var next = applyTheme(theme.id);
        toggle.replaceChildren(swatch(THEMES.find(function (item) { return item.id === next; }) || theme));
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      });
      menu.appendChild(choice);
    });

    toggle.addEventListener("click", function () {
      menu.hidden = !menu.hidden;
      toggle.setAttribute("aria-expanded", menu.hidden ? "false" : "true");
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !menu.hidden) {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (event) {
      if (!wrap.contains(event.target) && !menu.hidden) {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    wrap.append(toggle, menu);
    document.body.appendChild(wrap);
  }

  var pickerQueued = false;
  function queuePickerBuild() {
    if (pickerQueued) return;
    pickerQueued = true;
    requestAnimationFrame(function () {
      pickerQueued = false;
      if (!document.querySelector("[data-lecter-theme-control]")) buildPicker();
    });
  }

  function watchForBodyRenders() {
    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      if (document.body && !document.querySelector("[data-lecter-theme-control]")) queuePickerBuild();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  var initialTheme = themeFromUrl() || safeGetStoredTheme() || DEFAULT_THEME;
  applyTheme(initialTheme, { persist: !!themeFromUrl() });

  window.LecterThemes = {
    themes: THEMES.slice(),
    apply: applyTheme,
    get: getTheme,
    cycle: cycleTheme,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      buildPicker();
      watchForBodyRenders();
    }, { once: true });
  } else {
    buildPicker();
    watchForBodyRenders();
  }
}());
