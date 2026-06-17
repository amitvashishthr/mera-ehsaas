import { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://meraehsaas.com";
  const supabase = await createServerSupabaseClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  // Categories
  const { data: categories } = await supabase.from("categories").select("slug, created_at");
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(cat.created_at),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // Recent posts
  const { data: posts } = await supabase
    .from("posts")
    .select("id, updated_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(200);

  const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // User profiles
  const { data: users } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const userPages: MetadataRoute.Sitemap = (users || []).map((user) => ({
    url: `${baseUrl}/user/${user.username}`,
    lastModified: new Date(user.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticPages, ...categoryPages, ...postPages, ...userPages];
}
