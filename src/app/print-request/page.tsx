"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

// === Types ===
type Source = "posts" | "collections";
type ProductType = "poster" | "mug" | "tshirt" | "pillow" | "book";
type PosterSize = "a4" | "a3" | "a2" | "a1";
type MugType = "white" | "magic" | "premium";
type TshirtStyle = "round" | "oversized" | "polo";
type TshirtSize = "xs" | "s" | "m" | "l" | "xl" | "xxl";
type TshirtColor = "black" | "white" | "cream" | "grey" | "brown";
type PillowShape = "square" | "rectangle" | "heart";
type PillowFabric = "cotton" | "velvet" | "premium";

interface PricingMap { [key: string]: number; }

const PRICES: Record<ProductType, PricingMap> = {
  poster: { a4: 249, a3: 399, a2: 599, a1: 899 },
  mug: { white: 399, magic: 599, premium: 599 },
  tshirt: { round: 799, oversized: 899, polo: 999 },
  pillow: { square: 699, rectangle: 749, heart: 799 },
  book: { default: 999 },
};

const SHIPPING = 79;
const GST_RATE = 0.18;

export default function PrintRequestPage() {
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  // State
  const [source, setSource] = useState<Source>("posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState("");
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
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  // Fetch data
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [postsRes, colsRes, reqsRes] = await Promise.all([
        supabase.from("posts").select("id, content, image_url, created_at, categories:category_id(name)").eq("author_id", user.id).eq("is_published", true).order("created_at", { ascending: false }),
        supabase.from("collections").select("id, name, collection_posts(count)").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("print_requests").select("*, posts:post_id(content)").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      setPosts(postsRes.data || []);
      setCollections(colsRes.data || []);
      setRequests(reqsRes.data || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  // Price calculation
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    if (product === "poster") return PRICES.poster[posterSize] || 249;
    if (product === "mug") return PRICES.mug[mugType] || 399;
    if (product === "tshirt") return PRICES.tshirt[tshirtStyle] || 799;
    if (product === "pillow") return PRICES.pillow[pillowShape] || 699;
    if (product === "book") return PRICES.book.default;
    return 0;
  }, [product, posterSize, mugType, tshirtStyle, pillowShape]);

  const subtotal = unitPrice * quantity;
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + SHIPPING + gst;

  // Validation
  const canSubmit = selectedId && product && quantity > 0 && quantity <= 20;

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
      : product === "book" ? "Book format" : "";

    const fullNotes = `Product: ${product}\nOptions: ${optionDetails}\nQuantity: ${quantity}\nSource: ${source}\nPrice: ₹${total}\n${notes ? `Notes: ${notes}` : ""}`;

    const { error } = await supabase.from("print_requests").insert({
      user_id: user.id,
      post_id: selectedId,
      notes: fullNotes.trim(),
    });

    if (error) {
      showToast("Failed to submit request", "error");
    } else {
      showToast("Print request submitted!", "success");
      setSelectedId("");
      setProduct("");
      setQuantity(1);
      setNotes("");
      // Refresh requests
      const { data } = await supabase.from("print_requests").select("*, posts:post_id(content)").eq("user_id", user.id).order("created_at", { ascending: false });
      setRequests(data || []);
    }
    setSubmitting(false);
  };

  // Filtered items
  const filteredPosts = posts.filter((p) => p.content?.toLowerCase().includes(search.toLowerCase()));
  const filteredCollections = collections.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="max-w-feed mx-auto px-4 sm:px-6 pt-6 space-y-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-feed mx-auto px-4 sm:px-6 pt-6 pb-8">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white mb-1">Print Shop</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">Turn your words into physical art</p>

      {/* Step 1: Source selection */}
      <section className="mb-8">
        <Label>Choose Source</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <ToggleCard selected={source === "posts"} onClick={() => { setSource("posts"); setSelectedId(""); }} icon="📝" title="My Posts" subtitle={`${posts.length} posts`} />
          <ToggleCard selected={source === "collections"} onClick={() => { setSource("collections"); setSelectedId(""); }} icon="📚" title="My Collections" subtitle={`${collections.length} collections`} />
        </div>
      </section>

      {/* Step 2: Select item */}
      <section className="mb-8">
        <Label>{source === "posts" ? "Select Post" : "Select Collection"}</Label>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input mt-2 mb-3"
          placeholder={`Search ${source}...`}
        />
        <div className="space-y-2 max-h-[240px] overflow-y-auto rounded-xl border border-neutral-200 dark:border-neutral-700 p-2">
          {source === "posts" ? (
            filteredPosts.length > 0 ? filteredPosts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedId(post.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedId === post.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500" : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
              >
                <div className="flex gap-3 items-start">
                  {post.image_url && <img src={post.image_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800 dark:text-neutral-200 line-clamp-2">{post.content}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}{(post as any).categories?.name ? ` · ${(post as any).categories.name}` : ""}</p>
                  </div>
                </div>
              </button>
            )) : <p className="text-xs text-neutral-400 text-center py-4">No posts found.</p>
          ) : (
            filteredCollections.length > 0 ? filteredCollections.map((col) => (
              <button
                key={col.id}
                onClick={() => setSelectedId(col.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${selectedId === col.id ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500" : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
              >
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">📚 {col.name}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{col.collection_posts?.[0]?.count || 0} poems</p>
              </button>
            )) : <p className="text-xs text-neutral-400 text-center py-4">No collections found.</p>
          )}
        </div>
      </section>

      {/* Step 3: Product type */}
      <section className="mb-8">
        <Label>Product Type</Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
          {([
            { type: "poster", icon: "🖼️", name: "Poster" },
            { type: "mug", icon: "☕", name: "Mug" },
            { type: "tshirt", icon: "👕", name: "T-Shirt" },
            { type: "pillow", icon: "🛏️", name: "Pillow" },
            { type: "book", icon: "📕", name: "Book" },
          ] as const).map((p) => (
            <button
              key={p.type}
              onClick={() => setProduct(p.type)}
              className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all ${product === p.type ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.02] shadow-soft" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{p.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Step 4: Product options */}
      {product === "poster" && (
        <section className="mb-8 animate-fade-in">
          <Label>Poster Size</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {([
              { size: "a4", dim: "8.3 × 11.7 in", price: 249 },
              { size: "a3", dim: "11.7 × 16.5 in", price: 399 },
              { size: "a2", dim: "16.5 × 23.4 in", price: 599 },
              { size: "a1", dim: "23.4 × 33.1 in", price: 899 },
            ] as const).map((s) => (
              <OptionCard key={s.size} selected={posterSize === s.size} onClick={() => setPosterSize(s.size)} title={s.size.toUpperCase()} subtitle={s.dim} price={s.price} />
            ))}
          </div>
        </section>
      )}

      {product === "mug" && (
        <section className="mb-8 animate-fade-in">
          <Label>Mug Type</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {([
              { type: "white", name: "White Mug", price: 399 },
              { type: "magic", name: "Magic Mug", price: 599 },
              { type: "premium", name: "Premium", price: 599 },
            ] as const).map((m) => (
              <OptionCard key={m.type} selected={mugType === m.type} onClick={() => setMugType(m.type)} title={m.name} price={m.price} />
            ))}
          </div>
        </section>
      )}

      {product === "tshirt" && (
        <section className="mb-8 animate-fade-in space-y-4">
          <div>
            <Label>Style</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {([{ s: "round", n: "Round Neck", p: 799 }, { s: "oversized", n: "Oversized", p: 899 }, { s: "polo", n: "Polo", p: 999 }] as const).map((t) => (
                <OptionCard key={t.s} selected={tshirtStyle === t.s} onClick={() => setTshirtStyle(t.s)} title={t.n} price={t.p} />
              ))}
            </div>
          </div>
          <div>
            <Label>Size</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {(["xs", "s", "m", "l", "xl", "xxl"] as const).map((s) => (
                <button key={s} onClick={() => setTshirtSize(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${tshirtSize === s ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300" : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"}`}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {([
                { c: "black", hex: "#1a1a1a" }, { c: "white", hex: "#f5f5f5" }, { c: "cream", hex: "#f5f0e8" }, { c: "grey", hex: "#9ca3af" }, { c: "brown", hex: "#92400e" },
              ] as const).map((cl) => (
                <button key={cl.c} onClick={() => setTshirtColor(cl.c)} className={`w-8 h-8 rounded-full border-2 transition-all ${tshirtColor === cl.c ? "border-brand-500 scale-110 ring-2 ring-brand-200 dark:ring-brand-800" : "border-neutral-300 dark:border-neutral-600"}`} style={{ backgroundColor: cl.hex }} aria-label={cl.c} title={cl.c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {product === "pillow" && (
        <section className="mb-8 animate-fade-in space-y-4">
          <div>
            <Label>Shape</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {([{ s: "square", n: "Square", p: 699 }, { s: "rectangle", n: "Rectangle", p: 749 }, { s: "heart", n: "Heart ❤️", p: 799 }] as const).map((p) => (
                <OptionCard key={p.s} selected={pillowShape === p.s} onClick={() => setPillowShape(p.s)} title={p.n} price={p.p} />
              ))}
            </div>
          </div>
          <div>
            <Label>Fabric</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {([{ f: "cotton", n: "Cotton" }, { f: "velvet", n: "Velvet" }, { f: "premium", n: "Premium" }] as const).map((fb) => (
                <button key={fb.f} onClick={() => setPillowFabric(fb.f)} className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${pillowFabric === fb.f ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300" : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"}`}>
                  {fb.n}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {product === "book" && source === "collections" && (
        <section className="mb-8 animate-fade-in">
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
            📖 Books require a minimum of 25 poems in the collection.
          </div>
        </section>
      )}

      {/* Quantity */}
      {product && (
        <section className="mb-8 animate-fade-in">
          <Label>Quantity</Label>
          <div className="flex items-center gap-3 mt-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="btn-icon border border-neutral-200 dark:border-neutral-700" aria-label="Decrease">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>
            </button>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white w-8 text-center">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(20, quantity + 1))} className="btn-icon border border-neutral-200 dark:border-neutral-700" aria-label="Increase">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </button>
          </div>
        </section>
      )}

      {/* Notes */}
      {product && (
        <section className="mb-8 animate-fade-in">
          <Label>Delivery Notes (optional)</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input mt-2 min-h-[80px] resize-y"
            placeholder="Gift message, birthday, special instructions..."
            maxLength={300}
          />
        </section>
      )}

      {/* Price summary */}
      {product && selectedId && (
        <section className="mb-8 animate-fade-in">
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Subtotal ({quantity}×)</span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">Shipping</span>
              <span className="text-neutral-800 dark:text-neutral-200">₹{SHIPPING}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500 dark:text-neutral-400">GST (18%)</span>
              <span className="text-neutral-800 dark:text-neutral-200">₹{gst}</span>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2 flex justify-between">
              <span className="font-semibold text-neutral-900 dark:text-white">Total</span>
              <span className="font-bold text-lg text-neutral-900 dark:text-white">₹{total}</span>
            </div>
          </div>
        </section>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="btn-primary w-full h-12 text-base"
      >
        {submitting ? "Submitting..." : `Place Order${total > 0 ? ` · ₹${total}` : ""}`}
      </button>

      {/* My Requests */}
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

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{children}</p>;
}

function ToggleCard({ selected, onClick, icon, title, subtitle }: { selected: boolean; onClick: () => void; icon: string; title: string; subtitle: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 text-left transition-all ${selected ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-soft scale-[1.01]" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"}`}
    >
      <span className="text-2xl block mb-1">{icon}</span>
      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{title}</p>
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{subtitle}</p>
    </button>
  );
}

function OptionCard({ selected, onClick, title, subtitle, price }: { selected: boolean; onClick: () => void; title: string; subtitle?: string; price?: number }) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl border-2 text-center transition-all ${selected ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-soft" : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"}`}
    >
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
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
