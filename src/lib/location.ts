export const MARKETPLACE_LOCATIONS = [
  "Abia State",
  "Adamawa State",
  "Akwa Ibom State",
  "Anambra State",
  "Bauchi State",
  "Bayelsa State",
  "Benue State",
  "Borno State",
  "Cross River State",
  "Delta State",
  "Ebonyi State",
  "Edo State",
  "Ekiti State",
  "Enugu State",
  "Federal Capital Territory",
  "Gombe State",
  "Imo State",
  "Jigawa State",
  "Kaduna State",
  "Kano State",
  "Katsina State",
  "Kebbi State",
  "Kogi State",
  "Kwara State",
  "Lagos State",
  "Nasarawa State",
  "Niger State",
  "Ogun State",
  "Ondo State",
  "Osun State",
  "Oyo State",
  "Plateau State",
  "Rivers State",
  "Sokoto State",
  "Taraba State",
  "Yobe State",
  "Zamfara State",
] as const;

const LOCATION_ALIASES: Record<string, string[]> = {
  "Federal Capital Territory": ["federal capital territory", "abuja", "fct"],
  "Lagos State": ["lagos", "lekki", "ikoyi", "victoria island", "surulere", "ikeja"],
  "Abia State": ["abia", "umuahia", "aba"],
  "Adamawa State": ["adamawa", "yola", "jimeta"],
  "Akwa Ibom State": ["akwa ibom", "uyo", "eket"],
  "Anambra State": ["anambra", "awka", "onitsha", "nnewi"],
  "Bauchi State": ["bauchi", "misau"],
  "Bayelsa State": ["bayelsa", "yenagoa"],
  "Benue State": ["benue", "makurdi"],
  "Borno State": ["borno", "maiduguri"],
  "Cross River State": ["cross river", "calabar", "akampa"],
  "Delta State": ["delta", "asaba", "warri"],
  "Ebonyi State": ["ebonyi", "abakaliki"],
  "Edo State": ["edo", "benin", "ekpoma"],
  "Ekiti State": ["ekiti", "ado ekiti"],
  "Enugu State": ["enugu", "nsukka"],
  "Gombe State": ["gombe"],
  "Imo State": ["imo", "owerri", "orlu"],
  "Jigawa State": ["jigawa", "dujima", "hadejia"],
  "Kaduna State": ["kaduna", "zaria", "kafanchan"],
  "Kano State": ["kano", "kano city"],
  "Katsina State": ["katsina", "daura"],
  "Kebbi State": ["kebbi", "birnin kebbi"],
  "Kogi State": ["kogi", "lokoja", "anyigba"],
  "Kwara State": ["kwara", "ilorin"],
  "Nasarawa State": ["nasarawa", "lafia"],
  "Niger State": ["niger", "minna"],
  "Ogun State": ["ogun", "abeokuta", "sagamu"],
  "Ondo State": ["ondo", "akure", "ondo city"],
  "Osun State": ["osun", "osogbo", "ife"],
  "Oyo State": ["oyo", "ibadan", "ogbomoso"],
  "Plateau State": ["plateau", "jos"],
  "Rivers State": ["rivers", "port harcourt", "ph"],
  "Sokoto State": ["sokoto", "sokoto city"],
  "Taraba State": ["taraba", "jalingo"],
  "Yobe State": ["yobe", "damaturu"],
  "Zamfara State": ["zamfara", "gusau"],
};

const LOCATION_NAME_TO_STATE = new Map<string, string>();

for (const state of MARKETPLACE_LOCATIONS) {
  LOCATION_NAME_TO_STATE.set(state.toLowerCase(), state);
  LOCATION_NAME_TO_STATE.set(state.toLowerCase().replace(/\s+state$/i, ""), state);
}

for (const [state, aliases] of Object.entries(LOCATION_ALIASES)) {
  for (const alias of aliases) {
    LOCATION_NAME_TO_STATE.set(alias.toLowerCase(), state);
  }
}

function resolveLocationState(value: string): string | undefined {
  const cleaned = value
    .replace(/,\s*(?:NG|Nigeria)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return undefined;

  if (LOCATION_NAME_TO_STATE.has(cleaned.toLowerCase())) {
    return LOCATION_NAME_TO_STATE.get(cleaned.toLowerCase());
  }

  const parts = cleaned
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    if (!part) continue;
    const resolved = LOCATION_NAME_TO_STATE.get(part.toLowerCase());
    if (resolved) return resolved;
  }

  return undefined;
}

export function normalizeLocationLabel(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Lagos State";

  const resolved = resolveLocationState(trimmed);
  if (resolved) return resolved;

  if (trimmed.toLowerCase() === "fct" || trimmed.toLowerCase() === "abuja")
    return "Federal Capital Territory";
  if (/state$/i.test(trimmed)) return trimmed;
  if (!trimmed.includes(",")) return `${trimmed}`;
  return trimmed;
}

export function getMarketplaceLocationLabel(value: string) {
  const normalized = normalizeLocationLabel(value);
  return (
    MARKETPLACE_LOCATIONS.find((location) => location.toLowerCase() === normalized.toLowerCase()) ??
    "Lagos State"
  );
}

export function parseLocation(value: string) {
  const normalized = normalizeLocationLabel(value);
  const city = normalized
    .replace(/\s+State$/i, "")
    .replace(/^Federal Capital Territory$/i, "Abuja")
    .trim();
  return { city, label: normalized };
}

export function locationMatches(vendorLocation: string, selectedLocation: string) {
  const current = normalizeLocationLabel(selectedLocation);
  const { city, label } = parseLocation(current);

  if (!city) return true;

  const haystack = vendorLocation.toLowerCase();
  const aliases = new Set([
    city.toLowerCase(),
    label.toLowerCase(),
    ...(LOCATION_ALIASES[label] ?? []),
    ...(LOCATION_ALIASES[city] ?? []),
  ]);

  return [...aliases].some((alias) => haystack.includes(alias.toLowerCase()));
}
