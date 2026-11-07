import type { MetadataRoute } from "next";
import { stories, works } from "@/lib/stories";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://likitha.lk";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/browse", "/auth", "/login", "/register"];
  const sampleRoutes = works.map((work) => (work.type === "Stories" ? `/story/${work.id}` : `/work/${work.id}`));
  const sampleChapterRoutes = stories.flatMap((story) =>
    Array.from({ length: story.chapters }, (_, index) => `/story/${story.id}/chapter/${index + 1}`),
  );

  return [...staticRoutes, ...sampleRoutes, ...sampleChapterRoutes].map((path) => ({
    url: new URL(path, siteUrl).toString(),
    changeFrequency: path === "/" || path === "/browse" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/browse" ? 0.9 : 0.7,
  }));
}
