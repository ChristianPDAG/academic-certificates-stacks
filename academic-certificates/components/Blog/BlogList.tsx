"use client";

import React, { useState, useEffect } from "react";
import { fetchPostsPage } from "@/utils/fetch";
import BlogCard from "./BlogCard";
import Pagination from "./Pagination";
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
    return (
      <div className="relative z-10 container mx-auto max-w-7xl px-4 lg:px-0 pt-12 md:pt-16 mt-20 pb-16 md:pb-20">
        <p className="text-center text-neutral-600 dark:text-neutral-300" data-oid="pf-y5t1">
          {t("blog.loading")}
        </p>
      </div>
    );
  }

  return (
    <>
      <section
        className="relative z-10 container mx-auto max-w-7xl px-4 lg:px-0 pt-12 md:pt-16 mt-20"
      >
        <div
          className="rounded-2xl border border-neutral-200 bg-white/75 px-6 py-10 text-center shadow-lg backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-900/70 md:px-10 md:py-14"
          data-oid="hero-container"
        >
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-4"
            data-oid="hero-title"
          >
            {t("blog.title")} <span className="text-sky-500 dark:text-sky-400">Certifikurs</span>
          </h1>
          <p
            className="text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto"
            data-oid="hero-subtitle"
          >
            {t("blog.subtitle")}
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="relative z-10 pb-16 md:pb-20 pt-8 px-4 lg:px-0" data-oid="r8quxbh">
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
                  className="text-2xl font-bold text-neutral-600 dark:text-neutral-300"
                  data-oid="9:63iib"
                >
                  {t("blog.noPosts")}
                </h2>
              </div>
            )}
          </div>

          <div className="mt-10" data-oid="a36v_ko">
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
