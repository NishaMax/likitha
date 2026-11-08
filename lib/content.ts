export const contentTypes = ["All", "Stories", "Poetry", "Songs"] as const;
export type ContentTypeFilter = (typeof contentTypes)[number];
export type ContentType = Exclude<ContentTypeFilter, "All">;

export const genres = [
  "All genres",
  "Romance",
  "Drama",
  "Fantasy",
  "Mystery",
  "Folklore",
  "Love",
  "Nature",
] as const;

export type Genre = (typeof genres)[number];
export type SortOption = "Trending" | "Newest" | "Most read";

export type Work = {
  id: string;
  type: ContentType;
  title: string;
  author: string;
  authorUsername?: string;
  genre: Exclude<Genre, "All genres">;
  readers: string;
  description: string;
  content?: string | null;
  color: string;
  coverImageUrl?: string | null;
  coverColor?: string;
  coverTemplate?: string;
  likes?: number;
  comments?: number;
  chapters?: number;
};
