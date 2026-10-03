export type Chapter = {
  id: string;
  bookId: string;
  number: number;
  title: string;
  content: string[];
};

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  categoryId: number;
  description: string;
  coverUrl: string | null;
  viewCount: number;
  chaptersCount: number;
  chapters: Chapter[];
};

export type BookCategory = { id: number; name: string; booksCount: number };
