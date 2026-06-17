import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: post } = await supabase
    .from("posts")
    .select("content, profiles:author_id(full_name, username)")
    .eq("id", id)
    .single();

  if (!post) {
    return { title: "Post Not Found — MeraEhsaas" };
  }

  const author = (post as any).profiles?.full_name || (post as any).profiles?.username || "Unknown";
  const excerpt = post.content.substring(0, 160);

  return {
    title: `${excerpt.substring(0, 60)}... — MeraEhsaas`,
    description: excerpt,
    openGraph: {
      title: `Poetry by ${author}`,
      description: excerpt,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `Poetry by ${author}`,
      description: excerpt,
    },
  };
}

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
