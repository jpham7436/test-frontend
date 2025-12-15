// src/utils/themeStore.js
const KEY = "theme"; // "light" | "dark"

export function getTheme() {
  const t = localStorage.getItem(KEY);
  return t === "dark" ? "dark" : "light";
}

export function setTheme(theme) {
  const t = theme === "dark" ? "dark" : "light";
  localStorage.setItem(KEY, t);
  document.documentElement.setAttribute("data-theme", t);
}

export function toggleTheme() {
  setTheme(getTheme() === "dark" ? "light" : "dark");
}

export function initTheme() {
  setTheme(getTheme());
}
