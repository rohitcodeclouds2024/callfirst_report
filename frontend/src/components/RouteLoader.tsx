"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoader } from "../app/context/LoaderContext";

export default function RouteLoader() {
  const pathname = usePathname();
  const { loading, setLoading } = useLoader();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="loader"></div>
    </div>
  );
}
