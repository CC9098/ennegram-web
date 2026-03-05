"use client";

export function LeafTopRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none select-none ${className}`}
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M160 10 C160 10 80 20 40 80 C20 110 30 150 60 160 C90 170 140 130 160 80 C175 45 165 15 160 10Z"
        fill="#A8C5A0"
        opacity="0.25"
      />
      <path
        d="M160 10 C130 40 100 70 60 160"
        stroke="#7A9E7A"
        strokeWidth="1.5"
        opacity="0.35"
        strokeLinecap="round"
      />
      <path
        d="M160 10 C145 55 120 90 60 160"
        stroke="#7A9E7A"
        strokeWidth="0.8"
        opacity="0.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LeafBottomLeft({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`absolute pointer-events-none select-none ${className}`}
      width="140"
      height="140"
      viewBox="0 0 140 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 130 C20 130 100 120 130 60 C145 30 120 -5 90 5 C60 15 20 60 10 100 C3 125 15 132 20 130Z"
        fill="#A8C5A0"
        opacity="0.2"
      />
      <path
        d="M20 130 C55 100 85 70 90 5"
        stroke="#7A9E7A"
        strokeWidth="1.2"
        opacity="0.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SmallLeaf({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`inline-block pointer-events-none select-none ${className}`}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 2 C10 2 2 6 2 12 C2 16 6 18 10 18 C14 18 18 16 18 12 C18 6 10 2 10 2Z"
        fill="#7A9E7A"
        opacity="0.6"
      />
      <path d="M10 2 L10 18" stroke="#5A7E5A" strokeWidth="0.8" opacity="0.5" strokeLinecap="round" />
    </svg>
  );
}
