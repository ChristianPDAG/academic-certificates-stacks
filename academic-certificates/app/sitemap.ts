import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { fetchPosts } from "@/utils/fetch";

type RouteEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const PUBLIC_ROUTES: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/validator", changeFrequency: "weekly", priority: 0.9 },
  { path: "/explorer", changeFrequency: "weekly", priority: 0.9 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blog", changeFrequency: "daily", priority: 0.8 },
];

const PRIVATE_ROUTES: RouteEntry[] = [
  { path: "/auth/login", changeFrequency: "monthly", priority: 0.2 },
  { path: "/auth/sign-up", changeFrequency: "monthly", priority: 0.2 },
  { path: "/auth/sign-up-academy", changeFrequency: "monthly", priority: 0.2 },
  { path: "/auth/forgot-password", changeFrequency: "monthly", priority: 0.1 },
  { path: "/admin", changeFrequency: "weekly", priority: 0.1 },
  { path: "/admin/academies", changeFrequency: "weekly", priority: 0.1 },
  { path: "/academy", changeFrequency: "weekly", priority: 0.1 },
  { path: "/academy/profile", changeFrequency: "weekly", priority: 0.1 },
  { path: "/academy/courses", changeFrequency: "weekly", priority: 0.1 },
  { path: "/academy/certificates", changeFrequency: "weekly", priority: 0.1 },
  { path: "/student", changeFrequency: "weekly", priority: 0.1 },
];

async function getBlogPostUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const data = await fetchPosts();
    const posts = data?.results?.posts ?? data?.posts ?? [];

    if (!Array.isArray(posts)) return [];

    return posts
      .filter((post: any) => typeof post?.slug === "string" && post.slug.length > 0)
      .map((post: any) => ({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post?.updated || post?.published || new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [...PUBLIC_ROUTES, ...PRIVATE_ROUTES].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogPosts = await getBlogPostUrls();

  return [...staticRoutes, ...blogPosts];
}
