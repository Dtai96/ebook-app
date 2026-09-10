export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  description: string;
  coverColor: string;
  accentColor: string;
  coverMark: string;
  rating: number;
  readers: string;
  readTime: string;
  chapters: Chapter[];
};

export type Chapter = {
  id: string;
  number: number;
  title: string;
  duration: string;
  content: string[];
};
