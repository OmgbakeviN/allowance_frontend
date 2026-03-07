const KEY = "theme" // "light" | "dark" | "system"

export function getTheme() {
  return localStorage.getItem(KEY) || "system"
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
}

export function applyTheme(theme) {
  const root = document.documentElement
  root.classList.remove("dark")

  if (theme === "dark") {
    root.classList.add("dark")
    return
  }
  if (theme === "light") {
    return
  }

  // system
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
  if (prefersDark) root.classList.add("dark")
}

export function watchSystemTheme() {
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = () => {
    if (getTheme() === "system") applyTheme("system")
  }
  media.addEventListener?.("change", handler)
  return () => media.removeEventListener?.("change", handler)
}