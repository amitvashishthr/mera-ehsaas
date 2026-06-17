import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: category } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!category) {
    return { title: "Category Not Found — MeraEhsaas" };
  }

  const description = category.description || `Explore ${category.name} poetry and stories on MeraEhsaas`;

  return {
    title: `${category.name} — MeraEhsaas`,
    description,
    openGraph: {
      title: `${category.name} — MeraEhsaas`,
      description,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `${category.name} — MeraEhsaas`,
      description,
    },
  };
}

export default function CategoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
