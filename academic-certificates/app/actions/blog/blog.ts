"use server";

import { createClient } from "@/lib/supabase/server";
import { Post, Category, PaginatedPosts } from "@/types/blog";
import { cache } from "react";
import { headers } from "next/headers";

const PAGE_SIZE = 10;

/**
 * Get paginated list of published posts with author and category data
 * @param page - Page number (1-indexed)
 * @returns Paginated posts with metadata
 */
export const getPostsPage = cache(async (page: number = 1): Promise<PaginatedPosts> => {
    const supabase = await createClient();
    const offset = (page - 1) * PAGE_SIZE;

    // Get posts with count
    const { data, error, count } = await supabase
        .from("posts")
        .select(
            `
      *,
      author:users(id_user, full_name, avatar_url, designation),
      categories:post_categories(
        category:categories(id, name, slug, views)
      )
    `,
            { count: "exact" }
        )
        .eq("status", "published")
        .order("published", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
        console.error("Error fetching posts:", error);
        throw new Error(`Failed to fetch posts: ${error.message}`);
    }

    // Transform the data to flatten categories
    const posts: Post[] = (data || []).map((post: any) => ({
        ...post,
        categories: post.categories?.map((pc: any) => pc.category) || [],
    }));

    return {
        posts,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / PAGE_SIZE),
        currentPage: page,
        pageSize: PAGE_SIZE,
    };
});

/**
 * Get a single post by slug with full details
 * @param slug - Post slug
 * @returns Post with author and categories
 */
export const getPost = cache(async (slug: string): Promise<Post | null> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("posts")
        .select(
            `
      *,
      author:users(id_user, full_name, avatar_url, designation),
      categories:post_categories(
        category:categories(id, name, slug, views)
      )
    `
        )
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

    if (error) {
        console.error("Error fetching post:", error);
        throw new Error(`Failed to fetch post: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    // Transform the data to flatten categories
    return {
        ...data,
        categories: data.categories?.map((pc: any) => pc.category) || [],
    } as Post;
});

/**
 * Get all categories
 * @returns List of all categories
 */
export const getCategories = cache(async (): Promise<Category[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching categories:", error);
        throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    return data || [];
});

/**
 * Get posts by category slug with pagination
 * @param categorySlug - Category slug
 * @param page - Page number (1-indexed)
 * @returns Paginated posts in the category
 */
export const getPostsByCategory = cache(
    async (categorySlug: string, page: number = 1): Promise<PaginatedPosts> => {
        const supabase = await createClient();
        const offset = (page - 1) * PAGE_SIZE;

        // First get the category ID
        const { data: category, error: categoryError } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", categorySlug)
            .maybeSingle();

        if (categoryError || !category) {
            console.error("Error fetching category:", categoryError);
            throw new Error(`Category not found: ${categorySlug}`);
        }

        // Get posts in this category with count
        const { data, error, count } = await supabase
            .from("posts")
            .select(
                `
        *,
        author:users(id_user, full_name, avatar_url, designation),
        categories:post_categories!inner(
          category:categories(id, name, slug, views)
        )
      `,
                { count: "exact" }
            )
            .eq("status", "published")
            .eq("post_categories.category_id", category.id)
            .order("published", { ascending: false })
            .range(offset, offset + PAGE_SIZE - 1);

        if (error) {
            console.error("Error fetching posts by category:", error);
            throw new Error(`Failed to fetch posts: ${error.message}`);
        }

        // Transform the data to flatten categories
        const posts: Post[] = (data || []).map((post: any) => ({
            ...post,
            categories: post.categories?.map((pc: any) => pc.category) || [],
        }));

        return {
            posts,
            totalCount: count || 0,
            totalPages: Math.ceil((count || 0) / PAGE_SIZE),
            currentPage: page,
            pageSize: PAGE_SIZE,
        };
    }
);

/**
 * Increment post view count (tracks unique IPs)
 * @param postId - Post UUID
 */
export async function incrementPostView(postId: string): Promise<void> {
    const supabase = await createClient();
    const headersList = await headers();

    // Get IP address from headers (handle proxies)
    const ip =
        headersList.get("x-forwarded-for")?.split(",")[0] ||
        headersList.get("x-real-ip") ||
        "unknown";

    // Insert view count (unique constraint prevents duplicates)
    const { error } = await supabase
        .from("post_view_counts")
        .insert({ post_id: postId, ip_address: ip })
        .select();

    // Ignore unique constraint violations (user already viewed)
    if (error && !error.message.includes("duplicate key")) {
        console.error("Error tracking view:", error);
    }

    // Update the views counter in posts table
    // This could be done with a trigger, but doing it here for simplicity
    if (!error) {
        const { error: updateError } = await supabase.rpc("increment_post_views", {
            post_id: postId,
        });

        if (updateError) {
            console.error("Error incrementing view count:", updateError);
        }
    }
}

/**
 * Get post view count
 * @param postId - Post UUID
 * @returns View count
 */
export const getPostViewCount = cache(async (postId: string): Promise<number> => {
    const supabase = await createClient();

    const { count, error } = await supabase
        .from("post_view_counts")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

    if (error) {
        console.error("Error fetching view count:", error);
        return 0;
    }

    return count || 0;
});