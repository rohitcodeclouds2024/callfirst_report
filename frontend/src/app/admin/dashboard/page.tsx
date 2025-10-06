"use client";

import TrackerDataReport from "@/components/ui/reports/TrackerDataReport";
import UploadDataReport from "@/components/ui/reports/UploadDataReport";
import { apiClient } from "@/lib/axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface Client {
  id: number;
  name: string;
}

export default function Dashboard() {
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

  // Handle uploaded data fetch

  // Handle tracker data fetch

  return (
    <div className="p-6">
      {/* 🔹 Uploaded Data Report */}
      <UploadDataReport clientList={clientList} />

      {/* 🔹 Tracker Data Report */}
      <TrackerDataReport clientList={clientList} />
    </div>
  );
}
