"use client";

import TrackerDataReport from "@/components/ui/reports/TrackerDataReport";
import { useAppContext } from "@/app/context/AppProvider";

export default function TrackeReport() {
  const { clients } = useAppContext();

  return (
    <div className="p-6">
      {/* 🔹 Tracker Data Report */}
      <TrackerDataReport clientList={clients} />
    </div>
  );
}
