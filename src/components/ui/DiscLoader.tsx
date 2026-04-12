"use client";

export function DiscLoader() {
  return (
    <span className="inline-flex items-center justify-center">
      <span className="disc-loader relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-garimpo-dark/20 bg-garimpo-dark/5">
        <span className="absolute h-4 w-4 rounded-full border border-garimpo-dark/40" />
        <span className="absolute h-2 w-2 rounded-full bg-garimpo-rust" />
      </span>
    </span>
  );
}
