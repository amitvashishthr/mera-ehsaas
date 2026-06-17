"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PrintRequestPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [postId, setPostId] = useState("");
  const [notes, setNotes] = useState("");
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [postsRes, reqRes] = await Promise.all([
      supabase.from("posts").select("id, content").eq("author_id", user.id).order("created_at", { ascending: false }),
      supabase.from("print_requests").select("*, posts:post_id(content)").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    setUserPosts(postsRes.data || []);
    setRequests(reqRes.data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId) return;
    setLoading(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("print_requests").insert({
      user_id: user.id,
      post_id: postId,
      notes: notes.trim() || null,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Print request submitted!");
      setPostId("");
      setNotes("");
      fetchData();
    }
    setLoading(false);
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    printed: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Print Request</h1>

      <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
        <p className="text-gray-600 text-sm">
          Want your post printed as a poster, card, or frame? Submit a request below!
        </p>
        <div>
          <label htmlFor="post" className="block text-sm font-medium text-gray-700 mb-1">
            Select Post
          </label>
          <select
            id="post"
            value={postId}
            onChange={(e) => setPostId(e.target.value)}
            className="input-field"
            required
          >
            <option value="">Choose a post...</option>
            {userPosts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.content.substring(0, 60)}...
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input-field"
            placeholder="Size preference, delivery details, etc."
          />
        </div>
        {message && (
          <p className={`text-sm ${message.includes("submitted") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      </form>

      {/* Existing requests */}
      <h2 className="text-lg font-semibold mb-4">My Requests</h2>
      <div className="space-y-3">
        {requests.map((req) => (
          <div key={req.id} className="card">
            <div className="flex justify-between items-start">
              <p className="text-sm text-gray-700">
                {req.posts?.content?.substring(0, 80)}...
              </p>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[req.status]}`}>
                {req.status}
              </span>
            </div>
            {req.notes && <p className="text-xs text-gray-500 mt-2">Note: {req.notes}</p>}
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-gray-500 text-center py-4">No print requests yet.</p>
        )}
      </div>
    </div>
  );
}
