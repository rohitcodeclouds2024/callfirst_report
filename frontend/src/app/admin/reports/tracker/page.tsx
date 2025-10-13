"use client";

import TrackerDataReport from "@/components/ui/reports/TrackerDataReport";
import { useAppContext } from "@/app/context/AppProvider";

export default function TrackeReport() {
  const { clients } = useAppContext();

  return (
    <div className="tracker-report-wrapper">
      {/* 🔹 Tracker Data Report */}
      <TrackerDataReport clientList={clients} />
    </div>
  );
}
