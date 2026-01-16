"use client";
import BlogCard from "./BlogCard";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Post } from "@/types/blog";

const SectionTitle = ({
  title,
  paragraph,
  width = "570px",
  center,
  mb = "100px",
}: {
  title: string;
  paragraph: string;
  width?: string;
  center?: boolean;
  mb?: string;
}) => {
  return (
    <>
      <div
        className={`wow fadeInUp w-full ${center ? "mx-auto text-center" : ""}`}
        data-wow-delay=".1s"
        style={{ maxWidth: width, marginBottom: mb }}
        data-oid="5d0de.:"
      >
        <h2
          className="mb-4 text-3xl font-bold !leading-tight text-black dark:text-white sm:text-4xl md:text-[45px]"
          data-oid="-9p2aa_"
        >
          {title}
        </h2>
        <p
          className="text-base !leading-relaxed text-body-color md:text-lg"
          data-oid="keao3x_"
        >
          {paragraph}
        </p>
      </div>
    </>
  );
};

interface BlogProps {
  posts: Post[];
}

const Blog = ({ posts }: BlogProps) => {
  const { t } = useTranslation();

  return (
    <section
      id="blog"
      className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
      data-oid="yxjb:a7"
    >
      <div className="container" data-oid="rjtxryv">
        <SectionTitle
          title={t("blog.latestArticles")}
          paragraph={t("blog.latestArticlesDescription")}
          center
          data-oid="du_7c2u"
        />

        <div
          className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 md:gap-x-6 lg:gap-x-8 xl:grid-cols-3"
          data-oid=".xz7fba"
        >
          {posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={post.id}
                className="flex justify-center"
                data-oid="m52dns5"
              >
                <BlogCard
                  url={post.slug || "#"}
                  title={post.title || "Untitled"}
                  imageURL={post.thumbnail || "/img/blog/default.jpg"}
                  date={new Date(post.published).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                  })}
                  data-oid="ke1-xhu"
                />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center" data-oid="m-55pc0">
              <h3 className="text-xl font-bold text-primary" data-oid="vphjt77">
                {t("blog.noPostsAvailable")}
              </h3>
            </div>
          )}
        </div>

        {posts && posts.length > 0 && (
          <div className="text-center mt-10" data-oid="l_s:0id">
            <Link
              href="/blog"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              data-oid="wkicq3a"
            >
              {t("blog.viewAllArticles")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default Blog;
