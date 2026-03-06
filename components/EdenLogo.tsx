import Image from "next/image";

type EdenLogoProps = {
  className?: string;
  size?: "default" | "compact";
};

const logoSizes = {
  default: { width: 92, height: 35 },
  compact: { width: 78, height: 30 },
} as const;

export function EdenLogo({ className = "", size = "default" }: EdenLogoProps) {
  const dimensions = logoSizes[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full px-3 py-2 ${className}`}
      style={{
        background: "rgba(253,252,248,0.82)",
        border: "1px solid rgba(122,158,122,0.18)",
        boxShadow: "0 6px 20px rgba(122,158,122,0.12)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Image
        src="/eden-logo.png"
        alt="Eden logo"
        width={dimensions.width}
        height={dimensions.height}
        className="h-auto w-auto"
        priority
      />
    </div>
  );
}
