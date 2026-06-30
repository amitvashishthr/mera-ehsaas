"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

type Source = "posts" | "collections";
type ProductType = "poster" | "mug" | "tshirt" | "pillow" | "book";
type PosterSize = "a4" | "a3" | "a2" | "a1";
type MugType = "white" | "magic" | "premium";
type TshirtStyle = "round" | "oversized" | "polo";
type TshirtSize = "xs" | "s" | "m" | "l" | "xl" | "xxl";
type TshirtColor = "black" | "white" | "cream" | "grey" | "brown";
type PillowShape = "square" | "rectangle" | "heart";
type PillowFabric = "cotton" | "velvet" | "premium";

const PRICES = {
  poster: { a4: 249, a3: 399, a2: 599, a1: 899 },
  mug: { white: 399, magic: 599, premium: 599 },
  tshirt: { round: 799, oversized: 899, polo: 999 },
  pillow: { square: 699, rectangle: 749, heart: 799 },
  book: { default: 999 },
};
const SHIPPING = 79;
const GST_RATE = 0.18;
const BOOK_MIN = 25;
const BOOK_MAX = 70;

export default function PrintRequestPage() {
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  const [source, setSource] = useState<Source>("posts");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [collectionPosts, setCollectionPosts] = useState<any[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [product, setProduct] = useState<ProductType | "">("");
  const [posterSize, setPosterSize] = useState<PosterSize>("a4");
  const [mugType, setMugType] = useState<MugType>("white");
  const [tshirtStyle, setTshirtStyle] = useState<TshirtStyle>("round");
  const [tshirtSize, setTshirtSize] = useState<TshirtSize>("m");
  const [tshirtColor, setTshirtColor] = useState<TshirtColor>("black");
  const [pillowShape, setPillowShape] = useState<PillowShape>("square");
  const [pillowFabric, setPillowFabric] = useState<PillowFabric>("cotton");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  // Initial data load
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [postsRes, colsRes, reqsRes] = await Promise.all([
        supabase.from("posts").select("id, content, image_url, created_at, categories:category_id(name), likes(count)").eq("author_id", user.id).eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("collections").select("id, name, collection_posts(count)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("print_requests").select("*, posts:post_id(content)").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      setUserPosts(postsRes.data || []);
      setCollections(colsRes.data || []);
      setRequests(reqsRes.data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  // Load collection posts when a collection is selected
  useEffect(() => {
    if (!selectedCollectionId || source !== "collections") return;
    async function loadCollectionPosts() {
      setLoadingCollection(true);
      setSelectedPostIds([]);
      const { data: entries } = await supabase
        .from("collection_posts").select("post_id").eq("collection_id", selectedCollectionId).order("added_at", { ascending: false });
      if (!entries?.length) { setCollectionPosts([]); setLoadingCollection(false); return; }
      const ids = entries.map((e) => e.post_id);
      const { data } = await supabase
        .from("posts").select("id, content, image_url, created_at, categories:category_id(name), likes(count)")
        .in("id", ids).eq("is_published", true);
      const map = new Map((data || []).map((p) => [p.id, p]));
      setCollectionPosts(ids.map((id) => map.get(id)).filter(Boolean));
      setLoadingCollection(false);
    }
    loadCollectionPosts();
  }, [selectedCollectionId, source, supabase]);

  // Selection handler
  const handlePostSelect = useCallback((postId: string) => {
    if (product === "book") {
      setSelectedPostIds((prev) => {
        if (prev.includes(postId)) return prev.filter((id) => id !== postId);
        if (prev.length >= BOOK_MAX) return prev;
        return [...prev, postId];
      });
    } else {
      // Single select for poster, mug, tshirt, pillow
      setSelectedPostIds((prev) => prev[0] === postId ? [] : [postId]);
    }
  }, [product]);

  // Quick actions for book
  const selectAll = () => setSelectedPostIds(collectionPosts.slice(0, BOOK_MAX).map((p) => p.id));
  const clearSelection = () => setSelectedPostIds([]);
  const selectFirst25 = () => setSelectedPostIds(collectionPosts.slice(0, BOOK_MIN).map((p) => p.id));

  // Price
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    if (product === "poster") return PRICES.poster[posterSize];
    if (product === "mug") return PRICES.mug[mugType];
    if (product === "tshirt") return PRICES.tshirt[tshirtStyle];
    if (product === "pillow") return PRICES.pillow[pillowShape];
    return PRICES.book.default;
  }, [product, posterSize, mugType, tshirtStyle, pillowShape]);
  const subtotal = unitPrice * quantity;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + SHIPPING + gst;

  // Book page estimate
  const estimatedPages = selectedPostIds.length + 3; // front cover + back cover + index

  // Validation
  const isBookValid = product === "book" ? selectedPostIds.length >= BOOK_MIN : true;
  const hasSelection = selectedPostIds.length > 0;
  const canSubmit = hasSelection && product && isBookValid && quantity > 0 && quantity <= 20;

  // Submit
  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }

    const optionDetails = product === "poster" ? `Size: ${posterSize.toUpperCase()}`
      : product === "mug" ? `Type: ${mugType}`
      : product === "tshirt" ? `Style: ${tshirtStyle}, Size: ${tshirtSize.toUpperCase()}, Color: ${tshirtColor}`
      : product === "pillow" ? `Shape: ${pillowShape}, Fabric: ${pillowFabric}`
      : `Book (${selectedPostIds.length} poems, ~${estimatedPages} pages)`;

    const fullNotes = [
      `Product: ${product}`, `Options: ${optionDetails}`,
      `Quantity: ${quantity}`, `Source: ${source}`,
      `Price: ₹${total}`,
      product === "book" ? `Post IDs: ${selectedPostIds.join(",")}` : "",
      notes ? `Notes: ${notes}` : "",
    ].filter(Boolean).join("\n");

    const { error } = await supabase.from("print_requests").insert({
      user_id: user.id,
      post_id: selectedPostIds[0],
      notes: fullNotes.trim(),
    });

    if (error) { showToast("Failed to submit", "error"); }
    else {
      showToast("Print request submitted!", "success");
      setSelectedPostIds([]); setProduct(""); setQuantity(1); setNotes("");
      const { data } = await supabase.from("print_requests").select("*, posts:post_id(content)").eq("user_id", user.id).order("created_at", { ascending: false });
      setRequests(data || []);
    }
    setSubmitting(false);
  };

  // Items to display in the grid
  const displayPosts = source === "collections" ? collectionPosts : userPosts;

  if (loading) return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6 space-y-4">
      {[1, 2, 3].map((i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
    </div>
  );

  return (
    <div className="max-w-[960px] mx-auto px-4 sm:px-6 pt-6 pb-12">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">Print Shop</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Turn your words into physical art</p>

      {/* Source */}
      <section className="mb-8">
        <SectionLabel>Choose Source</SectionLabel>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <ToggleCard selected={source === "posts"} onClick={() => { setSource("posts"); setSelectedCollectionId(""); setSelectedPostIds([]); setCollectionPosts([]); }} icon="📝" title="My Posts" subtitle={`${userPosts.length} posts`} />
          <ToggleCard selected={source === "collections"} onClick={() => { setSource("collections"); setSelectedPostIds([]); }} icon="📚" title="My Collections" subtitle={`${collections.length} collections`} />
        </div>
      </section>

      {/* Collection selector */}
      {source === "collections" && (
        <section className="mb-8">
          <SectionLabel>Select Collection</SectionLabel>
          <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700 p-2">
            {collections.map((col) => (
              <button key={col.id} onClick={() => setSelectedCollectionId(col.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedCollectionId === col.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500" : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">📚 {col.name}</p>
                <p className="text-[11px] text-neutral-400">{col.collection_posts?.[0]?.count || 0} poems</p>
              </button>
            ))}
            {collections.length === 0 && <p className="text-xs text-neutral-400 text-center py-4">No collections.</p>}
          </div>
        </section>
      )}

      {/* Product type */}
      <section className="mb-8">
        <SectionLabel>Product Type</SectionLabel>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
          {([
            { type: "poster" as const, icon: "🖼️", name: "Poster" },
            { type: "mug" as const, icon: "☕", name: "Mug" },
            { type: "tshirt" as const, icon: "👕", name: "T-Shirt" },
            { type: "pillow" as const, icon: "🛏️", name: "Pillow" },
            { type: "book" as const, icon: "📕", name: "Book" },
          ]).map((p) => (
            <button key={p.type} onClick={() => { setProduct(p.type); setSelectedPostIds([]); }}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${product === p.type ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.02] shadow-soft" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`}>
              <span className="text-2xl">{p.icon}</span>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Product options (poster/mug/tshirt/pillow) */}
      {product === "poster" && <PosterOptions size={posterSize} setSize={setPosterSize} />}
      {product === "mug" && <MugOptions type={mugType} setType={setMugType} />}
      {product === "tshirt" && <TshirtOptions style={tshirtStyle} setStyle={setTshirtStyle} size={tshirtSize} setSize={setTshirtSize} color={tshirtColor} setColor={setTshirtColor} />}
      {product === "pillow" && <PillowOptions shape={pillowShape} setShape={setPillowShape} fabric={pillowFabric} setFabric={setPillowFabric} />}

      {/* Post selection grid */}
      {product && (source === "posts" || (source === "collections" && selectedCollectionId)) && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <SectionLabel>{product === "book" ? "Select Poems for Book" : "Select Post"}</SectionLabel>
            {product === "book" && <span className="text-xs text-neutral-500 dark:text-neutral-400">{selectedPostIds.length} / {BOOK_MAX}</span>}
          </div>

          {/* Book progress bar */}
          {product === "book" && (
            <div className="mb-4">
              <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${selectedPostIds.length >= BOOK_MIN ? "bg-green-500" : "bg-brand-500"}`}
                  style={{ width: `${Math.min(100, (selectedPostIds.length / BOOK_MAX) * 100)}%` }} />
              </div>
              {selectedPostIds.length < BOOK_MIN && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  You have selected {selectedPostIds.length} poems. A book requires minimum {BOOK_MIN}. Need {BOOK_MIN - selectedPostIds.length} more.
                </p>
              )}
              {selectedPostIds.length >= BOOK_MAX && (
                <p className="text-xs text-red-500 mt-2">Maximum {BOOK_MAX} poems can be included in one book.</p>
              )}
            </div>
          )}

          {/* Quick actions for book */}
          {product === "book" && displayPosts.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button onClick={selectAll} className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">Select All</button>
              <button onClick={selectFirst25} className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">Select First 25</button>
              <button onClick={clearSelection} className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">Clear</button>
            </div>
          )}

          {/* Loading */}
          {loadingCollection && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 skeleton rounded-xl" />)}
            </div>
          )}

          {/* Post cards grid */}
          {!loadingCollection && displayPosts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {displayPosts.map((post) => {
                const isSelected = selectedPostIds.includes(post.id);
                return (
                  <button key={post.id} onClick={() => handlePostSelect(post.id)}
                    className={`relative text-left rounded-xl border-2 overflow-hidden transition-all duration-200 group ${isSelected ? "border-brand-500 shadow-card ring-1 ring-brand-500/30 scale-[1.01]" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:shadow-soft"}`}>
                    {/* Image */}
                    {post.image_url ? (
                      <div className="h-24 bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <img src={post.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="h-24 bg-gradient-to-br from-brand-50 to-brand-100 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                        <span className="text-2xl opacity-40">📜</span>
                      </div>
                    )}
                    {/* Content */}
                    <div className="p-3">
                      <p className="text-xs text-neutral-800 dark:text-neutral-200 line-clamp-3 leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {(post as any).categories?.name && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-medium">{(post as any).categories.name}</span>
                        )}
                        <span className="text-[9px] text-neutral-400">{new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                        {post.likes?.[0]?.count > 0 && <span className="text-[9px] text-neutral-400">❤️ {post.likes[0].count}</span>}
                      </div>
                    </div>
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {!loadingCollection && displayPosts.length === 0 && (
            <p className="text-xs text-neutral-400 text-center py-8">{source === "collections" ? "No poems in this collection." : "No posts available."}</p>
          )}
        </section>
      )}

      {/* Quantity */}
      {product && hasSelection && (
        <section className="mb-8">
          <SectionLabel>Quantity</SectionLabel>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn-icon border border-neutral-200 dark:border-neutral-700" aria-label="Decrease"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg></button>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="btn-icon border border-neutral-200 dark:border-neutral-700" aria-label="Increase"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg></button>
          </div>
        </section>
      )}

      {/* Notes */}
      {product && hasSelection && (
        <section className="mb-8">
          <SectionLabel>Delivery Notes (optional)</SectionLabel>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input mt-2 min-h-[80px] resize-y" placeholder="Gift message, special instructions..." maxLength={300} />
        </section>
      )}

      {/* Order Summary */}
      {product && hasSelection && (
        <section className="mb-8">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 space-y-2 text-sm">
            {product === "book" ? (
              <>
                <Row label="Collection" value={collections.find((c) => c.id === selectedCollectionId)?.name || "Multiple Posts"} />
                <Row label="Selected Poems" value={String(selectedPostIds.length)} />
                <Row label="Estimated Pages" value={`~${estimatedPages} pages`} />
              </>
            ) : (
              <Row label="Selected Post" value={displayPosts.find((p) => p.id === selectedPostIds[0])?.content?.substring(0, 40) + "..." || "—"} />
            )}
            <Row label="Product" value={product.charAt(0).toUpperCase() + product.slice(1)} />
            <Row label={`Subtotal (${quantity}×)`} value={`₹${subtotal}`} />
            <Row label="Shipping" value={`₹${SHIPPING}`} />
            <Row label="GST (18%)" value={`₹${gst}`} />
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
              <span className="font-bold text-lg text-neutral-900 dark:text-white">₹{total}</span>
            </div>
          </div>
        </section>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} disabled={!canSubmit || submitting} className="btn-primary w-full h-12 text-base">
        {submitting ? "Submitting..." : `Place Order${canSubmit && total > 0 ? ` · ₹${total}` : ""}`}
      </button>

      {/* My Orders */}
      {requests.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">My Orders</h2>
          <div className="space-y-3">
            {requests.map((req) => (
              <div key={req.id} className="card !p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-lg shrink-0">
                  {req.notes?.includes("poster") ? "🖼️" : req.notes?.includes("mug") ? "☕" : req.notes?.includes("tshirt") ? "👕" : req.notes?.includes("pillow") ? "🛏️" : req.notes?.includes("book") ? "📕" : "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-1">{req.posts?.content?.substring(0, 50) || "Print Request"}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{new Date(req.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// === Sub-components ===

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{children}</p>;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="text-neutral-800 dark:text-neutral-200 font-medium text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

function ToggleCard({ selected, onClick, icon, title, subtitle }: { selected: boolean; onClick: () => void; icon: string; title: string; subtitle: string }) {
  return (
    <button onClick={onClick} className={`p-4 rounded-2xl border-2 text-left transition-all ${selected ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-soft" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`}>
      <span className="text-2xl block mb-1">{icon}</span>
      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{title}</p>
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{subtitle}</p>
    </button>
  );
}

function OptionCard({ selected, onClick, title, subtitle, price }: { selected: boolean; onClick: () => void; title: string; subtitle?: string; price?: number }) {
  return (
    <button onClick={onClick} className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-soft" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}>
      <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{title}</p>
      {subtitle && <p className="text-[10px] text-neutral-400 mt-0.5">{subtitle}</p>}
      {price && <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mt-1">₹{price}</p>}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
    approved: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    printing: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    shipped: "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300",
    delivered: "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300",
    rejected: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300",
    cancelled: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300",
  };
  return <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${styles[status] || styles.pending}`}>{status}</span>;
}

// Product option sections
function PosterOptions({ size, setSize }: { size: PosterSize; setSize: (s: PosterSize) => void }) {
  return (
    <section className="mb-8 animate-fade-in">
      <SectionLabel>Poster Size</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        {([{ s: "a4" as const, d: "8.3 × 11.7 in", p: 249 }, { s: "a3" as const, d: "11.7 × 16.5 in", p: 399 }, { s: "a2" as const, d: "16.5 × 23.4 in", p: 599 }, { s: "a1" as const, d: "23.4 × 33.1 in", p: 899 }]).map((o) => (
          <OptionCard key={o.s} selected={size === o.s} onClick={() => setSize(o.s)} title={o.s.toUpperCase()} subtitle={o.d} price={o.p} />
        ))}
      </div>
    </section>
  );
}

function MugOptions({ type, setType }: { type: MugType; setType: (t: MugType) => void }) {
  return (
    <section className="mb-8 animate-fade-in">
      <SectionLabel>Mug Type</SectionLabel>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {([{ t: "white" as const, n: "White Mug", p: 399 }, { t: "magic" as const, n: "Magic Mug", p: 599 }, { t: "premium" as const, n: "Premium", p: 599 }]).map((m) => (
          <OptionCard key={m.t} selected={type === m.t} onClick={() => setType(m.t)} title={m.n} price={m.p} />
        ))}
      </div>
    </section>
  );
}

function TshirtOptions({ style, setStyle, size, setSize, color, setColor }: { style: TshirtStyle; setStyle: (s: TshirtStyle) => void; size: TshirtSize; setSize: (s: TshirtSize) => void; color: TshirtColor; setColor: (c: TshirtColor) => void }) {
  return (
    <section className="mb-8 animate-fade-in space-y-4">
      <div>
        <SectionLabel>Style</SectionLabel>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {([{ s: "round" as const, n: "Round Neck", p: 799 }, { s: "oversized" as const, n: "Oversized", p: 899 }, { s: "polo" as const, n: "Polo", p: 999 }]).map((t) => (
            <OptionCard key={t.s} selected={style === t.s} onClick={() => setStyle(t.s)} title={t.n} price={t.p} />
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Size</SectionLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {(["xs", "s", "m", "l", "xl", "xxl"] as const).map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${size === s ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300" : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"}`}>{s.toUpperCase()}</button>
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Color</SectionLabel>
        <div className="flex flex-wrap gap-2 mt-2">
          {([{ c: "black" as const, h: "#1a1a1a" }, { c: "white" as const, h: "#f5f5f5" }, { c: "cream" as const, h: "#f5f0e8" }, { c: "grey" as const, h: "#9ca3af" }, { c: "brown" as const, h: "#92400e" }]).map((cl) => (
            <button key={cl.c} onClick={() => setColor(cl.c)} className={`w-8 h-8 rounded-full border-2 transition-all ${color === cl.c ? "border-brand-500 scale-110 ring-2 ring-brand-200 dark:ring-brand-800" : "border-neutral-300 dark:border-neutral-600"}`} style={{ backgroundColor: cl.h }} aria-label={cl.c} title={cl.c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PillowOptions({ shape, setShape, fabric, setFabric }: { shape: PillowShape; setShape: (s: PillowShape) => void; fabric: PillowFabric; setFabric: (f: PillowFabric) => void }) {
  return (
    <section className="mb-8 animate-fade-in space-y-4">
      <div>
        <SectionLabel>Shape</SectionLabel>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {([{ s: "square" as const, n: "Square", p: 699 }, { s: "rectangle" as const, n: "Rectangle", p: 749 }, { s: "heart" as const, n: "Heart ❤️", p: 799 }]).map((p) => (
            <OptionCard key={p.s} selected={shape === p.s} onClick={() => setShape(p.s)} title={p.n} price={p.p} />
          ))}
        </div>
      </div>
      <div>
        <SectionLabel>Fabric</SectionLabel>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {([{ f: "cotton" as const, n: "Cotton" }, { f: "velvet" as const, n: "Velvet" }, { f: "premium" as const, n: "Premium" }]).map((fb) => (
            <button key={fb.f} onClick={() => setFabric(fb.f)} className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${fabric === fb.f ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300" : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"}`}>{fb.n}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
