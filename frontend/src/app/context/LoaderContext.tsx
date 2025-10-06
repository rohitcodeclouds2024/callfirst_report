"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface LoaderContextType {
  loading: boolean;
  setLoading: (state: boolean) => void;
}

const LoaderContext = createContext<LoaderContextType>({
  loading: false,
  setLoading: () => {},
});

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => useContext(LoaderContext);
