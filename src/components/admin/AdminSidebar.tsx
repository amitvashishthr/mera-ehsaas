"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/posts", label: "Posts", icon: "📝" },
  { href: "/admin/comments", label: "Comments", icon: "💬" },
  { href: "/admin/categories", label: "Categories", icon: "📂" },
  { href: "/admin/print-requests", label: "Print Requests", icon: "🖨️" },
  { href: "/admin/print-orders", label: "Print Orders", icon: "📦" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="md:w-48 shrink-0">
      <div className="md:sticky md:top-24">
        <p className="text-xs font-semibold text-primary-400 uppercase tracking-wider mb-3 hidden md:block">
          Admin Panel
        </p>
        <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary-800 text-white font-semibold"
                    : "text-primary-600 hover:bg-warm-100 hover:text-primary-800"
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
