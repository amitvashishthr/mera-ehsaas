"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  post_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [showCatForm, setShowCatForm] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [catIcon, setCatIcon] = useState("📝");
  const [newTag, setNewTag] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [catRes, tagRes] = await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("tags").select("*").order("name"),
    ]);

    // Get post counts
    const cats = catRes.data || [];
    const { data: postCounts } = await supabase
      .from("posts")
      .select("category_id")
      .eq("is_published", true);

    const countMap: Record<string, number> = {};
    postCounts?.forEach((p) => {
      if (p.category_id) {
        countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
      }
    });

    const catsWithCount = cats.map((cat) => ({
      ...cat,
      post_count: countMap[cat.id] || 0,
    }));

    setCategories(catsWithCount);
    setTags(tagRes.data || []);
  };

  const resetCatForm = () => {
    setCatName("");
    setCatDescription("");
    setCatIcon("📝");
    setEditingCat(null);
    setShowCatForm(false);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const slug = catName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (editingCat) {
      await supabase
        .from("categories")
        .update({
          name: catName.trim(),
          slug,
          description: catDescription.trim() || null,
          icon: catIcon.trim() || null,
        })
        .eq("id", editingCat.id);
    } else {
      await supabase.from("categories").insert({
        name: catName.trim(),
        slug,
        description: catDescription.trim() || null,
        icon: catIcon.trim() || null,
      });
    }

    resetCatForm();
    fetchData();
  };

  const startEditCategory = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatDescription(cat.description || "");
    setCatIcon(cat.icon || "📝");
    setShowCatForm(true);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Posts will be unlinked but not deleted.")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchData();
  };

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    const slug = newTag.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    await supabase.from("tags").insert({ name: newTag.trim(), slug });
    setNewTag("");
    fetchData();
  };

  const deleteTag = async (id: string) => {
    await supabase.from("tags").delete().eq("id", id);
    fetchData();
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-primary-900 mb-8">Categories & Tags</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Categories - takes 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary-800">Categories</h2>
            <button
              onClick={() => {
                if (showCatForm) resetCatForm();
                else setShowCatForm(true);
              }}
              className="btn-primary text-xs"
            >
              {showCatForm ? "Cancel" : "+ New Category"}
            </button>
          </div>

          {/* Create/Edit form */}
          {showCatForm && (
            <form onSubmit={handleCreateCategory} className="card mb-6 space-y-4">
              <h3 className="font-medium text-primary-700 text-sm">
                {editingCat ? "Edit Category" : "Create Category"}
              </h3>
              <div className="grid grid-cols-[auto_1fr] gap-3">
                {/* Icon picker */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Icon</label>
                  <input
                    type="text"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="input-field w-16 text-center text-xl"
                    placeholder="📝"
                    maxLength={4}
                  />
                </div>
                {/* Name */}
                <div>
                  <label className="block text-xs text-primary-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="input-field"
                    placeholder="Category name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-primary-500 mb-1">Description</label>
                <input
                  type="text"
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  className="input-field"
                  placeholder="A short description for this category..."
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  {editingCat ? "Save Changes" : "Create Category"}
                </button>
                <button type="button" onClick={resetCatForm} className="btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Category list */}
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="card !p-4 flex items-center gap-4">
                <span className="text-2xl">{cat.icon || "📝"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary-800">{cat.name}</span>
                    <span className="text-xs text-primary-300 bg-warm-100 px-2 py-0.5 rounded-full">
                      {cat.post_count} posts
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-xs text-primary-400 mt-0.5 truncate">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEditCategory(cat)}
                    className="text-xs text-primary-500 hover:text-primary-700 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-sm text-primary-400 text-center py-8">No categories yet.</p>
            )}
          </div>
        </div>

        {/* Tags - 1 col */}
        <div>
          <h2 className="text-lg font-semibold text-primary-800 mb-4">Tags</h2>
          <form onSubmit={addTag} className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="input-field flex-1 text-sm"
              placeholder="New tag"
            />
            <button type="submit" className="btn-primary text-xs">Add</button>
          </form>
          <div className="space-y-1">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-warm-100 transition-colors">
                <span className="text-sm text-primary-700">{tag.name}</span>
                <button
                  onClick={() => deleteTag(tag.id)}
                  className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
            {tags.length === 0 && (
              <p className="text-xs text-primary-400 text-center py-4">No tags yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
