import Image from "next/image";

export function BrandLogo({
  className = "",
  size = 80,
  priority = false,
}: {
  className?: string;
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo/zs-logo-256.png"
      alt="Zain and Sonia"
      width={size}
      height={size}
      className={`brand-logo ${className}`}
      priority={priority}
    />
  );
}
