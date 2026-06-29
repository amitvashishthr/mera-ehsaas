"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  const loadingRef = useRef(false);
  const supabase = useMemo(() => createClient(), []);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);

    const lastPost = posts[posts.length - 1];
    if (!lastPost) { setLoading(false); loadingRef.current = false; return; }

    const { data } = await supabase
      .from("posts")
      .select(`*, profiles:author_id(id, username, full_name, avatar_url), categories:category_id(id, name, slug), likes(count), comments(count)`)
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

  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div role="feed" aria-label="Post feed">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}

      <div ref={observerRef} className="py-8" aria-hidden="true">
        {loading && (
          <div className="flex justify-center">
            <svg className="w-5 h-5 animate-spin text-neutral-300 dark:text-neutral-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">You&apos;ve seen it all ✨</p>
        )}
      </div>
    </div>
  );
}
