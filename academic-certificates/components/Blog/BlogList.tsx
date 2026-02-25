"use client";

import React, { useState, useEffect } from "react";
import { fetchPostsPage } from "@/utils/fetch";
import BlogCard from "./BlogCard";
import Pagination from "./Pagination";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface Blog {
  slug: string;
  title: string;
  thumbnail: string;
  published: string;
}

const BlogList = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchPostsByPage = async (page: number) => {
      try {
        setLoading(true);
        const data = await fetchPostsPage(page);
        setPosts(data.results.posts);
        setTotalPages(Math.ceil(data.count / 6));
        setLoading(false);
      } catch (error) {
        console.error("An error occurred:", error);
        setLoading(false);
      }
    };

    fetchPostsByPage(currentPage);
  }, [currentPage]);

  if (loading) {
    return <p data-oid="pf-y5t1">{t("blog.loading")}</p>;
  }

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
            {posts && posts.length > 0 ? (
              posts.map((post, index) => (
                <BlogCard
                  key={index}
                  url={post.slug}
                  title={post.title}
                  imageURL={post.thumbnail}
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

          <div className="mt-8" data-oid="a36v_ko">
            <Pagination
              list_page={setCurrentPage}
              count={totalPages}
              type={"small"}
              data-oid="t4e4zut"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogList;
