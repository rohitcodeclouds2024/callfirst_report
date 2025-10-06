import React from "react";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  selected: string;
  onChange: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  selected,
  onChange,
}) => (
  <div className="flex space-x-4">
    {options.map((opt) => (
      <label key={opt.value} className="flex items-center space-x-2">
        <input
          type="radio"
          name={name}
          value={opt.value}
          checked={selected === opt.value}
          onChange={() => onChange(opt.value)}
          className="radio"
        />
        <span>{opt.label}</span>
      </label>
    ))}
  </div>
);