import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  const [usersRes, postsRes, commentsRes, likesRes, printsRes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("likes").select("*", { count: "exact", head: true }),
    supabase.from("print_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Total Users", value: usersRes.count || 0, icon: "👥", color: "bg-blue-50 text-blue-700" },
    { label: "Total Posts", value: postsRes.count || 0, icon: "📝", color: "bg-green-50 text-green-700" },
    { label: "Total Comments", value: commentsRes.count || 0, icon: "💬", color: "bg-purple-50 text-purple-700" },
    { label: "Total Likes", value: likesRes.count || 0, icon: "❤️", color: "bg-rose-50 text-rose-700" },
    { label: "Pending Prints", value: printsRes.count || 0, icon: "🖨️", color: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-primary-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-5 ${stat.color} border border-current/10`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <p className="text-xs font-medium opacity-80">{stat.label}</p>
            </div>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-primary-800 mb-3">Quick Actions</h2>
        <p className="text-sm text-primary-500">
          Use the sidebar to manage users, posts, comments, categories, and print requests.
        </p>
      </div>
    </div>
  );
}
