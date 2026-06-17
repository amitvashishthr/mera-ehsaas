"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function ExportCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const printRef = useRef<HTMLDivElement>(null);

  const [collection, setCollection] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: col } = await supabase
        .from("collections")
        .select("id, name, description, user_id")
        .eq("id", id)
        .single();

      if (!col) { router.push("/collections"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, username")
        .eq("id", col.user_id)
        .single();

      setAuthor(profile?.full_name || profile?.username || "Anonymous");

      const { data: savedEntries } = await supabase
        .from("collection_posts")
        .select("post_id")
        .eq("collection_id", id)
        .order("added_at", { ascending: true });

      if (!savedEntries || savedEntries.length === 0) {
        setCollection(col);
        setPosts([]);
        setLoading(false);
        return;
      }

      const postIds = savedEntries.map((e) => e.post_id);

      const { data: postData } = await supabase
        .from("posts")
        .select("id, content, image_url, created_at")
        .in("id", postIds);

      const postMap = new Map((postData || []).map((p) => [p.id, p]));
      const ordered = postIds.map((pid) => postMap.get(pid)).filter(Boolean);

      setCollection(col);
      setPosts(ordered);
      setLoading(false);
    }
    fetchData();
  }, [id, supabase, router]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-feed mx-auto text-center py-20">
        <div className="h-6 skeleton w-48 mx-auto mb-4" />
        <div className="h-4 skeleton w-32 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-feed mx-auto">
      {/* Controls — hidden in print */}
      <div className="print:hidden mb-8">
        <Link href={`/collections/${id}`} className="text-sm text-primary-400 hover:text-primary-600 dark:text-dark-400 transition-colors inline-flex items-center gap-1 mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to collection
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-dark-100">Export PDF</h1>
            <p className="text-sm text-primary-400 dark:text-dark-400 mt-1">{posts.length} posts</p>
          </div>
          <button onClick={handlePrint} className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div ref={printRef} className="print:p-0">
        {/* Cover page */}
        <div className="card text-center py-16 print:shadow-none print:border-none print:py-24 mb-8 print:mb-0 print:break-after-page">
          <p className="text-6xl mb-6">📜</p>
          <h1 className="font-serif text-4xl font-bold text-primary-900 dark:text-dark-100 mb-4">
            {collection?.name}
          </h1>
          {collection?.description && (
            <p className="text-primary-500 dark:text-dark-400 text-lg italic max-w-md mx-auto mb-8">
              {collection.description}
            </p>
          )}
          <p className="text-primary-600 dark:text-dark-300 font-medium">By {author}</p>
          <p className="text-primary-400 dark:text-dark-500 text-sm mt-2">{posts.length} pieces</p>
        </div>

        {/* Posts */}
        {posts.map((post, idx) => (
          <div
            key={post.id}
            className="card mb-6 print:shadow-none print:border-none print:mb-0 print:break-inside-avoid print:py-12"
          >
            <p className="font-serif text-xl leading-[2.2] text-primary-900 dark:text-dark-100 whitespace-pre-wrap text-center">
              {post.content}
            </p>
            {post.image_url && (
              <div className="mt-6 flex justify-center">
                <img
                  src={post.image_url}
                  alt=""
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
              </div>
            )}
            <p className="text-center text-xs text-primary-300 dark:text-dark-500 mt-6 print:mt-8">
              — {idx + 1} —
            </p>
          </div>
        ))}
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          nav, aside, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .layout-container { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
