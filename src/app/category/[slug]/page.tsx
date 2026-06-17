import { createServerSupabaseClient } from "@/lib/supabase/server";
import { PostFeed } from "@/components/posts/PostFeed";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Get post count for this category
  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("category_id", category.id)
    .eq("is_published", true);

  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author_id(id, username, full_name, avatar_url),
      categories:category_id(id, name, slug),
      likes(count),
      comments(count)
    `)
    .eq("category_id", category.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="max-w-feed mx-auto">
      <header className="mb-10">
        <Link href="/" className="text-sm text-primary-400 hover:text-primary-600 transition-colors inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to feed
        </Link>

        {/* Category header with icon */}
        <div className="mt-4 flex items-start gap-4">
          {category.icon && (
            <span className="text-4xl">{category.icon}</span>
          )}
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-primary-900">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-primary-500 mt-2 leading-relaxed max-w-lg">
                {category.description}
              </p>
            )}
            <p className="text-sm text-primary-400 mt-2">
              {postCount || 0} {postCount === 1 ? "post" : "posts"}
            </p>
          </div>
        </div>
      </header>

      {posts && posts.length > 0 ? (
        <PostFeed initialPosts={posts} currentUserId={user?.id} />
      ) : (
        <div className="text-center py-20">
          <p className="font-serif text-xl text-primary-300 italic">
            Nothing here yet...
          </p>
          {user && (
            <Link href="/posts/create" className="btn-primary mt-4 inline-block">
              Be the first to write here
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
