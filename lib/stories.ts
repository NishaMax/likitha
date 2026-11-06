export const genres = [
  "All stories",
  "Romance",
  "Drama",
  "Fantasy",
  "Mystery",
  "Folklore",
] as const;

export type Genre = (typeof genres)[number];
export type SortOption = "Trending" | "Newest" | "Most read";

export type Story = {
  id: string;
  title: string;
  author: string;
  genre: Exclude<Genre, "All stories">;
  chapters: number;
  readers: string;
  description: string;
  color: string;
  featured?: boolean;
};

export const stories: Story[] = [
  {
    id: "awasaan-wessa",
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
    title: "ඔබ නැති දවසක",
    author: "නෙත්මි අබේකෝන්",
    genre: "Romance",
    chapters: 10,
    readers: "1.9k",
    description: "වෙන්වීමකින් පසු නැවත හමුවන හදවත් දෙකක්.",
    color: "from-[#714558] via-[#423043] to-[#1e202d]",
  },
];
