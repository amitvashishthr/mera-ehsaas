"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const supabase = useMemo(() => createClient(), []);
  const { showToast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmText !== "DELETE" || deleting) return;
    setDeleting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setDeleting(false); return; }

    // Delete user data (cascade will handle related records)
    await supabase.from("profiles").delete().eq("id", user.id);

    // Sign out
    await supabase.auth.signOut();
    showToast("Account deleted. We're sorry to see you go.", "info");
    router.push("/login");
  };

  return (
    <div className="max-w-[480px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-2">Delete Account</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
        This action is permanent and cannot be undone.
      </p>

      <div className="card border-red-200 dark:border-red-900/50 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Warning</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1 leading-relaxed">
              Deleting your account will permanently remove all your posts, comments, collections, followers, and order history. This cannot be recovered.
            </p>
          </div>
        </div>

        <div>
          <label className="input-label">Type DELETE to confirm</label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="input"
            placeholder="DELETE"
            autoComplete="off"
          />
        </div>

        <button
          onClick={handleDelete}
          disabled={confirmText !== "DELETE" || deleting}
          className="w-full py-2.5 px-4 rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {deleting ? "Deleting..." : "Permanently Delete My Account"}
        </button>
      </div>
    </div>
  );
}
