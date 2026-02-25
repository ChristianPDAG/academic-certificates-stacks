
import React from "react";
import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import BlogList from "@/components/Blog/BlogList";
import { getServerTranslations } from "@/lib/server-translations";


export async function generateMetadata(): Promise<Metadata> {
  // Por ahora usamos español como default, después podemos detectar el locale
  const t = await getServerTranslations('es');

  return {
    title: `${t.blog.title} - ${siteConfig.name}`,
    description: t.blog.subtitle,
  };
}

const Compliance = () => {
  return (
    <>
      <BlogList data-oid="d3_6v10" />
    </>
  );
};

export default Compliance;
