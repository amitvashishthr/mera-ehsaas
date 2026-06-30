"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetch() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("posts")
        .select("id, content, created_at, updated_at")
        .eq("author_id", user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false });

      setDrafts(data || []);
      setLoading(false);
    }
    fetch();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this draft?")) return;
    await supabase.from("posts").delete().eq("id", id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast("Draft deleted", "info");
  };

  const handlePublish = async (id: string) => {
    await supabase.from("posts").update({ status: "published", is_published: true }).eq("id", id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
    showToast("Published!", "success");
  };

  return (
    <div className="max-w-feed mx-auto px-4 sm:px-6 pt-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-6">Drafts</h1>

      {loading && <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>}

      {!loading && drafts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">No drafts.</p>
        </div>
      )}

      {!loading && drafts.length > 0 && (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <div key={draft.id} className="card-interactive !p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{draft.content}</p>
                <p className="text-xs text-neutral-400 mt-1">{formatDistanceToNow(draft.updated_at || draft.created_at)}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => handlePublish(draft.id)} className="btn-ghost text-xs text-green-600 dark:text-green-400">Publish</button>
                <button onClick={() => handleDelete(draft.id)} className="btn-ghost text-xs text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
