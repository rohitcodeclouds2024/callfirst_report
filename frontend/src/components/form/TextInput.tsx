import React from "react";

interface TextInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  showLabel?: boolean;
  iconLeft?: React.ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label = "",
  value,
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  onKeyUp,
  onInput,
  type = "text",
  required = false,
  error,
  placeholder,
  className = "",
  labelClassName = "",
  showLabel = true,
  iconLeft,
  disabled = false,
  readOnly = false,
  autoComplete = "off",
}) => {
  const inputClasses = `w-full px-4 py-3 bg-white dark:bg-background text-sm border border-border rounded-md focus:outline-none ${ iconLeft ? "pl-10" : "" } ${ error ? "ring-red-500 focus:border-red-500" : "ring-gray-300 focus:border-primary" } ${ disabled ? "opacity-50 cursor-not-allowed bg-muted/10" : "" } ${ className }`.trim();

  return (
    <div className="relative">
      {showLabel && (
        <label htmlFor={id} className={`block text-sm font-medium mb-2 ${labelClassName}`}>
          {label}
          {required && " *"}
        </label>
      )}

      {iconLeft && (
        <div className="absolute top-1/2 left-4 -translate-y-1/2 text-muted pointer-events-none">
          {iconLeft}
        </div>
      )}

      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onInput={onInput}
        autoComplete={autoComplete}
        className={inputClasses}
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TextInput;
