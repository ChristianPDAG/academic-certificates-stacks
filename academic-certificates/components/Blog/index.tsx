"use client";
import { useState, useEffect } from "react";
import BlogCard from "./BlogCard";
import { fetchPostsPage } from "@/utils/fetch";
import Link from "next/link";
import { useTranslation } from "react-i18next";

interface Blog {
  slug: string;
  title: string;
  thumbnail: string;
  published: string;
}
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
const Blog = () => {
  const [posts, setPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        const data = await fetchPostsPage(1);
        // Mostrar solo los primeros 3 posts para la sección del home
        setPosts(data.results.posts.slice(0, 3));
        setLoading(false);
      } catch (error) {
        console.error("An error occurred:", error);
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, []);

  if (loading) {
    return (
      <section
        id="blog"
        className="bg-gray-light dark:bg-bg-color-dark py-16 md:py-20 lg:py-28"
        data-oid="01c8oc_"
      >
        <div className="container" data-oid="0wv3jql">
          <p className="text-center" data-oid="_crfh20">
            Cargando...
          </p>
        </div>
      </section>
    );
  }
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
                key={index}
                className="flex justify-center"
                data-oid="m52dns5"
              >
                <BlogCard
                  url={post.slug}
                  title={post.title}
                  imageURL={post.thumbnail}
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
