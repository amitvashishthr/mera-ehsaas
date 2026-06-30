import type { NextConfig } from "next";

/**
 * Next.js config for Capacitor mobile builds (static export).
 * Used only by `npm run build:mobile`.
 * The main web deployment uses next.config.ts (SSR).
 */
const mobileConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
};

export default mobileConfig;
