import BrowseClient from "./BrowseClient";

export const metadata = {
  title: "Browse Rentals | Affordable Housing",
  description:
    "Find affordable apartments and rooms in Nigeria. Filter by location, price, apartment type, and more.",
  openGraph: {
    title: "Browse Rentals | Affordable Housing",
    description:
      "Discover rental listings across Nigeria. Search by location, price, apartment type (self contain, 2 bedroom, duplex, etc.).",
    type: "website",
  },
  alternates: {
    canonical: "/dashboard/browse",
  },
};

export default function BrowsePage() {
  // Server component wrapper for SEO; renders client UI
  return <BrowseClient />;
}