import { Link } from "@tanstack/react-router";
import { Check, Eye, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import type { Vendor } from "@/lib/data";
import { defaultTemplateFor, templatesFor, type StoreTemplate } from "@/lib/templates";
import { canPickStorefront, storefrontStore, useStorefront, type Plan } from "@/lib/storefront-store";

function Thumb({ tpl }: { tpl: StoreTemplate }) {
  const t = tpl.theme;
  const heroH = tpl.hero === "banner" || tpl.kind === "signature" ? "h-14" : "h-10";
  return (
    <div className="aspect-[4/3] overflow-hidden p-2" style={{ background: t.bg, color: t.ink }}>
      <div className={heroH + " flex items-end p-1.5"} style={{ background: tpl.hero === "poster" ? t.accent : t.soft, borderRadius: 4 }}>
        <span className={"truncate text-[11px] leading-none font-bold " + (tpl.caps ? "uppercase" : "")} style={{ fontFamily: t.heading, color: tpl.hero === "poster" ? t.accentInk : t.ink }}>
          {tpl.name}
        </span>
      </div>
      <div className={"mt-1.5 grid gap-1 " + (tpl.catalog === "list" || tpl.catalog === "board" ? "grid-cols-1" : "grid-cols-3")}>
        {Array.from({ length: tpl.catalog === "list" || tpl.catalog === "board" ? 3 : 6 }).map((_, i) => (
          <span key={i} className={tpl.catalog === "list" || tpl.catalog === "board" ? "h-2" : "h-5"} style={{ background: i % 2 ? t.soft : t.accent + "55", borderRadius: 2 }} />
        ))}
      </div>
    </div>
  );
}

/** Storefront design chooser used in onboarding and store settings. */
export function TemplatePicker({ vendor }: { vendor: Vendor }) {
  const s = useStorefront();
  const current = s.choices[vendor.slug] ?? defaultTemplateFor(vendor).id;
  const picks = s.picks[vendor.slug] ?? 0;
  const unlocked = canPickStorefront(s.plan, picks);
  const [msg, setMsg] = useState<string | null>(null);
  const list = templatesFor(vendor.type);

  const pick = (id: string) => {
    if (id === current) return;
    const ok = storefrontStore.choose(vendor.slug, id);
    setMsg(ok ? "Storefront updated. Customers now see the new design." : "Free plan includes one storefront choice. Upgrade to switch again.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
        <span className="min-w-0">
          Plan: <b className="capitalize">{s.plan === "starter" ? "Starter (free)" : s.plan}</b> ·{" "}
          {s.plan === "starter"
            ? picks === 0
              ? "you can choose 1 storefront design"
              : "storefront choice used"
            : "switch designs any time"}
        </span>
        <span className="flex gap-1">
          {(["starter", "growth", "business"] as Plan[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => storefrontStore.setPlan(p)}
              className={"rounded-full px-3 py-1 text-xs font-semibold capitalize " + (s.plan === p ? "bg-primary text-primary-foreground" : "border border-border")}
            >
              {p}
            </button>
          ))}
        </span>
      </div>

      {!unlocked && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm">
          <span className="flex items-center gap-2"><Lock className="size-4" /> Your free storefront choice is used. Upgrade to change design.</span>
          <Link to="/pricing" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Upgrade</Link>
        </div>
      )}
      {msg && <p role="status" className="text-sm font-medium text-primary">{msg}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {list.map((tpl) => {
          const active = tpl.id === current;
          const rec = tpl.bestFor.includes(vendor.type);
          const locked = !active && !unlocked;
          return (
            <div key={tpl.id} className={"overflow-hidden rounded-xl border bg-card transition " + (active ? "border-primary ring-2 ring-primary" : "border-border")}>
              <button type="button" onClick={() => pick(tpl.id)} disabled={locked} className="relative block w-full text-left disabled:cursor-not-allowed">
                <Thumb tpl={tpl} />
                {active && <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="size-3.5" /></span>}
                {locked && <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-card/90"><Lock className="size-3" /></span>}
              </button>
              <div className="p-2.5">
                <p className="flex items-center gap-1 truncate text-sm font-bold">
                  {tpl.name}
                  {tpl.id === defaultTemplateFor(vendor).id && <span className="rounded bg-muted px-1 text-[9px] font-bold uppercase">Default</span>}
                </p>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">{tpl.vibe}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  {rec ? <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary"><Sparkles className="size-3" /> Fits you</span> : <span />}
                  <Link to="/store/$slug" params={{ slug: vendor.slug }} search={{ t: tpl.id }} className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                    <Eye className="size-3" /> Preview
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
