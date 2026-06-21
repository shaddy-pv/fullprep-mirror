import { avatarUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = 32,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const url = src && src.length > 0 ? src : avatarUrl(name);
  return (
    <img
      src={url}
      alt={name}
      width={size}
      height={size}
      className={cn("inline-block rounded-full border border-border-card object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}
