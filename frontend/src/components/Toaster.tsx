"use client";

import { Toaster as HotToaster, toast } from "react-hot-toast";

type ToastStatus = "success" | "error" | "info";

export function notify(message: string, status: ToastStatus = "info") {
  switch (status) {
    case "success":
      toast.success(message, {
        style: { background: "#16a34a", color: "#fff" },
      });
      break;
    case "error":
      toast.error(message, { style: { background: "#dc2626", color: "#fff" } });
      break;
    case "info":
    default:
      toast(message, { style: { background: "#2563eb", color: "#fff" } });
      break;
  }
}

export default function Toaster() {
  return <HotToaster position="top-right" reverseOrder={false} />;
}
