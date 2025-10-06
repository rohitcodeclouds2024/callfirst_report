"use client";

import { useTheme } from "../app/context/ThemeContext";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Prevent hydration mismatch
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full shadow-lg bg-primary text-white hover:bg-primary-dark transition-all"
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <FaMoon className="text-xl" />
      ) : (
        <FaSun className="text-xl" />
      )}
    </button>
  );
}
