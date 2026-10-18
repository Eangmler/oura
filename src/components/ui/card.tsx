import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "white" | "dark" | "soft";
}

export const Card = ({
  children,
  className = "",
  variant = "white",
  ...props
}: CardProps) => {
  const variantStyles = {
    white: "bg-card text-ink border border-line/40 shadow-subtle",
    dark: "bg-ink text-white",
    soft: "bg-soft text-ink",
  };

  return (
    <div
      className={`rounded-card p-5 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
