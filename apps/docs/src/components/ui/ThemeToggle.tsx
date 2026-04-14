import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", next);
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-secondary-label)] transition-colors hover:bg-[var(--color-fill)] hover:text-[var(--color-label)]"
        aria-label="Toggle theme"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-secondary-label)] transition-all duration-200 hover:bg-[var(--color-fill)] hover:text-[var(--color-label)] active:scale-95"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative h-5 w-5">
        <Sun
          size={20}
          strokeWidth={2}
          className={`absolute inset-0 transition-all duration-300 ${theme === "light" ? "opacity-100 rotate-0" : "opacity-0 rotate-90"}`}
          aria-hidden="true"
        />
        <Moon
          size={20}
          strokeWidth={2}
          className={`absolute inset-0 transition-all duration-300 ${theme === "dark" ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
          aria-hidden="true"
        />
      </div>
    </button>
  );
}
