"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { createNotification } from "@/lib/notifications";
import { OrderTimeline } from "@/components/print/OrderTimeline";
import { formatDistanceToNow } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const productLabels: Record<string, string> = {
  book: "📖 Book", poster: "🖼️ Poster", frame: "🪟 Frame",
  canvas: "🎨 Canvas", mug: "☕ Mug", tshirt: "👕 T-Shirt",
};

export default function AdminPrintOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    setLoading(true);
    let query = supabase
      .from("print_orders")
      .select("*, profiles:user_id(username, full_name), collections:collection_id(name)")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data } = await query;
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, userId: string, newStatus: string) => {
    const { error } = await supabase
      .from("print_orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      showToast("Failed to update", "error");
      return;
    }

    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order marked as ${newStatus}`, "success");

    // Notify user
    const { data: { user } } = await supabase.auth.getUser();
    if (user && userId !== user.id) {
      createNotification(supabase, {
        userId,
        actorId: user.id,
        type: "like", // reuse type — the notification text will be contextual
      });
    }
  };

  const addNote = async (orderId: string) => {
    const note = prompt("Add admin note:");
    if (!note) return;

    await supabase.from("print_orders").update({ admin_notes: note }).eq("id", orderId);
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, admin_notes: note } : o));
    showToast("Note added", "success");
  };

  const statuses = ["all", "pending", "approved", "printing", "shipped", "delivered", "cancelled"];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-primary-900 dark:text-dark-100 mb-6">
        Print Orders
      </h1>

      {/* Filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-3 mb-6">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === s
                ? "bg-primary-800 dark:bg-primary-600 text-white"
                : "bg-warm-100 dark:bg-dark-700 text-primary-600 dark:text-dark-300 hover:bg-warm-200 dark:hover:bg-dark-600"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-sm text-primary-400 dark:text-dark-400 text-center py-12">
          No orders matching this filter.
        </p>
      )}

      {!loading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card !p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-sm text-primary-800 dark:text-dark-100">
                    {productLabels[order.product_type]} — {order.collections?.name || "—"}
                  </p>
                  <p className="text-xs text-primary-400 dark:text-dark-400 mt-0.5">
                    By {order.profiles?.full_name || order.profiles?.username} · {formatDistanceToNow(order.created_at)}
                  </p>
                  <p className="text-xs text-primary-500 dark:text-dark-400 mt-1">
                    {order.name} · {order.city}, {order.state} · {order.phone}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                  order.status === "delivered" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                  order.status === "cancelled" ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" :
                  "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                }`}>
                  {order.status}
                </span>
              </div>

              <OrderTimeline currentStatus={order.status} />

              {order.admin_notes && (
                <p className="text-xs text-primary-400 dark:text-dark-500 italic mt-3">Note: {order.admin_notes}</p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-warm-100 dark:border-dark-700">
                {order.status === "pending" && (
                  <>
                    <button onClick={() => updateStatus(order.id, order.user_id, "approved")} className="text-xs px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 transition-colors">✓ Approve</button>
                    <button onClick={() => updateStatus(order.id, order.user_id, "cancelled")} className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition-colors">✗ Cancel</button>
                  </>
                )}
                {order.status === "approved" && (
                  <button onClick={() => updateStatus(order.id, order.user_id, "printing")} className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-colors">🖨️ Printing</button>
                )}
                {order.status === "printing" && (
                  <button onClick={() => updateStatus(order.id, order.user_id, "shipped")} className="text-xs px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors">📦 Shipped</button>
                )}
                {order.status === "shipped" && (
                  <button onClick={() => updateStatus(order.id, order.user_id, "delivered")} className="text-xs px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 transition-colors">✅ Delivered</button>
                )}
                <button onClick={() => addNote(order.id)} className="text-xs px-3 py-1.5 rounded-lg bg-warm-100 dark:bg-dark-700 text-primary-600 dark:text-dark-300 hover:bg-warm-200 dark:hover:bg-dark-600 transition-colors ml-auto">📝 Note</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
