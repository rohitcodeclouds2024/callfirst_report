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
  const inputClasses = `w-full bg-white dark:bg-background px-4 py-3 text-sm border border-border rounded-md focus:outline-none ${ error ? "border-red-500 focus:border-red-500" : "focus:border-primary" }`.trim();

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2" htmlFor={id}>
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
