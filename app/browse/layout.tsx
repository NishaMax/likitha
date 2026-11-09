import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Stories, Poetry & Songs",
  description:
    "Explore the collection of Sinhala stories, novels, poetry, and song lyrics on Likitha.",
  alternates: {
    canonical: "/browse",
  },
  openGraph: {
    title: "Browse Stories, Poetry & Songs | Likitha",
    description:
      "Explore the collection of Sinhala stories, novels, poetry, and song lyrics on Likitha.",
    url: "https://likitha.lk/browse",
  },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}

