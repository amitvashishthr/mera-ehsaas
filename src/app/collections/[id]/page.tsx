"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "@/components/posts/PostCard";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

interface CollectionDetail {
  id: string;
  name: string;
  description: string | null;
}

export default function CollectionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();

  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);

      // Fetch collection
      const { data: col } = await supabase
        .from("collections")
        .select("id, name, description")
        .eq("id", id)
        .single();

      if (!col) {
        router.push("/collections");
        return;
      }

      setCollection(col);

      // Fetch saved posts
      const { data: savedEntries } = await supabase
        .from("collection_posts")
        .select("post_id, added_at")
        .eq("collection_id", id)
        .order("added_at", { ascending: false });

      if (!savedEntries || savedEntries.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = savedEntries.map((e) => e.post_id);

      const { data: postData } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:author_id(id, username, full_name, avatar_url),
          categories:category_id(id, name, slug),
          likes(count),
          comments(count)
        `)
        .in("id", postIds)
        .eq("is_published", true);

      // Preserve the saved order
      const postMap = new Map((postData || []).map((p) => [p.id, p]));
      const ordered = postIds.map((pid) => postMap.get(pid)).filter(Boolean);

      setPosts(ordered);
      setLoading(false);
    }

    fetchData();
  }, [id, supabase, router]);

  const handleRemovePost = async (postId: string) => {
    const { error } = await supabase
      .from("collection_posts")
      .delete()
      .match({ collection_id: id, post_id: postId });

    if (error) {
      showToast("Failed to remove", "error");
    } else {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast("Removed from collection", "info");
    }
  };

  return (
    <div className="max-w-feed mx-auto">
      {/* Back link */}
      <Link href="/collections" className="text-sm text-primary-400 hover:text-primary-600 transition-colors inline-flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        All Collections
      </Link>

      {/* Header */}
      {collection && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary-900 dark:text-dark-100">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-primary-400 dark:text-dark-400 mt-1">{collection.description}</p>
              )}
              <p className="text-sm text-primary-300 dark:text-dark-500 mt-2">
                {posts.length} {posts.length === 1 ? "post" : "posts"} saved
              </p>
            </div>
            {posts.length >= 10 && (
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/collections/${id}/export`}
                  className="btn-outline inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Export PDF
                </Link>
                <Link
                  href={`/collections/${id}/print`}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229.708a.75.75 0 0 1-.048.058l-2.894 2.894M6.34 18l-.229.708a.75.75 0 0 0 .048.058l2.894 2.894M9 12h6m-3-3v6" />
                  </svg>
                  Print Collection
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-warm-200/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <svg className="w-14 h-14 mx-auto text-primary-200 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
          <p className="font-serif text-xl text-primary-400 italic mb-2">
            This collection is empty
          </p>
          <p className="text-sm text-primary-300">
            Save posts from the feed by clicking the bookmark icon.
          </p>
        </div>
      )}

      {/* Posts */}
      {!loading && posts.length > 0 && (
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="relative group/remove">
              <PostCard post={post} currentUserId={currentUserId} />
              {/* Remove from collection button */}
              <button
                onClick={() => handleRemovePost(post.id)}
                className="absolute top-4 right-4 z-10 text-xs text-white bg-rose-500 hover:bg-rose-600 px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover/remove:opacity-100 transition-opacity"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
