"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function AdminPrintRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("print_requests")
      .select(`
        *,
        profiles:user_id(username, full_name),
        posts:post_id(content, image_url)
      `)
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("print_requests").update({ status }).eq("id", id);
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    showToast(`Request ${status}`, "success");
  };

  const statusStyles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-rose-100 text-rose-800",
    printed: "bg-blue-100 text-blue-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-semibold text-primary-900">Print Requests</h1>
        <p className="text-sm text-primary-400">{requests.length} requests</p>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-warm-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="card !p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <p className="font-medium text-sm text-primary-800">
                    {req.profiles?.full_name || req.profiles?.username}
                  </p>
                  <p className="text-xs text-primary-400 mt-0.5">
                    {formatDistanceToNow(req.created_at)}
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusStyles[req.status]}`}>
                  {req.status}
                </span>
              </div>

              <p className="text-sm text-primary-700 bg-warm-50 rounded-lg px-3 py-2 mb-2 line-clamp-2 border border-warm-100">
                {req.posts?.content?.substring(0, 120)}
              </p>

              {req.notes && (
                <p className="text-xs text-primary-400 italic mb-3">Note: {req.notes}</p>
              )}

              <div className="flex gap-2 pt-2 border-t border-warm-100">
                <button
                  onClick={() => updateStatus(req.id, "approved")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => updateStatus(req.id, "rejected")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => updateStatus(req.id, "printed")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                >
                  🖨️ Printed
                </button>
              </div>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-sm text-primary-400 text-center py-8">No print requests.</p>
          )}
        </div>
      )}
    </div>
  );
}
