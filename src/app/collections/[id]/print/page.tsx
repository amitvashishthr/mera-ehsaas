"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductSelector } from "@/components/print/ProductSelector";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function PrintCollectionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  const [collection, setCollection] = useState<any>(null);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1=product, 2=address, 3=confirm

  // Form state
  const [productType, setProductType] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", state: "", country: "India", postal_code: "", notes: "",
  });

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: col } = await supabase
        .from("collections")
        .select("id, name, user_id")
        .eq("id", id)
        .single();

      if (!col || col.user_id !== user.id) {
        router.push("/collections");
        return;
      }

      const { count } = await supabase
        .from("collection_posts")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", id);

      setCollection(col);
      setPostCount(count || 0);
      setForm((prev) => ({ ...prev, email: user.email || "" }));
      setLoading(false);
    }
    fetchData();
  }, [id, supabase, router]);

  const handleSubmit = async () => {
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("print_orders").insert({
      user_id: user.id,
      collection_id: id,
      product_type: productType,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      postal_code: form.postal_code.trim(),
      notes: form.notes.trim() || null,
    });

    if (error) {
      showToast("Failed to place order: " + error.message, "error");
    } else {
      showToast("Print order placed successfully!", "success");
      router.push("/print-orders");
    }
    setSubmitting(false);
  };

  const canProceed = () => {
    if (step === 1) return !!productType;
    if (step === 2) return form.name && form.phone && form.email && form.address && form.city && form.state && form.country && form.postal_code;
    return true;
  };

  if (loading) {
    return (
      <div className="max-w-feed mx-auto">
        <div className="h-8 skeleton w-48 mb-6" />
        <div className="card animate-pulse space-y-4">
          <div className="h-6 skeleton w-64" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 skeleton rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (postCount < 10) {
    return (
      <div className="max-w-feed mx-auto text-center py-16">
        <span className="text-5xl block mb-4">📚</span>
        <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-dark-100 mb-2">
          Not Enough Posts
        </h1>
        <p className="text-primary-500 dark:text-dark-400 mb-6 max-w-md mx-auto">
          You need at least 10 posts in this collection to create a print product. Currently you have {postCount}.
        </p>
        <Link href={`/collections/${id}`} className="btn-primary">
          Back to Collection
        </Link>
      </div>
    );
  }

  if (postCount > 100) {
    return (
      <div className="max-w-feed mx-auto text-center py-16">
        <span className="text-5xl block mb-4">📦</span>
        <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-dark-100 mb-2">
          Too Many Posts
        </h1>
        <p className="text-primary-500 dark:text-dark-400 mb-6 max-w-md mx-auto">
          Maximum 100 posts per print order. Your collection has {postCount}. Please create a smaller collection.
        </p>
        <Link href={`/collections/${id}`} className="btn-primary">
          Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-feed mx-auto">
      <Link href={`/collections/${id}`} className="text-sm text-primary-400 hover:text-primary-600 dark:text-dark-400 dark:hover:text-dark-200 transition-colors inline-flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Back to collection
      </Link>

      <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary-900 dark:text-dark-100 mb-2">
        Print &ldquo;{collection?.name}&rdquo;
      </h1>
      <p className="text-sm text-primary-400 dark:text-dark-400 mb-8">
        {postCount} posts · Step {step} of 3
      </p>

      {/* Progress bar */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${
            s <= step ? "bg-primary-600 dark:bg-primary-500" : "bg-warm-200 dark:bg-dark-600"
          }`} />
        ))}
      </div>

      {/* Step 1: Product selection */}
      {step === 1 && (
        <div className="card">
          <h2 className="font-semibold text-primary-800 dark:text-dark-100 mb-4">Choose Product Type</h2>
          <ProductSelector selected={productType} onSelect={setProductType} />
        </div>
      )}

      {/* Step 2: Shipping address */}
      {step === 2 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-primary-800 dark:text-dark-100 mb-2">Shipping Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">Full Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">Phone *</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">Address *</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field text-sm min-h-[80px]" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">City *</label>
              <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">State *</label>
              <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">Country *</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="input-field text-sm" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">Postal Code *</label>
              <input type="text" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="input-field text-sm" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-primary-600 dark:text-dark-300 mb-1">Notes (optional)</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field text-sm" placeholder="Special instructions..." />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="card space-y-5">
          <h2 className="font-semibold text-primary-800 dark:text-dark-100">Confirm Order</h2>
          <div className="bg-warm-50 dark:bg-dark-700 rounded-xl p-4 space-y-2 text-sm">
            <p><span className="text-primary-500 dark:text-dark-400">Product:</span> <strong className="text-primary-800 dark:text-dark-100">{productType}</strong></p>
            <p><span className="text-primary-500 dark:text-dark-400">Collection:</span> <strong className="text-primary-800 dark:text-dark-100">{collection?.name}</strong> ({postCount} posts)</p>
            <p><span className="text-primary-500 dark:text-dark-400">Ship to:</span> <strong className="text-primary-800 dark:text-dark-100">{form.name}</strong></p>
            <p className="text-primary-600 dark:text-dark-300">{form.address}, {form.city}, {form.state} {form.postal_code}, {form.country}</p>
            <p><span className="text-primary-500 dark:text-dark-400">Phone:</span> {form.phone}</p>
            <p><span className="text-primary-500 dark:text-dark-400">Email:</span> {form.email}</p>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="btn-outline">
            Back
          </button>
        ) : <div />}

        {step < 3 ? (
          <button onClick={() => setStep(step + 1)} className="btn-primary" disabled={!canProceed()}>
            Continue
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn-primary" disabled={submitting}>
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        )}
      </div>
    </div>
  );
}
