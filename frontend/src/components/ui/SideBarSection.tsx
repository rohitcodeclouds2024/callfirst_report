"use client";

import Link from "next/link";
import clsx from "clsx";
import {
  FaHome,
  FaUsers,
  FaUpload,
  FaClock,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";

import { FaUsersGear } from "react-icons/fa6"; // Roles

interface SideBarSectionProps {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (value: boolean) => void;
  setSidebarCollapsed: (value: boolean) => void;
  pathname: string;
}

const menuItems = [
  { name: "Dashboard", icon: <FaHome />, href: "/admin/dashboard" },
  { name: "Users", icon: <FaUsers />, href: "/admin/users" },
  { name: "Roles", icon: <FaUsersGear />, href: "/admin/roles" },
  { name: "Upload", icon: <FaUpload />, href: "/admin/upload" },
  { name: "Tracker", icon: <FaClock />, href: "/admin/tracker" },
];

export default function SideBarSection({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarOpen,
  setSidebarCollapsed,
  pathname,
}: SideBarSectionProps) {
  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 bg-surface border-r border-border flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        sidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border h-[56px]">
        <Link href="/admin/dashboard" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          {!sidebarCollapsed && (
            <span className="font-bold text-lg">DatastarPro</span>
          )}
        </Link>
        <button
          className="lg:hidden text-muted"
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-6 flex-1 space-y-1 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              "flex items-center px-3 py-2 rounded-lg transition-all duration-200",
              pathname === item.href
                ? "bg-primary text-white"
                : "hover:bg-primary hover:text-white",
              sidebarCollapsed ? "justify-center" : "space-x-3"
            )}
          >
            {item.icon}
            {!sidebarCollapsed && (
              <span className="transition-opacity duration-300">
                {item.name}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Collapse Button */}
      <div className="hidden lg:flex justify-center p-4 border-t border-border">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="text-muted hover:text-primary transition-colors"
        >
          {sidebarCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
        </button>
      </div>
    </aside>
  );
}
