import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md";

const v: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-surface-elevated text-foreground hover:bg-surface-hover border border-border",
  ghost: "text-foreground/80 hover:bg-surface-hover",
  danger: "bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/30",
  outline: "border border-border text-foreground hover:bg-surface-hover",
};
const s: Record<Size, string> = { sm: "text-[11px] px-2.5 py-1.5", md: "text-xs px-3 py-1.5" };

export function ActionButton({
  variant = "secondary",
  size = "md",
  icon,
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; icon?: ReactNode }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${v[variant]} ${s[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}
