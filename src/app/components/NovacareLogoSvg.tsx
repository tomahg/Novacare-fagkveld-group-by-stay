"use client";

export default function NovacareLogoSvg({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={className}>
      <img
        src="/logo.png"
        alt="Novacare"
        className="h-full"
        style={{ objectFit: "contain", objectPosition: "left" }}
      />
      <span
        className="block text-gray-500 tracking-widest pl-[60px]"
        style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "1.125em" }}
      >
        fagkveld
      </span>
    </div>
  );
}
