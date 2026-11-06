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
  genre: Exclude<Genre, "All genres">;
  readers: string;
  description: string;
  color: string;
  featured?: boolean;
  chapters?: number;
};

export type Story = Work & {
  type: "Stories";
  chapters: number;
};

export const works: Work[] = [
  {
    id: "awasaan-wessa",
    type: "Stories",
    title: "අවසන් වැස්ස",
    author: "දිනුෂා පෙරේරා",
    genre: "Romance",
    chapters: 12,
    readers: "2.4k",
    description: "සමහර මතක වැස්සක් වගේ. නැවත නැවතත් එනවා.",
    color: "from-[#704c3b] via-[#3f3340] to-[#1d202d]",
    featured: true,
  },
  {
    id: "sandakada-pahana",
    type: "Stories",
    title: "සඳකඩ පහණ",
    author: "කවිඳු රණසිංහ",
    genre: "Drama",
    chapters: 8,
    readers: "1.8k",
    description: "පරණ ගමක සැඟවුණු කතාවක් සහ එය සොයන තරුණයෙක්.",
    color: "from-[#334c50] via-[#273443] to-[#1b202c]",
  },
  {
    id: "walakulu-atharin",
    type: "Stories",
    title: "වලාකුළු අතරින්",
    author: "සචිනි ජයවර්ධන",
    genre: "Fantasy",
    chapters: 21,
    readers: "3.1k",
    description: "අහසින් එහා ලෝකයකට විවෘත වන දොරටුවක්.",
    color: "from-[#4a3e68] via-[#302b4d] to-[#1c202d]",
  },
  {
    id: "gini-diyawara",
    type: "Stories",
    title: "ගිනි දියවර",
    author: "මලිත් ප්‍රනාන්දු",
    genre: "Mystery",
    chapters: 6,
    readers: "1.2k",
    description: "නගරය නිහඬ වූ රාත්‍රියේ ආරම්භ වූ රහසක්.",
    color: "from-[#63423c] via-[#382c36] to-[#1b202b]",
  },
  {
    id: "mahagedara",
    type: "Stories",
    title: "මහගෙදර",
    author: "තරුෂි වික්‍රමසිංහ",
    genre: "Folklore",
    chapters: 15,
    readers: "2.7k",
    description: "පරම්පරා ගණනක් රැකගත් ගෙදරක අවසන් උරුමකරු.",
    color: "from-[#5a5139] via-[#39372f] to-[#20232c]",
  },
  {
    id: "oba-nathi-dawasaka",
    type: "Stories",
    title: "ඔබ නැති දවසක",
    author: "නෙත්මි අබේකෝන්",
    genre: "Romance",
    chapters: 10,
    readers: "1.9k",
    description: "වෙන්වීමකින් පසු නැවත හමුවන හදවත් දෙකක්.",
    color: "from-[#714558] via-[#423043] to-[#1e202d]",
  },
  {
    id: "sanda-kirini",
    type: "Poetry",
    title: "සඳ කිරණි",
    author: "මනෝජ් දිසානායක",
    genre: "Love",
    readers: "980",
    description: "නිහඬ රාත්‍රියක හිතට ඇසෙන කෙටි කවි එකතුවක්.",
    color: "from-[#4c4a70] via-[#34344f] to-[#1b202c]",
  },
  {
    id: "wassa-enna",
    type: "Poetry",
    title: "වැස්ස එන්න",
    author: "සචිනි ජයවර්ධන",
    genre: "Nature",
    readers: "760",
    description: "වැස්ස, මතක සහ මිනිස් හදවත් ගැන ලියැවුණු කවි.",
    color: "from-[#31565a] via-[#294048] to-[#1b202c]",
  },
  {
    id: "oba-nam",
    type: "Songs",
    title: "ඔබ නම්",
    author: "කවිඳු රණසිංහ",
    genre: "Love",
    readers: "1.1k",
    description: "ගී පදයක් වගේ මතකයේ රැඳෙන ආදරයේ වචන.",
    color: "from-[#6d4b68] via-[#403149] to-[#1d202d]",
  },
];

export const stories = works.filter((work): work is Story => work.type === "Stories");
