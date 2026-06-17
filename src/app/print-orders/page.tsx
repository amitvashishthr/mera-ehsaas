"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { OrderTimeline } from "@/components/print/OrderTimeline";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

const productLabels: Record<string, string> = {
  book: "📖 Poetry Book",
  poster: "🖼️ Poster",
  frame: "🪟 Framed Print",
  canvas: "🎨 Canvas",
  mug: "☕ Mug",
  tshirt: "👕 T-Shirt",
};

export default function PrintOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("print_orders")
        .select("*, collections:collection_id(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [supabase]);

  return (
    <div className="max-w-feed mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary-900 dark:text-dark-100">
          My Print Orders
        </h1>
        <p className="text-sm text-primary-400 dark:text-dark-400 mt-1">
          Track your physical poetry products
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="h-5 skeleton w-48" />
              <div className="h-4 skeleton w-32" />
              <div className="h-10 skeleton w-full rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🖨️</span>
          <p className="font-serif text-xl text-primary-400 dark:text-dark-400 italic mb-2">
            No print orders yet
          </p>
          <p className="text-sm text-primary-300 dark:text-dark-500 mb-6">
            Turn your collections into beautiful physical products.
          </p>
          <Link href="/collections" className="btn-primary">
            Browse Collections
          </Link>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-primary-800 dark:text-dark-100">
                    {productLabels[order.product_type] || order.product_type}
                  </p>
                  <p className="text-sm text-primary-400 dark:text-dark-400">
                    {order.collections?.name || "Collection"} · {formatDistanceToNow(order.created_at)}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium shrink-0 ${
                  order.status === "delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                  order.status === "cancelled" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" :
                  order.status === "shipped" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                }`}>
                  {order.status}
                </span>
              </div>

              {/* Timeline */}
              <OrderTimeline currentStatus={order.status} />

              {/* Shipping info */}
              <div className="mt-4 pt-4 border-t border-warm-100 dark:border-dark-700 text-xs text-primary-500 dark:text-dark-400">
                <p>Ship to: {order.name}, {order.city}, {order.state}</p>
                {order.admin_notes && (
                  <p className="mt-1 italic text-primary-400 dark:text-dark-500">Admin: {order.admin_notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
