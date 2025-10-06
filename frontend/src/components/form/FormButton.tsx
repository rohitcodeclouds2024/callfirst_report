import React from "react";

interface FormButtonProps {
  type?: "button" | "submit";
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?:
    | "primary"
    | "secondary"
    | "accent"
    | "paginate"
    | "icon"
    | "delete"
    | "deleteAll"
    | "edit"
    | "unstyled";
  icon?: React.ReactNode;
  iconOnly?: boolean;
  showLabel?: boolean;
  tooltip?: string;
  className?: string;
  id?: string;
  iconPosition?: "left" | "right";
}

const FormButton: React.FC<FormButtonProps> = ({
  type = "button",
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  icon,
  iconOnly = false,
  showLabel = true,
  tooltip,
  className = "",
  id = "",
  iconPosition = "left",
}) => {
  const base = "custom-button";

  const variants = {
    primary:
      base +
      " btn w-full flex items-center justify-center gap-2 text-white bg-gradient-to-br from-primary-dark to-background hover:opacity-90",
    secondary: base + " ",
    accent: base + " ",
    unstyled:
      base +
      " px-3 py-1 rounded-md border border-border hover:bg-muted/10 disabled:opacity-50",
    icon: base + " p-2 rounded hover:text-accent text-primary",
    delete: base + " text-primary custom-delete",
    edit: base + " custom-edit",
    deleteAll: base + " custom-delete-all",
    paginate: base + " custom-paginate",
  };

  const buttonClass = `${variants[variant]} ${className} ${
    disabled || loading ? "opacity-60 cursor-not-allowed" : ""
  }`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClass}
      title={tooltip || label}
      id={id}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
      ) : (
        <>
          {icon && iconPosition === "left" && icon}
          {!iconOnly && showLabel && <span>{label}</span>}
          {icon && iconPosition === "right" && icon}
        </>
      )}
    </button>
  );
};

export default FormButton;
