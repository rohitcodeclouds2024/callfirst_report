// app/context/LayoutContext.tsx
"use client";

import { createContext, useContext, useState } from "react";

const LayoutContext = createContext({
  hideHeaderFooter: true,
  setHideHeaderFooter: (val: boolean) => {},
});

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [hideHeaderFooter, setHideHeaderFooter] = useState(true);
  return (
    <LayoutContext.Provider value={{ hideHeaderFooter, setHideHeaderFooter }}>
      {children}
    </LayoutContext.Provider>
  );
}

export const useLayout = () => useContext(LayoutContext);
