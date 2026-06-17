import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, username, bio")
    .eq("username", username)
    .single();

  if (!profile) {
    return { title: "User Not Found — MeraEhsaas" };
  }

  const name = profile.full_name || profile.username;
  const description = profile.bio || `Read poetry and stories by ${name} on MeraEhsaas`;

  return {
    title: `${name} (@${profile.username}) — MeraEhsaas`,
    description,
    openGraph: {
      title: `${name} on MeraEhsaas`,
      description,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${name} on MeraEhsaas`,
      description,
    },
  };
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
