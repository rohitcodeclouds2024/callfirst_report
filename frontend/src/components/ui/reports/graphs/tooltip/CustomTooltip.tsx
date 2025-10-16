"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  coordinate?: { x: number; y: number };
  selectedClientId?: number | string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  coordinate,
  selectedClientId,
}) => {
  const router = useRouter();

  const handleViewClick = () => {
    if (!label || !selectedClientId) return;

    sessionStorage.setItem(
      "trackerClient",
      JSON.stringify({
        clientId: selectedClientId,
        xAxisLegend: label,
      })
    );

    router.push("/admin/reports/tracker");
  };

  if (active && payload && payload.length) {
    const value = payload[0].value;

    const style: React.CSSProperties = {
      position: "absolute",
      left: (coordinate?.x ?? 0) + 20,
      top: (coordinate?.y ?? 0) - 70,
      background: "rgba(255, 255, 255, 0.25)",
      backdropFilter: "blur(12px) saturate(180%)",
      WebkitBackdropFilter: "blur(12px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.3)",
      color: "#111",
      padding: "0.8rem 1rem",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      pointerEvents: "auto",
      zIndex: 10000,
      minWidth: "130px",
      textAlign: "center",
      transition: "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
    };

    return (
      <div style={style} className="tooltip-container animate-fade-in">
        <div className="text-xs font-medium text-gray-700 mb-1">{label}</div>
        <div className="text-xl font-extrabold text-cyan-600">{value}%</div>

        <button
          onClick={handleViewClick}
          style={{
            marginTop: "0.6rem",
            padding: "0.4rem 0.8rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#fff",
            background:
              "linear-gradient(90deg, rgba(0,188,212,1) 0%, rgba(0,150,255,1) 100%)",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background =
              "linear-gradient(90deg, rgba(0,210,255,1) 0%, rgba(0,188,212,1) 100%)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background =
              "linear-gradient(90deg, rgba(0,188,212,1) 0%, rgba(0,150,255,1) 100%)")
          }
        >
          View
        </button>
      </div>
    );
  }

  return null;
};

export default CustomTooltip;
