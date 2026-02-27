// Profile data from public.profiles table (linked to auth.users)
export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  designation: string | null;
};

// Category from public.categories table
export type Category = {
  id: string;
  name: string;
  slug: string;
  views: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

// Post status enum matching database
export type PostStatus = 'draft' | 'published';

// Post from public.posts table
export type Post = {
  id: string;
  title: string | null;
  slug: string | null;
  thumbnail: string | null;
  author_id: string;
  description: string | null;
  content: string;
  time_read: number | null;
  published: string;
  views: number;
  status: PostStatus;
  created_at: string;
  updated_at: string;
  // Relationships (populated via joins)
  author?: Profile;
  categories?: Category[];
  view_count?: number;
};

// Paginated response type
export type PaginatedPosts = {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
};

// Legacy type aliases for backward compatibility
export type Categories = Category;
export type Blog = Post;