"use client";

import TrackerDataReport from "@/components/ui/reports/TrackerDataReport";
import { apiClient } from "@/lib/axios";
import { Client } from "@/types/client";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export default function TrackeReport() {
  const [clientList, setClientList] = useState<Client[]>([]);

  // Fetch client list on mount
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

  return (
    <div className="p-6">
      {/* 🔹 Tracker Data Report */}
      <TrackerDataReport clientList={clientList} />
    </div>
  );
}
