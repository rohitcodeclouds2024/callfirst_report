"use client";

import { useAppContext } from "@/app/context/AppProvider";
import UploadDataReport from "@/components/ui/reports/UploadDataReport";

export default function UploadReport() {
  const { clients } = useAppContext();

  return (
    <div className="upload-report-wrapper">
      {/* 🔹 Uploaded Data Report */}
      <UploadDataReport clientList={clients} />
    </div>
  );
}
