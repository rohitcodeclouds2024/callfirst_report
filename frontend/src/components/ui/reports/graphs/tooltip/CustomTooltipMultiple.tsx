import React from "react";

export default function CustomTooltipMultiple({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white border border-gray-300 rounded-md shadow-md p-3">
      <p className="text-sm font-semibold mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2">
          <span
            className="w-3 h-3 rounded-full inline-block"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="text-xs">
            {entry.name}: <b>{entry.value}</b>
          </span>
        </div>
      ))}
    </div>
  );
}
