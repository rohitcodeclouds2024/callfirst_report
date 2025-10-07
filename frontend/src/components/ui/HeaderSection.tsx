"use client";

import { useEffect, useRef, useState } from "react";
import ThemeToggle from "../ThemeComponent";
import { FaBars, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { useSession, signOut } from "next-auth/react";
import { notify } from "../Toaster";
import { Client } from "@/types/client";
import { apiClient } from "@/lib/axios";
import toast from "react-hot-toast";

export default function HeaderSection({ setSidebarOpen }) {
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [clientList, setClientList] = useState<Client[]>([]);

  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await apiClient.get("/clients");
        setClientList(res.data.data || []);
      } catch (err) {
        toast.error("Failed to load clients");
      }
    };
    fetchClients();
  }, []);

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

        <div className=" items-center">
          <select
            className="hidden md:block w-[220px] rounded-lg border border-border px-3 py-2 bg-background focus:outline-none focus:ring focus:ring-primary"
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(Number(e.target.value))}
          >
            <option value="">Select Client</option>
            {clientList.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-4" ref={profileRef}>
        {/* ✅ Online/Offline + socket id */}
        <div className="flex items-center space-x-2">Hello</div>

        <ThemeToggle />
        {/* Profile dropdown */}
        <div className="relative">
          <button
            className="flex items-center space-x-1 text-sm font-medium text-neutral focus:outline-none"
            onClick={() => setProfileDropdown((prev) => !prev)}
          >
            <span>{(session?.user as any)?.name || "Admin"}</span>
            <FaChevronDown className="text-xs" />
          </button>
          {profileDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-surface border border-border rounded shadow z-50">
              <button
                className="flex w-full items-center px-3 py-2 text-sm text-neutral hover:bg-background"
                onClick={handleLogout}
                disabled={loadingLogout}
              >
                <FaSignOutAlt className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
