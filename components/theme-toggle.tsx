"use client";

import { Moon, Sun } from "lucide-react";
import { useLayoutEffect, useState } from "react";

export const THEME_STORAGE_KEY = "diamonddna-theme-v1";
export type Theme = "light" | "dark";

export function savedTheme(storage: Pick<Storage, "getItem">): Theme {
  return storage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => typeof window === "undefined" ? "light" : savedTheme(window.localStorage));
  useLayoutEffect(() => {
    const current = savedTheme(window.localStorage);
    document.documentElement.dataset.theme = current;
    document.documentElement.style.colorScheme = current;
  }, []);
  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setTheme(next);
  }
  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
    {theme === "light" ? <Moon aria-hidden="true" /> : <Sun aria-hidden="true" />}<span>{theme === "light" ? "Dark" : "Light"}</span>
  </button>;
}
