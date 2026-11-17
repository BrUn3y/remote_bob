"use strict";

const themeButtons = document.querySelectorAll("[data-theme-value]");
const systemTheme = matchMedia("(prefers-color-scheme: dark)");
let explicitTheme = null;
try {
  const saved = localStorage.getItem("remote-bob-theme");
  if (saved === "white" || saved === "g100") explicitTheme = saved;
} catch (_) {
  // The theme still works when browser storage is unavailable.
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeButtons.forEach((button) => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.themeValue === theme),
    );
  });
}

applyTheme(document.documentElement.dataset.theme);
themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    explicitTheme = button.dataset.themeValue;
    applyTheme(explicitTheme);
    try {
      localStorage.setItem("remote-bob-theme", explicitTheme);
    } catch (_) {
      // Storage may be disabled in private or restricted contexts.
    }
  });
});
systemTheme.addEventListener("change", (event) => {
  if (!explicitTheme) applyTheme(event.matches ? "g100" : "white");
});

const menuButton = document.querySelector(".menu-toggle");
const mobileNavigation = document.querySelector("#mobile-nav");
function closeMenu() {
  mobileNavigation.hidden = true;
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open menu");
}
menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(expanded));
  menuButton.setAttribute("aria-label", expanded ? "Close menu" : "Open menu");
  mobileNavigation.hidden = !expanded;
});
mobileNavigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNavigation.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!mobileNavigation.hidden && !event.target.closest(".shell-header"))
    closeMenu();
});
matchMedia("(min-width: 801px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});

const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
function selectTab(tab, moveFocus = false) {
  tabs.forEach((item) => {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden =
      !selected;
  });
  if (moveFocus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next], true);
    }
  });
});

document.querySelectorAll("[data-engine]").forEach((button) => {
  button.addEventListener("click", () => {
    const engine = button.dataset.engine;
    document.querySelectorAll("[data-engine]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });
    document.querySelectorAll("[data-engine-command]").forEach((element) => {
      element.textContent = engine;
    });
  });
});

let announcementTimer;
function announce(message) {
  clearTimeout(announcementTimer);
  const announcement = document.querySelector("#announcement");
  announcement.textContent = message;
  announcementTimer = setTimeout(() => {
    announcement.textContent = "";
  }, 3500);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch (_) {
    // Some browsers restrict the Clipboard API even after a user click.
  }
  const previouslyFocused = document.activeElement;
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("aria-label", "Code to copy");
  field.style.cssText =
    "position:fixed;inset:0 auto auto 0;opacity:0;pointer-events:none";
  document.body.append(field);
  field.focus({ preventScroll: true });
  field.select();
  try {
    if (!document.execCommand("copy")) throw new Error("Copy unavailable");
  } finally {
    field.remove();
    previouslyFocused?.focus({ preventScroll: true });
  }
}

document
  .querySelectorAll("[data-copy], [data-copy-active]")
  .forEach((button) => {
    button.addEventListener("click", async () => {
      const source = button.hasAttribute("data-copy-active")
        ? document.querySelector('[role="tabpanel"]:not([hidden]) code')
        : document.getElementById(button.dataset.copy);
      try {
        await copyText(source.textContent.trim());
        const icon = button.querySelector("use");
        icon.setAttribute("href", "#i-check");
        announce("Code copied to clipboard.");
        setTimeout(() => {
          icon.setAttribute("href", "#i-copy");
        }, 2000);
      } catch (_) {
        announce("Unable to copy. Select the code and copy it manually.");
      }
    });
  });

if ("IntersectionObserver" in window) {
  const navigationLinks = document.querySelectorAll(".desktop-nav a");
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`)
            link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-15% 0px -65% 0px", threshold: 0 },
  );
  document
    .querySelectorAll("main section[id]")
    .forEach((section) => sectionObserver.observe(section));
}
