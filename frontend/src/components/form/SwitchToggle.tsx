import React from "react";

interface SwitchToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

export const SwitchToggle: React.FC<SwitchToggleProps> = ({ checked, onChange, label }) => (
  <div className="flex items-center space-x-4">
    <span>{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
  </div>
);