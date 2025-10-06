import React from "react";

interface MultiSelectProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggleOption(opt)}
              className="checkbox"
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};