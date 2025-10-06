import React from "react";

interface SelectInputProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  value,
  onChange,
  required = false,
  error,
}) => (
  <div className="form-group">
    <label className="form-label">{label}{required && " *"}</label>
    <select value={value} onChange={onChange} required={required} className="select">
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);