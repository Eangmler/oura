import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-medium transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-pill";

    const sizeStyles = {
      sm: "px-4 py-2 text-xs",
      md: "px-5 py-3 text-sm",
      lg: "px-7 py-3.5 text-base font-semibold",
    };

    const variantStyles = {
      primary: "bg-accent hover:bg-accent-hover text-white shadow-sm hover:shadow",
      secondary: "bg-ink hover:bg-ink/90 text-white",
      outline: "border border-line hover:border-ink/20 text-ink bg-transparent",
      ghost: "hover:bg-soft text-ink",
      danger: "bg-status-red text-white hover:bg-status-red/90",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
