import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/posts/PostFeed";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      categories:category_id(id, name, slug),
      likes(count),
      comments(count)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-feed mx-auto px-4 sm:px-6 pt-4">
      {posts && posts.length > 0 ? (
        <PostFeed initialPosts={posts} currentUserId={user?.id} />
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
            </svg>
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mb-4">
            The feed is empty. Be the first to share.
          </p>
          <Link href="/posts/create" className="btn-primary">
            Write something
          </Link>
        </div>
      )}
    </div>
  );
}
