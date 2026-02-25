type Author = {
  name: string;
  image: string;
  designation: string;
};

export type Categories = {
  slug: string;
  name: string;
}

export type Blog = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  published: string;
  slug: string;
  categories: Categories[];
  author: Author;
};