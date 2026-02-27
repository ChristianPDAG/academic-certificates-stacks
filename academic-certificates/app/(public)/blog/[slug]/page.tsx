import { Metadata } from "next";
import BlogPost from "@/components/Blog/BlogPost";
import { buildPageMetadata } from "@/lib/seo";
import { fetchPost } from "@/utils/fetch";

type BlogDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: BlogDetailsPageProps
): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await fetchPost(slug);
    const image = post?.thumbnail
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${post.thumbnail}`
      : undefined;

    return buildPageMetadata({
      title: `${post?.title || "Post"} | Blog`,
      description:
        post?.description?.slice(0, 160) ||
        "Artículo del blog de Certifikurs sobre certificados académicos y blockchain.",
      path: `/blog/${slug}`,
      type: "article",
      image,
    });
  } catch {
    return buildPageMetadata({
      title: "Post | Blog",
      description:
        "Artículo del blog de Certifikurs sobre certificados académicos y blockchain.",
      path: `/blog/${slug}`,
      type: "article",
    });
  }
}

const BlogDetailsPage = () => {
  return (
    <main className="relative min-h-screen w-full bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="absolute inset-0 bg-[url('/img/bg-nodes-2.svg')] bg-cover bg-center opacity-10 dark:opacity-20" />
      <section className="relative z-10" data-oid="ohrsngk">
        <div className="container mx-auto max-w-5xl px-4 lg:px-0 pt-12 md:pt-16 mt-20 pb-16 md:pb-20" data-oid="vki_t90">
          <div className="flex flex-wrap justify-center" data-oid="dy9hbkk">
            <div className="w-full" data-oid="fn.0ffe">
              <BlogPost data-oid="y5txmtn" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogDetailsPage;
