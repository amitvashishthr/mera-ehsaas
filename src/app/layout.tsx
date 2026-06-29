import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ToastProvider } from "@/components/ui/Toast";
import { ThemeProvider } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: "MeraEhsaas — Poetry & Emotions",
  description: "A quiet space to share poetry, shayari, stories, and heartfelt thoughts.",
  openGraph: {
    title: "MeraEhsaas",
    description: "A quiet space for poetry & emotions",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('meraehsaas-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <ToastProvider>
            <div className="flex min-h-screen">
              {/* Desktop sidebar */}
              <Sidebar />
              {/* Main area */}
              <div className="flex-1 flex flex-col min-w-0">
                <Navbar />
                <main className="flex-1 pb-20 md:pb-8">
                  {children}
                </main>
              </div>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
