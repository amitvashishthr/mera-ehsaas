import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meraehsaas.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/profile", "/collections", "/print-orders", "/notifications"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
