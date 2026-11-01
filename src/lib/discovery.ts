import { vendors, type Vendor } from "./data";
import { locationMatches } from "./location";

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

function vendorSearchText(vendor: Vendor) {
  return [
    vendor.name,
    vendor.tagline,
    vendor.about,
    vendor.categoryLabel,
    vendor.categorySlug,
    vendor.location,
    ...vendor.products.flatMap((product) => [product.name, product.desc, product.group]),
  ].join(" ");
}

export function searchVendors(query: string, location: string) {
  return vendors.filter(
    (vendor) =>
      locationMatches(vendor.location, location) &&
      (!query.trim() || matchesQuery(vendorSearchText(vendor), query)),
  );
}

export function searchProducts(query: string, location: string) {
  return vendors.flatMap((vendor) =>
    vendor.products
      .filter(
        (product) =>
          locationMatches(vendor.location, location) &&
          (!query.trim() ||
            matchesQuery(
              [vendor.name, vendor.categoryLabel, product.name, product.desc, product.group].join(
                " ",
              ),
              query,
            )),
      )
      .map((product) => ({ ...product, vendor })),
  );
}
