"use client";

import { useEffect, useRef, useState } from "react";
import ThemeToggle from "../ThemeComponent";
import { FaBars, FaSignOutAlt, FaChevronDown, FaUserCircle } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { notify } from "../Toaster";
import { apiClient } from "@/lib/axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/app/context/AppProvider";

export default function HeaderSection({ setSidebarOpen }) {
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const { clients } = useAppContext();

  const { data: session, status } = useSession();

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setLoadingLogout(true);
    // disconnect socket first so server can clear socket_id immediately

    notify("You’ve been logged out", "success");
    await signOut({ callbackUrl: "/login" });
  };

  const [selectedClientId, setSelectedClientId] = useState<number | "">("");
  return (
    <header className="flex items-center justify-between bg-surface border-b border-border px-6 h-[56px]">
      {/* Left */}
      <div className="flex items-center space-x-3">
        <div className=" items-center">
          <button
            className="lg:hidden text-neutral"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars className="h-6 w-6" />
          </button>
          <input
            type="text"
            placeholder="Impersonate As..."
            className="hidden md:block rounded-lg border border-border px-3 py-1 bg-background focus:outline-none focus:ring focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-6" ref={ profileRef }>
        <ThemeToggle />
        <div className="relative">
          <button className="flex items-center gap-2 text-sm font-medium focus:outline-none" onClick={ () => setProfileDropdown( ( prev ) => !prev ) }>
            <FaUserCircle size={ 20 } className="block text-gray-500 dark:text-white" />
            <span>Hello { ( session?.user as any )?.name || "Admin" }</span>
            <FaChevronDown size={ 10 } className="block" />
          </button>
          { profileDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded shadow z-50">
              <button className="flex w-full items-center px-3 py-2 text-sm text-neutral hover:bg-background" onClick={ handleLogout } disabled={ loadingLogout }>
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          ) }
        </div>
      </div>
    </header>
  );
}
