"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dompurify from "isomorphic-dompurify";
import { useParams } from "next/navigation";
import { fetchPost, fetchCategories } from "@/utils/fetch";
import { Categories } from "@/types/blog";
import { useTranslation } from "react-i18next";

interface Post {
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  published: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const BlogPost = () => {
  const params = useParams();
  const param = params.slug?.toString() ?? "";

  const [post, setPost] = useState<Post | null>(null);
  const [, setCategories] = useState<Categories[]>([]);
  const sanitizer = dompurify.sanitize;
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      setPost(await fetchPost(param));
      setCategories(await fetchCategories());
    })();
  }, [param]);

  if (!post) {
    return <p className="text-center text-neutral-600 dark:text-neutral-300 py-12" data-oid="n6.o330">Cargando...</p>;
  }

  return (
    <div className="py-2 md:py-4" data-oid="1sgpwog">
      <div className="mb-8 w-full overflow-hidden rounded-2xl border border-neutral-200 shadow-xl bg-white/80 dark:bg-neutral-900/70 dark:border-neutral-800" data-oid="ehf9874">
        <div
          className="relative aspect-[97/60] w-full sm:aspect-[97/44]"
          data-oid="hrpr3:w"
        >
          <Image
            src={post && `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.thumbnail}`}
            alt="image"
            fill
            className="object-cover object-center"
            unoptimized
            data-oid="k9mc8cx"
          />
        </div>
      </div>
      <div
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        data-oid="ng43wio"
      >
        <div className="col-span-12 lg:col-span-8" data-oid="f35e1:b">
          <h1
            className="mb-6 text-3xl font-bold leading-tight text-neutral-900 dark:text-neutral-100 sm:text-4xl sm:leading-tight"
            data-oid="6ygo1d7"
          >
            {post.title}
          </h1>
          <p
            className="mb-6 rounded-xl border border-neutral-200 bg-white/70 p-4 text-base font-medium leading-relaxed text-neutral-700 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed"
            data-oid="4ddt01n"
          >
            {post.description}
          </p>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-5 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/70" data-oid="ylk9p0s">
            <div
              dangerouslySetInnerHTML={{
                __html: sanitizer(post.content),
              }}
              className="prose prose-neutral max-w-none text-base font-medium leading-relaxed text-neutral-800 dark:prose-invert dark:text-neutral-200 sm:text-lg sm:leading-relaxed lg:text-base lg:leading-relaxed xl:text-lg xl:leading-relaxed prose-headings:text-neutral-900 dark:prose-headings:text-neutral-100 prose-a:text-sky-600 dark:prose-a:text-sky-400"
              data-oid=":9tgqk1"
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4" data-oid="x:9r7sc">
          <div
            className="sticky top-24 w-full rounded-2xl border border-neutral-200 border-t-4 border-t-sky-500 p-6 shadow-lg bg-white/80 backdrop-blur-xl dark:bg-neutral-900/70 dark:border-neutral-800 dark:border-t-sky-400"
            data-oid="q:6wech"
          >
            <div className="mb-5" data-oid=":3-:k-g">
              <div className="flex items-center" data-oid="1tvyq2o">
                <div className="w-full" data-oid="ss-hi:e">
                  <div className="mb-2" data-oid="ss2gjzy">
                    <div className="text-neutral-600 dark:text-neutral-400 font-bold" data-oid="we47fg9">
                      {t("blog.authorLabel")}
                    </div>
                  </div>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100" data-oid="2p:wnr9">
                    Certifikurs
                  </p>
                </div>
              </div>
            </div>
            <div className="mb-3" data-oid="4wjr9s.">
              <div className="" data-oid="4yayr0n">
                <div className="mb-2" data-oid="r_pqj7:">
                  <div className="text-neutral-600 dark:text-neutral-400 font-bold" data-oid=".d6inuu">
                    {t("blog.publicationDate")}
                  </div>
                </div>
                <p className="font-bold text-neutral-900 dark:text-neutral-100" data-oid="y1skkbj">
                  {formatDate(post.published)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
