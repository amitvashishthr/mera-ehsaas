"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { formatDistanceToNow } from "@/lib/utils";

interface UserRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, role, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (debouncedSearch.trim()) {
      query = query.or(`username.ilike.%${debouncedSearch.trim()}%,full_name.ilike.%${debouncedSearch.trim()}%`);
    }

    const { data } = await query;
    setUsers(data || []);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    const action = newRole === "admin" ? "promote to admin" : newRole === "banned" ? "ban" : "restore";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  const roleStyles: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    user: "bg-warm-100 text-primary-600",
    banned: "bg-rose-100 text-rose-700",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <h1 className="font-serif text-2xl font-semibold text-primary-900">Users</h1>
        <p className="text-sm text-primary-400">{users.length} users</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10 text-sm"
          placeholder="Search by name or username..."
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-warm-100 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* User list */}
      {!loading && (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="card !p-4 flex items-center gap-4">
              {/* Avatar */}
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-warm-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-warm-300 flex items-center justify-center text-sm font-serif font-semibold text-primary-700">
                  {user.full_name?.[0] || user.username[0]}
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-primary-800 truncate">
                  {user.full_name || user.username}
                </p>
                <p className="text-xs text-primary-400">@{user.username} · Joined {formatDistanceToNow(user.created_at)}</p>
              </div>

              {/* Role badge */}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${roleStyles[user.role] || roleStyles.user}`}>
                {user.role}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {user.role !== "admin" && (
                  <button
                    onClick={() => updateRole(user.id, "admin")}
                    className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-purple-50 text-purple-600 transition-colors"
                    title="Make Admin"
                  >
                    👑
                  </button>
                )}
                {user.role === "admin" && (
                  <button
                    onClick={() => updateRole(user.id, "user")}
                    className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-warm-100 text-primary-500 transition-colors"
                    title="Remove Admin"
                  >
                    ↓
                  </button>
                )}
                {user.role !== "banned" && (
                  <button
                    onClick={() => updateRole(user.id, "banned")}
                    className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-colors"
                    title="Ban User"
                  >
                    🚫
                  </button>
                )}
                {user.role === "banned" && (
                  <button
                    onClick={() => updateRole(user.id, "user")}
                    className="text-xs px-2.5 py-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                    title="Unban User"
                  >
                    ✅
                  </button>
                )}
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-primary-400 text-center py-8">No users found.</p>
          )}
        </div>
      )}
    </div>
  );
}
