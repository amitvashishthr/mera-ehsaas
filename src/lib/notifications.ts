import type { SupabaseClient } from "@supabase/supabase-js";

export async function createNotification(
  supabase: SupabaseClient,
  {
    userId,
    actorId,
    postId,
    type,
  }: {
    userId: string;
    actorId: string;
    postId?: string | null;
    type: "like" | "comment" | "follow";
  }
) {
  // Don't notify yourself
  if (userId === actorId) return;

  await supabase.from("notifications").insert({
    user_id: userId,
    actor_id: actorId,
    post_id: postId || null,
    type,
  });
}
