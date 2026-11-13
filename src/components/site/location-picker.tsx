import { Check, ChevronDown, MapPin } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MARKETPLACE_LOCATIONS } from "@/lib/location";
import { useState } from "react";

function locationName(location: string) {
  return location === "Federal Capital Territory" ? "Abuja" : location.replace(/ State$/, "");
}

export function LocationPicker({
  value,
  onChange,
  className = "",
}: {
  value: string;
  onChange: (location: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Choose location. Current location: ${locationName(value)}`}
          aria-expanded={open}
          className={`flex h-11 min-w-40 items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 text-left shadow-sm transition hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <MapPin className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] leading-4 font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                Location
              </span>
              <span className="block truncate text-sm leading-4 font-semibold text-foreground">
                {locationName(value)}
              </span>
            </span>
          </span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border-border p-0 shadow-xl"
      >
        <Command>
          <div className="border-b border-border bg-muted/30 px-4 py-3">
            <p className="text-sm font-semibold">Choose your location</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Find businesses and services across Nigeria
            </p>
          </div>
          <CommandInput placeholder="Search a city or state..." className="h-11" />
          <CommandList className="max-h-72 p-1.5">
            <CommandEmpty className="py-8 text-sm text-muted-foreground">
              No matching city or state.
            </CommandEmpty>
            <CommandGroup heading="Nigeria">
              {MARKETPLACE_LOCATIONS.map((location) => (
                <CommandItem
                  key={location}
                  value={`${locationName(location)} ${location}`}
                  onSelect={() => {
                    onChange(location);
                    setOpen(false);
                  }}
                  className="min-h-10 rounded-lg px-3 aria-selected:bg-primary-soft aria-selected:text-primary"
                >
                  <MapPin className="size-4 text-muted-foreground" />
                  <span>{locationName(location)}</span>
                  <span className="text-xs text-muted-foreground">
                    {location === "Federal Capital Territory" ? "FCT" : "State"}
                  </span>
                  {value === location && <Check className="ml-auto size-4 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
