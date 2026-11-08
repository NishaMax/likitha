import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { stories, works } from "@/lib/stories";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://likitha.lk";
type SitemapEntry = { path: string; updatedAt?: Date };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const staticRoutes = ["/", "/browse", "/auth", "/login", "/register", "/privacy", "/terms"];
  const sampleRoutes = works.map((work) => (work.type === "Stories" ? `/story/${work.id}` : `/work/${work.id}`));
  const sampleChapterRoutes = stories.flatMap((story) =>
    Array.from({ length: story.chapters }, (_, index) => `/story/${story.id}/chapter/${index + 1}`),
  );

  const approvedWorks = await prisma.work.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      type: true,
      updatedAt: true,
      author: { select: { username: true } },
      chapters: { where: { status: "APPROVED" }, select: { chapterNo: true, updatedAt: true } },
    },
  });
  const databaseRoutes = approvedWorks.flatMap((work) => [
    { path: work.type === "STORY" ? `/story/${work.id}` : `/work/${work.id}`, updatedAt: work.updatedAt },
    { path: `/writer/${work.author.username}`, updatedAt: work.updatedAt },
    ...work.chapters.map((chapter) => ({
      path: `/story/${work.id}/chapter/${chapter.chapterNo}`,
      updatedAt: chapter.updatedAt,
    })),
  ]);
  const staticEntries: SitemapEntry[] = [...staticRoutes, ...sampleRoutes, ...sampleChapterRoutes].map((path) => ({ path }));
  const entries = [...staticEntries, ...databaseRoutes];
  const seen = new Set<string>();

  return entries.filter(({ path }) => {
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  }).map(({ path, updatedAt }) => ({
    url: new URL(path, siteUrl).toString(),
    ...(updatedAt ? { lastModified: updatedAt } : {}),
    changeFrequency: path === "/" || path === "/browse" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/browse" ? 0.9 : 0.7,
  }));
}
