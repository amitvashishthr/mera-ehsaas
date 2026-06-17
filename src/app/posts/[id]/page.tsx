import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PostCard } from "@/components/posts/PostCard";
import { CommentSection } from "@/components/posts/CommentSection";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: post } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      categories:category_id(id, name, slug),
      likes(count),
      comments(count)
    `)
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Pre-fetch comments server-side for SEO and faster load
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      profiles:user_id(id, username, full_name, avatar_url)
    `)
    .eq("post_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-feed mx-auto">
      {/* Back link */}
      <Link href="/" className="text-sm text-primary-400 hover:text-primary-600 transition-colors inline-flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to feed
      </Link>

      {/* Post card without inline comments (we show them separately below) */}
      <PostCard post={post} currentUserId={user?.id} />

      {/* Standalone comment section with pre-fetched data */}
      <div className="mt-8">
        <CommentSection
          postId={id}
          currentUserId={user?.id}
          initialComments={comments || []}
        />
      </div>
    </div>
  );
}
