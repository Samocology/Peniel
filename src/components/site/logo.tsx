export function Logo({ tone = "default" }: { tone?: "default" | "invert" }) {
  return (
    <span className="flex items-center gap-2">
      <img
        src="/p-logo.png"
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 rounded-lg border border-border/60 object-contain"
      />
    </span>
  );
}
