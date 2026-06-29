import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback handler for all Supabase auth flows:
 * - Google OAuth (PKCE code exchange)
 * - Email Magic Link (PKCE code exchange)
 * - Email verification (PKCE code or token_hash)
 * - Password reset (PKCE code → redirect to /reset-password)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "recovery"
    | "invite"
    | "email"
    | "magiclink"
    | null;
  const next = searchParams.get("next") ?? "/";

  const supabase = await createServerSupabaseClient();

  // PKCE flow: exchange authorization code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Password recovery → redirect to reset page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Token hash flow (older email verification format)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth failed — redirect with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
