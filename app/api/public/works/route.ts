import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const works = await prisma.work.findMany({
    where: { status: "APPROVED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      genre: true,
      content: true,
      author: { select: { displayName: true, username: true, tier: true } },
      _count: { select: { chapters: true } },
    },
  });

  return NextResponse.json({
    works: works.map((work) => ({
      id: work.id,
      type: work.type === "STORY" ? "Stories" : work.type === "POETRY" ? "Poetry" : "Songs",
      title: work.title,
      author: work.author.displayName,
      authorUsername: work.author.username,
      genre: work.genre,
      description: work.description,
      content: work.content,
      chapters: work.type === "STORY" ? work._count.chapters : undefined,
      readers: "New",
      color: work.type === "STORY" ? "from-[#334c50] via-[#273443] to-[#1b202c]" : work.type === "POETRY" ? "from-[#4c4a70] via-[#34344f] to-[#1b202c]" : "from-[#6d4b68] via-[#403149] to-[#1d202d]",
    })),
  });
}
