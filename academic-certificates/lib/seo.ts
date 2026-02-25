import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ||
  "https://certifikurs.vercel.app";

export const SITE_NAME = "Certifikurs";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-banner.jpg`;
export const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/tc-banner.jpg`;

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "es_CO",
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} - ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@Certifikurs",
      images: [image === DEFAULT_OG_IMAGE ? DEFAULT_TWITTER_IMAGE : image],
    },
  };
}
