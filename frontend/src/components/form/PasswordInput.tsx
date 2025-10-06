import React from "react";

interface PasswordInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  className = "",
  placeholder,
  autoComplete = "off",
}) => {
  const inputClasses = `
  input
  focus:outline-none
  ring-1
  focus:ring-2
  ${
    error
      ? "ring-red-500 focus:ring-red-500"
      : "ring-gray-300 focus:ring-accent"
  }
`;

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && " *"}
      </label>
      <input
        id={id}
        type="password"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
        autoComplete={autoComplete}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default PasswordInput;
