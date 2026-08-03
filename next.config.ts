import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for @opennextjs/cloudflare to build a Workers bundle
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  bundlePagesRouterDependences: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Cloudflare Workers doesn't support Node.js fs in the same way,
  // but nodejs_compat flag handles it. We must avoid native addons.
  serverExternalPackages: [],
};

export default nextConfig;
