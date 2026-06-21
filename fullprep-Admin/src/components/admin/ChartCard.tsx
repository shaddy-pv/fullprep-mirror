import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col rounded-2xl border border-border-card bg-surface p-6 shadow-sm", className)}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium tracking-tight text-text-primary">{title}</h3>
          {subtitle && <p className="mt-1 text-[13px] text-text-secondary">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 w-full min-h-0 relative">{children}</div>
    </div>
  );
}
