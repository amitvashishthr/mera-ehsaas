"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  post_count: number;
  created_at: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("collections")
      .select("id, name, description, is_public, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!data) {
      setCollections([]);
      setLoading(false);
      return;
    }

    // Get post counts for each collection
    const counts: Record<string, number> = {};
    for (const col of data) {
      const { count } = await supabase
        .from("collection_posts")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", col.id);
      counts[col.id] = count || 0;
    }

    setCollections(data.map((col) => ({ ...col, post_count: counts[col.id] || 0 })));
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("collections").insert({
      user_id: user.id,
      name: newName.trim(),
      description: newDesc.trim() || null,
    });

    if (error) {
      showToast("Failed to create collection", "error");
    } else {
      showToast(`"${newName.trim()}" created`, "success");
      setNewName("");
      setNewDesc("");
      setShowForm(false);
      fetchCollections();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Saved posts won't be deleted.`)) return;

    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) {
      showToast("Failed to delete", "error");
    } else {
      showToast(`"${name}" deleted`, "info");
      setCollections((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="max-w-feed mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary-900">
            My Collections
          </h1>
          <p className="text-sm text-primary-400 mt-1">
            Organize posts into collections for later reading
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? "Cancel" : "+ New"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-8 space-y-4">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="input-field"
            placeholder="Collection name"
            autoFocus
            required
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="input-field"
            placeholder="Description (optional)"
          />
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? "Creating..." : "Create Collection"}
          </button>
        </form>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-warm-200/60 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && collections.length === 0 && !showForm && (
        <div className="text-center py-20">
          <svg className="w-14 h-14 mx-auto text-primary-200 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
          </svg>
          <p className="font-serif text-xl text-primary-400 italic mb-2">
            No collections yet
          </p>
          <p className="text-sm text-primary-300 mb-4">
            Create your first collection to start saving posts.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            Create Collection
          </button>
        </div>
      )}

      {/* Collection grid */}
      {!loading && collections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collections.map((col) => (
            <div key={col.id} className="card-hover group relative">
              <Link href={`/collections/${col.id}`} className="block">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-warm-200 flex items-center justify-center text-lg shrink-0">
                    📚
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-primary-800 group-hover:text-primary-600 transition-colors truncate">
                      {col.name}
                    </h3>
                    {col.description && (
                      <p className="text-xs text-primary-400 mt-0.5 truncate">{col.description}</p>
                    )}
                    <p className="text-xs text-primary-300 mt-2">
                      {col.post_count} {col.post_count === 1 ? "post" : "posts"} saved
                    </p>
                  </div>
                </div>
              </Link>
              {/* Delete */}
              <button
                onClick={() => handleDelete(col.id, col.name)}
                className="absolute top-4 right-4 text-xs text-primary-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Delete collection"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
