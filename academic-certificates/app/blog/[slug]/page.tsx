import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import BlogPost from "@/components/Blog/BlogPost";
import { getServerTranslations } from "@/lib/server-translations";

export async function generateMetadata(): Promise<Metadata> {
  // Por ahora usamos español como default, después podemos detectar el locale
  const t = await getServerTranslations('es');

  return {
    title: `${t.blog.title} - ${siteConfig.name}`,
  };
}

const BlogDetailsPage = () => {
  return (
    <>
      <section className="" data-oid="ohrsngk">
        <div className="container mx-auto max-w-5xl" data-oid="vki_t90">
          <div
            className="flex flex-wrap justify-center py-20"
            data-oid="dy9hbkk"
          >
            <div className="w-full px-4" data-oid="fn.0ffe">
              <BlogPost data-oid="y5txmtn" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsPage;
