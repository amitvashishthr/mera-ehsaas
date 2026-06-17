"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  post_id: string | null;
  type: "like" | "comment" | "follow";
  is_read: boolean;
  created_at: string;
  actor: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchNotifications();
    // Mark all as read after viewing
    return () => { markAllRead(); };
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select(`
        *,
        actor:actor_id(id, username, full_name, avatar_url)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setNotifications((data as any) || []);
    setLoading(false);
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  const handleDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const getActionText = (type: string) => {
    switch (type) {
      case "like": return "liked your post";
      case "comment": return "commented on your post";
      case "follow": return "started following you";
      default: return "interacted with you";
    }
  };

  const getLink = (n: Notification) => {
    if (n.type === "follow") return `/user/${n.actor.username}`;
    if (n.post_id) return `/posts/${n.post_id}`;
    return "#";
  };

  return (
    <div className="max-w-feed mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-primary-900">
            Notifications
          </h1>
          <p className="text-sm text-primary-400 mt-1">
            Stay updated on likes, comments, and follows
          </p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={markAllRead} className="btn-ghost text-xs text-primary-500">
            Mark all read
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-warm-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-warm-200 rounded w-48" />
                <div className="h-3 bg-warm-100 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="text-center py-20">
          <svg className="w-14 h-14 mx-auto text-primary-200 mb-4" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </svg>
          <p className="font-serif text-xl text-primary-400 italic mb-2">
            All quiet here
          </p>
          <p className="text-sm text-primary-300">
            When someone likes, comments, or follows you, it&apos;ll show up here.
          </p>
        </div>
      )}

      {/* Notification list */}
      {!loading && notifications.length > 0 && (
        <div className="card !p-2">
          <div className="divide-y divide-warm-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl group transition-colors ${
                  n.is_read ? "" : "bg-accent-50/40"
                }`}
              >
                {/* Type icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm ${
                  n.type === "like" ? "bg-rose-100 text-rose-500" :
                  n.type === "comment" ? "bg-blue-100 text-blue-500" :
                  "bg-green-100 text-green-600"
                }`}>
                  {n.type === "like" && "❤️"}
                  {n.type === "comment" && "💬"}
                  {n.type === "follow" && "👤"}
                </div>

                {/* Actor avatar */}
                <Link href={`/user/${n.actor?.username}`} className="shrink-0">
                  {n.actor?.avatar_url ? (
                    <img
                      src={n.actor.avatar_url}
                      alt={n.actor.username}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-warm-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-warm-300 flex items-center justify-center text-primary-700 font-serif font-semibold text-sm ring-1 ring-warm-100">
                      {n.actor?.full_name?.[0] || n.actor?.username?.[0] || "U"}
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link href={getLink(n)} className="block">
                    <p className="text-sm text-primary-700">
                      <span className="font-semibold text-primary-900">
                        {n.actor?.full_name || n.actor?.username}
                      </span>
                      {" "}{getActionText(n.type)}
                    </p>
                    <p className="text-xs text-primary-400 mt-0.5">
                      {formatDistanceToNow(n.created_at)}
                    </p>
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="p-1.5 rounded-lg hover:bg-warm-100 text-primary-400 hover:text-primary-600 transition-colors"
                      title="Mark as read"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 rounded-lg hover:bg-warm-100 text-primary-400 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
