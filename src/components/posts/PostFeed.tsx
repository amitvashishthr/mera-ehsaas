"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "./PostCard";

interface PostFeedProps {
  initialPosts: any[];
  currentUserId?: string;
}

const PAGE_SIZE = 10;

/**
 * Infinite scroll feed component.
 * Loads posts in batches using cursor-based pagination on `created_at`.
 */
export function PostFeed({ initialPosts, currentUserId }: PostFeedProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    const lastPost = posts[posts.length - 1];
    if (!lastPost) {
      setLoading(false);
      loadingRef.current = false;
      return;
    }

    const { data } = await supabase
      .from("posts")
      .select(`
        *,
        profiles:author_id(id, username, full_name, avatar_url),
        categories:category_id(id, name, slug),
        likes(count),
        comments(count)
      `)
      .eq("is_published", true)
      .lt("created_at", lastPost.created_at)
      .order("created_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (data) {
      if (data.length < PAGE_SIZE) setHasMore(false);
      setPosts((prev) => [...prev, ...data]);
    }
    setLoading(false);
    loadingRef.current = false;
  }, [posts, hasMore, supabase]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="space-y-10" role="feed" aria-label="Post feed">
        {posts.map((post) => (
          <article key={post.id} className="animate-fade-in">
            <PostCard post={post} currentUserId={currentUserId} />
          </article>
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={observerRef} className="py-8" aria-hidden="true">
        {loading && (
          <div className="flex justify-center" role="status" aria-label="Loading more posts">
            <div className="flex items-center gap-3 text-primary-400 dark:text-dark-400">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-serif italic">Loading more...</span>
            </div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-primary-300 dark:text-dark-500 font-serif italic py-4">
            You&apos;ve reached the end.
          </p>
        )}
      </div>
    </>
  );
}
