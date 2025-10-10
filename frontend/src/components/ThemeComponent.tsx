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
    <button onClick={ toggleTheme } className="text-gray-500 dark:text-white" title={ `Switch to ${theme === "light" ? "dark" : "light"} mode` }>
      { theme === "light" ? ( <FaMoon size={ 20 } className="block" /> ) : ( <FaSun size={ 20 } className="block" /> ) }
    </button>
  );
}
