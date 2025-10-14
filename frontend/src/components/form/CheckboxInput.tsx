import React from "react";

interface CheckboxInputProps {
  label?: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label = "",
  checked,
  onChange,
  disabled = false,
  className = "checkbox bg-background",
  labelClassName = "",
  id,
  name,
  autoComplete = "off",
}) => {
  const finalLabelClass =
    " checkbox-label flex items-center gap-2 " + labelClassName;
  return (
    <label className={finalLabelClass}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={className}
        id={id}
        name={name}
        autoComplete={autoComplete}
      />
      {label && <span>{label}</span>}
    </label>
  );
};

export default CheckboxInput;
