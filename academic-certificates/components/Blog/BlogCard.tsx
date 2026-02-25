import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";

interface BlogCardProps {
  url: string;
  title: string;
  date: string;
  imageURL: string;
}

const BlogCard = ({ url, title, date, imageURL }: BlogCardProps) => {
  const { t } = useTranslation();
  return (
    <Link href={`/blog/${url}`} className="z-10 group" data-oid="su8lwaq">
      <div
        className="rounded-xl w-80 overflow-hidden bg-card border border-border shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
        data-oid="m._.xcz"
      >
        <div
          className="bg-muted w-full h-40 z-10 relative overflow-hidden"
          data-oid="c9p-_kc"
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${imageURL}`}
            fill
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            unoptimized
            data-oid="l7tln0o"
          />
        </div>
        <div className="p-4 rounded-xl relative z-20" data-oid="moj:mk1">
          <div
            className="px-4 py-2 text-primary-foreground font-bold bg-primary w-fit mx-auto mb-3 rounded-lg absolute inset-x-0 -top-5 shadow-md"
            data-oid="nf._1rk"
          >
            {date}
          </div>
          <div
            className="text-xs text-muted-foreground flex gap-x-1 items-center justify-center mb-2 mt-5"
            data-oid="2jgto0."
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="icon icon-tabler icons-tabler-outline icon-tabler-user-circle"
              data-oid="bo-l1gy"
            >
              <path
                stroke="none"
                d="M0 0h24v24H0z"
                fill="none"
                data-oid="r_:3vgr"
              />

              <path
                d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"
                data-oid="nn1khoc"
              />

              <path
                d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"
                data-oid="d.efy-b"
              />

              <path
                d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855"
                data-oid="cs88ej9"
              />
            </svg>
            {t("blog.author")}
          </div>
          <h4 className="text-lg font-bold text-card-foreground mb-3 line-clamp-2" data-oid="zpi-3w8">
            {title}
          </h4>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
