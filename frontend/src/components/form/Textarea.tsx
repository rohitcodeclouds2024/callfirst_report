import React from "react";

interface TextareaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  required = false,
  error,
  placeholder,
}) => (
  <div className="form-group">
    <label className="form-label">{label}{required && " *"}</label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`textarea ${error ? "border-red-500" : ""}`}
    ></textarea>
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);