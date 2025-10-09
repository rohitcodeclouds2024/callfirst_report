"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/axios";
import toast from "react-hot-toast";
import { Client } from "@/types/client";

export interface UserPermission {
  id: number;
  name: string;
}

export interface AppContextType {
  clients: Client[];
  permissions: UserPermission[];
  permissionMap: string[];
  reloadClients: () => Promise<void>;
  reloadPermissions: () => Promise<void>;
}

// CONTEXT CREATION
const AppContext = createContext<AppContextType | undefined>(undefined);

// PROVIDER
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  const [clients, setClients] = useState<Client[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [permissionMap, setPermissionMap] = useState<string[]>([]);

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await apiClient.get("/clients");
      setClients(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load clients");
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const res = await apiClient.get("/user/permissions");

      const perms: UserPermission[] = res.data.data || [];

      setPermissions(perms);

      // Create flat array of permission names (datamap)
      const names: string[] = perms.map((p) => p.name);
      setPermissionMap(names);
    } catch (err) {
      toast.error("Failed to load permissions");
    }
  };

  // Initial data loading
  useEffect(() => {
    if (session?.user) {
      fetchClients();
      fetchPermissions();
    }
  }, [session]);

  return (
    <AppContext.Provider
      value={{
        clients,
        permissions,
        permissionMap,
        reloadClients: fetchClients,
        reloadPermissions: fetchPermissions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// CUSTOM HOOK
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
