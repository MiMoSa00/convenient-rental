import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // no cache
export const runtime = "nodejs";

type SearchBody = {
  location?: string;
  keywords?: string;
  propertyType?: string;   // "apartment" | "shared" | "studio" | "any" | ...
  apartmentType?: string;  // "self contain" | "2 bedroom" | "any" | ...
  priceRange?: string;     // "any" | "0-200000" | "200000-500000" | "2000000+"
  country?: string;        // e.g., "NG"
};

type ResultItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  location?: string;
  snippet?: string;
  thumbnail?: string;
  priceNaira?: number;
};

const PROVIDER_SITES_NG = [
  "propertypro.ng",
  "privateproperty.com.ng",
  "jiji.ng",
  "tolet.com.ng",
  "nigeriapropertycentre.com",
  "nairaland.com",
  "facebook.com/marketplace",
];

// Normalize URL by removing tracking params and trailing slashes
function normalizeUrl(u: string): string {
  try {
    const url = new URL(u);
    ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "igshid"].forEach((k) =>
      url.searchParams.delete(k)
    );
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return u;
  }
}

// Extract NGN price from text blobs
function parsePriceNaira(text: string): number | undefined {
  // e.g., ₦500,000 or NGN 1,200,000 or N 850000
  const m = text.match(/(?:₦|NGN|\bN)\s*([\d.,]+)/i);
  if (!m) return undefined;
  const numeric = m[1].replace(/[^\d]/g, "");
  if (!numeric) return undefined;
  const n = Number(numeric);
  return Number.isFinite(n) ? n : undefined;
}

// Filter price by selected range
function withinPriceRange(price: number | undefined, range: string | undefined): boolean {
  if (!range || range === "any" || price === undefined) return true;
  if (range.endsWith("+")) {
    const min = Number(range.replace("+", "").split("-")[0]);
    return price >= min;
  }
  const [minStr, maxStr] = range.split("-");
  const min = Number(minStr);
  const max = Number(maxStr);
  return price >= min && price <= max;
}

// Build a focused search query
function buildQuery(body: SearchBody): string {
  const parts: string[] = [];
  const loc = body.location?.trim();
  const kw = body.keywords?.trim();

  if (kw) parts.push(kw);
  if (body.apartmentType && body.apartmentType !== "any") {
    parts.push(`"${body.apartmentType}"`);
  }
  if (body.propertyType && body.propertyType !== "any") {
    parts.push(body.propertyType);
  }
  if (loc) {
    parts.push(`"${loc}"`);
  }
  // Rental context and Nigeria focus
  parts.push("rent OR to let OR letting");
  // Restrict to known local listing sites for relevance
  parts.push("(" + PROVIDER_SITES_NG.map((s) => `site:${s}`).join(" OR ") + ")");

  return parts.join(" ");
}

// Provider: SerpAPI (Google results)
async function fetchSerpApi(query: string, locationHint?: string) {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [] as ResultItem[];

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", key);
  if (locationHint) url.searchParams.set("location", locationHint); // e.g., "Nigeria"

  const res = await fetch(url.toString(), { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);

  const data = await res.json();
  const organic = (data?.organic_results || []) as any[];

  const items: ResultItem[] = organic.map((r: any, idx: number) => {
    const title: string = r.title || r.link || "Listing";
    const link: string = r.link || r.url;
    const snippet: string | undefined = r.snippet;
    const thumbnail: string | undefined = r.thumbnail;
    const source: string = (r.displayed_link || link || "").split("/")[2] || "serpapi";
    const price = parsePriceNaira(`${title} ${snippet || ""}`);

    return {
      id: `serpapi-${idx}-${link}`,
      title,
      url: link,
      source,
      snippet,
      thumbnail,
      priceNaira: price,
    };
  });

  return items;
}

// Dedupe by normalized URL
function dedupe(items: ResultItem[]): ResultItem[] {
  const seen = new Map<string, ResultItem>();
  for (const it of items) {
    const key = normalizeUrl(it.url);
    if (!seen.has(key)) seen.set(key, { ...it, url: key });
  }
  return Array.from(seen.values());
}

// Simple ranker: preferred domains > has price > others
function rank(items: ResultItem[], priceRange?: string): ResultItem[] {
  const domainWeight = new Map(PROVIDER_SITES_NG.map((d, i) => [d, PROVIDER_SITES_NG.length - i]));
  return items
    .filter((it) => withinPriceRange(it.priceNaira, priceRange))
    .sort((a, b) => {
      const da = domainWeight.get(new URL(a.url).hostname.replace(/^www\./, "")) || 0;
      const db = domainWeight.get(new URL(b.url).hostname.replace(/^www\./, "")) || 0;
      const pa = a.priceNaira ? 1 : 0;
      const pb = b.priceNaira ? 1 : 0;
      return db - da || pb - pa;
    });
}

// Demo fallback when no provider keys configured
function demoItems(body: SearchBody): ResultItem[] {
  const loc = body.location || "Lagos";
  const base: ResultItem[] = [
    {
      id: "demo-1",
      title: `Self Contain for Rent in ${loc}`,
      url: "https://propertypro.ng/listings/self-contain-demo",
      source: "propertypro.ng",
      location: loc,
      snippet: "Neat self contain, close to amenities.",
      priceNaira: 350000,
    },
    {
      id: "demo-2",
      title: `2 Bedroom Apartment - ${loc}`,
      url: "https://privateproperty.com.ng/listings/2-bedroom-demo",
      source: "privateproperty.com.ng",
      location: loc,
      snippet: "Spacious 2-bed with modern kitchen.",
      priceNaira: 1200000,
    },
    {
      id: "demo-3",
      title: `Duplex To Let in ${loc}`,
      url: "https://jiji.ng/listings/duplex-demo",
      source: "jiji.ng",
      location: loc,
      snippet: "Well-finished duplex in secure estate.",
      priceNaira: 3500000,
    },
  ];
  return rank(base, body.priceRange);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SearchBody;
    const query = buildQuery(body);
    const locationHint = body.country === "NG" ? "Nigeria" : undefined;

    // If no SerpAPI key, return demo items so UI works
    if (!process.env.SERPAPI_KEY) {
      return NextResponse.json(
        { items: demoItems(body) },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const serpItems = await fetchSerpApi(query, locationHint);
    const deduped = dedupe(serpItems).slice(0, 60);
    const ranked = rank(deduped, body.priceRange).slice(0, 36);

    return NextResponse.json(
      { items: ranked },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal error", items: [] },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}