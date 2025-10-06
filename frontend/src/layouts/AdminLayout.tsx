"use client";

import { useEffect, useState, ReactNode } from "react";
import { usePathname } from "next/navigation";

import clsx from "clsx";
import SideBarSection from "@/components/ui/SideBarSection";
import HeaderSection from "@/components/ui/HeaderSection";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false); // for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop toggle

  // Restore collapsed state from localStorage
  useEffect(() => {
    const collapsed =
      localStorage.getItem("admin_sidebar_collapsed") === "true";
    setSidebarCollapsed(collapsed);
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(
      "admin_sidebar_collapsed",
      sidebarCollapsed.toString()
    );
  }, [sidebarCollapsed]);

  // Close sidebar on mobile route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background text-neutral transition-colors duration-300">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SideBarSection
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarOpen={setSidebarOpen}
        setSidebarCollapsed={setSidebarCollapsed}
        pathname={pathname}
      />

      {/* Main */}
      <div
        className={clsx(
          "flex-1 flex flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Header */}
        <HeaderSection setSidebarOpen={setSidebarOpen} />

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
