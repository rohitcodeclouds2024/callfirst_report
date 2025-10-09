"use client";

import { useAppContext } from "@/app/context/AppProvider";
import UploadDataReport from "@/components/ui/reports/UploadDataReport";

export default function UploadReport() {
  const { clients } = useAppContext();

  return (
    <div className="p-6">
      {/* 🔹 Uploaded Data Report */}
      <UploadDataReport clientList={clients} />
    </div>
  );
}
