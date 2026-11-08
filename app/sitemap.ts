import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://likitha.lk";
type SitemapEntry = { path: string; updatedAt?: Date };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const staticRoutes = ["/", "/browse", "/auth", "/login", "/register", "/privacy", "/terms"];

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
  const staticEntries: SitemapEntry[] = staticRoutes.map((path) => ({ path }));
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
