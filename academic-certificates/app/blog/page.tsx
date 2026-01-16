import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import BlogList from "@/components/Blog/BlogList";
import { getServerTranslations } from "@/lib/server-translations";
import { getPostsPage } from "@/app/actions/blog/blog";

// Revalidate every 5 minutes for fresh blog content
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // Por ahora usamos español como default, después podemos detectar el locale
  const t = await getServerTranslations('es');

  return {
    title: `${t.blog.title} - ${siteConfig.name}`,
    description: t.blog.subtitle,
  };
}

const BlogPage = async ({ searchParams }: { searchParams: { page?: string } }) => {
  const page = parseInt(searchParams.page || "1", 10);
  const paginatedData = await getPostsPage(page);

  return (
    <>
      <BlogList initialData={paginatedData} data-oid="d3_6v10" />
    </>
  );
};

export default BlogPage;
