"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { PostCard } from "./PostCard";

interface PostFeedProps {
  initialPosts: any[];
  currentUserId?: string;
}

const PAGE_SIZE = 10;

export function PostFeed({ initialPosts, currentUserId }: PostFeedProps) {
  const [posts, setPosts] = useState<any[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPosts.length >= PAGE_SIZE);
  const observerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const lastPost = posts[posts.length - 1];
    if (!lastPost) {
      setLoading(false);
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
      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setPosts((prev) => [...prev, ...data]);
    }
    setLoading(false);
  }, [posts, loading, hasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading]);

  return (
    <>
      <div className="space-y-10">
        {posts.map((post, idx) => (
          <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}>
            <PostCard post={post} currentUserId={currentUserId} />
          </div>
        ))}
      </div>

      {/* Sentinel for infinite scroll */}
      <div ref={observerRef} className="py-8">
        {loading && (
          <div className="flex justify-center">
            <div className="flex items-center gap-3 text-primary-400">
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-serif italic">Loading more...</span>
            </div>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-sm text-primary-300 font-serif italic py-4">
            You&apos;ve reached the end. Time to write something new.
          </p>
        )}
      </div>
    </>
  );
}
