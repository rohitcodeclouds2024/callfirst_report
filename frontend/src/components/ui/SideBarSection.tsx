"use client";

import Link from "next/link";
import clsx from "clsx";
import { useState } from "react";
import {
  FaUsers,
  FaUserShield,
  FaRegClipboard,
  FaClockRotateLeft,
  FaHandHoldingDollar,
} from "react-icons/fa6";
import {
  FaHome,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
  FaChevronDown,
  FaChevronUp,
  FaWpforms,
  FaList,
} from "react-icons/fa";
import { TbReportMoney } from "react-icons/tb";

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
  { name: "Roles", icon: <FaUserShield />, href: "/admin/roles" },
  {
    name: "Tracker",
    icon: <FaRegClipboard />,
    children: [
      {
        name: "Form",
        href: "/admin/tracker/0",
        icon: <FaWpforms />,
      },
      {
        name: "Report",
        href: "/admin/reports/tracker",
        icon: <FaClockRotateLeft />,
      },
    ],
  },
  {
    name: "Revenue",
    icon: <FaHandHoldingDollar />,
    children: [
      {
        name: "List",
        href: "/admin/revenue",
        icon: <FaList />,
      },
      {
        name: "Report",
        href: "/admin/revenue/tracker",
        icon: <TbReportMoney />,
      },
    ],
  },
];

export default function SideBarSection({
  sidebarOpen,
  sidebarCollapsed,
  setSidebarOpen,
  setSidebarCollapsed,
  pathname,
}: SideBarSectionProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleSubMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

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
        {menuItems.map((item) =>
          item.children ? (
            <div key={item.name}>
              {/* Parent Item */}
              <button
                onClick={() => toggleSubMenu(item.name)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200",
                  pathname.startsWith("/admin/tracker")
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white",
                  sidebarCollapsed ? "justify-center" : ""
                )}
              >
                <div
                  className={clsx(
                    "flex items-center",
                    sidebarCollapsed ? "justify-center w-full" : "space-x-3"
                  )}
                >
                  {item.icon}
                  {!sidebarCollapsed && (
                    <span className="transition-opacity duration-300">
                      {item.name}
                    </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <span>
                    {openMenu === item.name ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </span>
                )}
              </button>

              {/* Sub-menu */}
              {!sidebarCollapsed && openMenu === item.name && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className={clsx(
                        "block px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                        pathname === child.href
                          ? "bg-primary text-white"
                          : "hover:bg-primary hover:text-white"
                      )}
                    >
                      <p className="flex">
                        {child.icon && (
                          <span className="text-base mr-2">{child.icon}</span>
                        )}
                        <span> {child.name}</span>
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.name}
              href={item.href!}
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
          )
        )}
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
