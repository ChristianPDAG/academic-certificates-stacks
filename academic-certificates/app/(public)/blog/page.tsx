
import React from "react";
import { Metadata } from "next";
import BlogList from "@/components/Blog/BlogList";
import { buildPageMetadata } from "@/lib/seo";


export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    title: "Blog | Certifikurs",
    description:
      "Artículos y guías sobre certificación académica, blockchain, verificación y uso de Certifikurs.",
    path: "/blog",
  });
}

const Compliance = () => {
  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="absolute inset-0 bg-[url('/img/bg-nodes-2.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
      <BlogList data-oid="d3_6v10" />
    </main>
  );
};

export default Compliance;
