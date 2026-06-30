"use client";

export default function LicensesPage() {
  return (
    <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-6">Open Source Licenses</h1>
      <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400">
        <p>MeraEhsaas is built with the following open-source technologies:</p>
        {[
          { name: "Next.js", license: "MIT", url: "https://nextjs.org" },
          { name: "React", license: "MIT", url: "https://react.dev" },
          { name: "Tailwind CSS", license: "MIT", url: "https://tailwindcss.com" },
          { name: "Supabase", license: "Apache 2.0", url: "https://supabase.com" },
          { name: "Capacitor", license: "MIT", url: "https://capacitorjs.com" },
          { name: "TypeScript", license: "Apache 2.0", url: "https://typescriptlang.org" },
          { name: "Playfair Display Font", license: "OFL", url: "https://fonts.google.com/specimen/Playfair+Display" },
          { name: "Inter Font", license: "OFL", url: "https://fonts.google.com/specimen/Inter" },
        ].map((lib) => (
          <div key={lib.name} className="flex items-center justify-between py-3 border-b border-neutral-100 dark:border-neutral-800">
            <div>
              <p className="font-medium text-neutral-800 dark:text-neutral-200">{lib.name}</p>
              <p className="text-xs text-neutral-400">{lib.license}</p>
            </div>
            <a href={lib.url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
              View
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
