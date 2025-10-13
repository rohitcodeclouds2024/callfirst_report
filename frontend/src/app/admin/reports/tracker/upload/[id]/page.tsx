"use client";

import { useAppContext } from "@/app/context/AppProvider";
import TrackerUploadReport from "@/components/ui/reports/TrackerUploadReport";
import { useParams } from "next/navigation";

export default function LgUploadReport() {
  const { clients } = useAppContext();
  const params = useParams(); // Get route params
  const clientIdFromUrl = params.id;

  return (
    <div className="upload-report-wrapper">
      {/* 🔹 Uploaded Data Report */}
      <TrackerUploadReport
        clientList={clients}
        clientIdFromUrl={clientIdFromUrl}
      />
    </div>
  );
}
