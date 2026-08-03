/// <reference types="next" />
/// <reference types="next/image-types/global" />

// Cloudflare Pages environment
interface CloudflareEnv {
  USTOZPRO_DATABASE_URL: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  ADMIN_PASSWORD: string
  TIDB_CA_CERT?: string
}

declare global {
  interface Window {
    __cloudflare_env?: CloudflareEnv
  }
}

export {}
