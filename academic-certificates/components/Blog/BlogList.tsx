"use client";

import React, { useState } from "react";
import BlogCard from "./BlogCard";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import { PaginatedPosts, Post } from "@/types/blog";
import { useRouter, useSearchParams } from "next/navigation";

interface BlogListProps {
  initialData: PaginatedPosts;
}

const BlogList = ({ initialData }: BlogListProps) => {
  const [data, setData] = useState<PaginatedPosts>(initialData);
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    // Update URL with new page parameter
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative w-full min-h-[40vh]
             bg-gradient-to-r from-primary via-primary/90 to-primary/80
             dark:from-primary dark:via-primary/80 dark:to-primary/70
             px-4 lg:px-0 pt-32 pb-24 flex items-center"
      >
        <div className="container mx-auto max-w-7xl text-center" data-oid="hero-container">
          <h1
            className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6"
            data-oid="hero-title"
          >
            {t("blog.title")}
          </h1>
          <p
            className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto"
            data-oid="hero-subtitle"
          >
            {t("blog.subtitle")}
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20 px-4 lg:px-0 bg-background" data-oid="r8quxbh">
        <div className="container mx-auto max-w-7xl" data-oid="1udqgjy">
          <div
            className="flex flex-wrap justify-center gap-6"
            data-oid=".a87651"
          >
            {data.posts && data.posts.length > 0 ? (
              data.posts.map((post: Post) => (
                <BlogCard
                  key={post.id}
                  url={post.slug || "#"}
                  title={post.title || "Untitled"}
                  imageURL={post.thumbnail || "/img/blog/default.jpg"}
                  date={new Date(post.published).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })}
                  data-oid="l0-8_vx"
                />
              ))
            ) : (
              <div className="text-center w-full" data-oid="dy5wv3h">
                <h2
                  className="text-2xl font-bold text-muted-foreground"
                  data-oid="9:63iib"
                >
                  {t("blog.noPosts")}
                </h2>
              </div>
            )}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8" data-oid="a36v_ko">
              <Pagination
                list_page={handlePageChange}
                count={data.totalPages}
                type={"small"}
                data-oid="t4e4zut"
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BlogList;
