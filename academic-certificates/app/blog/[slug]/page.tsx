import { Metadata } from "next";
import { siteConfig } from "@/config/site";
import BlogPost from "@/components/Blog/BlogPost";
import { getServerTranslations } from "@/lib/server-translations";
import { getPost, incrementPostView } from "@/app/actions/blog/blog";
import { notFound } from "next/navigation";

// Revalidate every hour for published posts (they rarely change)
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} - ${siteConfig.name}`,
    description: post.description || undefined,
    openGraph: {
      title: post.title || undefined,
      description: post.description || undefined,
      images: post.thumbnail ? [post.thumbnail] : undefined,
      type: "article",
      publishedTime: post.published,
    },
  };
}

const BlogDetailsPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  console.log("Fetching post for slug:", slug);
  const post = await getPost(slug);
  console.log("Fetched post:", post);
  if (!post) {
    notFound();
  }

  // Track view asynchronously (don't await to avoid blocking render)
  incrementPostView(post.id).catch(console.error);

  return (
    <>
      <section className="" data-oid="ohrsngk">
        <div className="container mx-auto max-w-5xl" data-oid="vki_t90">
          <div
            className="flex flex-wrap justify-center py-20"
            data-oid="dy9hbkk"
          >
            <div className="w-full px-4" data-oid="fn.0ffe">
              <BlogPost post={post} data-oid="y5txmtn" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetailsPage;
