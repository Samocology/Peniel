export function Logo({ tone = "default" }: { tone?: "default" | "invert" }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">
        V
      </span>
      <span
        className={
          "font-display text-lg font-bold tracking-tight " +
          (tone === "invert" ? "text-primary-foreground" : "text-foreground")
        }
      >
        Vendra
      </span>
    </span>
  );
}
