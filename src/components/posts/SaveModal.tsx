"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_saved: boolean; // whether current post is already in this collection
}

interface SaveModalProps {
  postId: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SaveModal({ postId, currentUserId, isOpen, onClose }: SaveModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  // Fetch collections + check which ones already contain this post
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function fetchData() {
      setLoading(true);

      // Get user's collections
      const { data: userCollections } = await supabase
        .from("collections")
        .select("id, name, description")
        .eq("user_id", currentUserId)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (!userCollections) {
        setCollections([]);
        setLoading(false);
        return;
      }

      // Get which collections already have this post
      const { data: savedEntries } = await supabase
        .from("collection_posts")
        .select("collection_id")
        .eq("post_id", postId);

      const savedSet = new Set(savedEntries?.map((e) => e.collection_id) || []);

      const result: Collection[] = userCollections.map((col) => ({
        id: col.id,
        name: col.name,
        description: col.description,
        is_saved: savedSet.has(col.id),
      }));

      if (!cancelled) {
        setCollections(result);
        setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [isOpen, postId, currentUserId, supabase]);

  const handleSave = async (collectionId: string) => {
    setSaving(collectionId);

    const collection = collections.find((c) => c.id === collectionId);
    if (!collection) return;

    if (collection.is_saved) {
      // Remove from collection
      const { error } = await supabase
        .from("collection_posts")
        .delete()
        .match({ collection_id: collectionId, post_id: postId });

      if (error) {
        showToast("Failed to remove from collection", "error");
      } else {
        setCollections((prev) =>
          prev.map((c) => c.id === collectionId ? { ...c, is_saved: false } : c)
        );
        showToast(`Removed from "${collection.name}"`, "info");
      }
    } else {
      // Save to collection
      const { error } = await supabase
        .from("collection_posts")
        .insert({ collection_id: collectionId, post_id: postId });

      if (error) {
        if (error.code === "23505") {
          showToast("Already saved to this collection", "info");
          setCollections((prev) =>
            prev.map((c) => c.id === collectionId ? { ...c, is_saved: true } : c)
          );
        } else {
          showToast("Failed to save", "error");
        }
      } else {
        setCollections((prev) =>
          prev.map((c) => c.id === collectionId ? { ...c, is_saved: true } : c)
        );
        showToast(`Saved to "${collection.name}"`, "success");
      }
    }

    setSaving(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: currentUserId,
        name: newName.trim(),
        description: newDesc.trim() || null,
      })
      .select("id, name, description")
      .single();

    if (error) {
      showToast("Failed to create collection", "error");
    } else if (data) {
      // Auto-save post to the new collection
      await supabase
        .from("collection_posts")
        .insert({ collection_id: data.id, post_id: postId });

      setCollections((prev) => [
        { id: data.id, name: data.name, description: data.description, is_saved: true },
        ...prev,
      ]);
      showToast(`Created "${data.name}" and saved post`, "success");
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
    }

    setCreating(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col pointer-events-auto animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100 shrink-0">
            <h2 className="font-serif text-lg font-semibold text-primary-900">Save to Collection</h2>
            <button
              onClick={onClose}
              className="text-primary-400 hover:text-primary-700 transition-colors p-1 rounded-lg hover:bg-warm-100"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Create new collection */}
            {showCreate ? (
              <form onSubmit={handleCreate} className="mb-5 p-4 bg-warm-50 rounded-xl border border-warm-200 space-y-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-field text-sm"
                  placeholder="Collection name"
                  autoFocus
                  required
                />
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input-field text-sm"
                  placeholder="Description (optional)"
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-xs flex-1" disabled={creating}>
                    {creating ? "Creating..." : "Create & Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setNewName(""); setNewDesc(""); }}
                    className="btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCreate(true)}
                className="w-full mb-4 py-3 px-4 border-2 border-dashed border-warm-300 rounded-xl text-sm text-primary-500 hover:text-primary-700 hover:border-primary-300 hover:bg-warm-50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Collection
              </button>
            )}

            {/* Loading */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-warm-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty */}
            {!loading && collections.length === 0 && !showCreate && (
              <div className="text-center py-8">
                <svg className="w-10 h-10 mx-auto text-primary-200 mb-3" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                <p className="text-sm text-primary-400 italic">
                  No collections yet. Create your first one above.
                </p>
              </div>
            )}

            {/* Collection list */}
            {!loading && collections.length > 0 && (
              <div className="space-y-2">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => handleSave(col.id)}
                    disabled={saving === col.id}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                      col.is_saved
                        ? "border-green-200 bg-green-50 hover:bg-green-100"
                        : "border-warm-200 hover:border-primary-300 hover:bg-warm-50"
                    }`}
                  >
                    {/* Checkbox indicator */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                      col.is_saved ? "border-green-500 bg-green-500" : "border-primary-300"
                    }`}>
                      {col.is_saved && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-primary-800 truncate">{col.name}</p>
                      {col.description && (
                        <p className="text-xs text-primary-400 truncate mt-0.5">{col.description}</p>
                      )}
                    </div>

                    {saving === col.id && (
                      <svg className="w-4 h-4 animate-spin text-primary-400 shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
