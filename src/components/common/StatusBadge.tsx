type Variant = "success" | "warning" | "danger" | "info" | "muted" | "primary";

const styles: Record<Variant, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  muted: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/15 text-primary border-primary/30",
};

export function StatusBadge({
  label,
  variant = "muted",
  icon,
}: {
  label: string;
  variant?: Variant;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${styles[variant]}`}
    >
      {icon}
      {label}
    </span>
  );
}
