/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
        bodySizeLimit: '2mb',
    },
    staleTimes: {
      dynamic: 30,
      static: 300,
    },
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toast",
      "@radix-ui/react-toggle",
      "@radix-ui/react-tooltip",
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), accelerometer=(), autoplay=(), clipboard-write=(), display-capture=(), document-domain=(), encrypted-media=(), fullscreen=(), gyroscope=(), magnetometer=(), payment=(), screen-wake-lock=(), usb=(), xr-spatial-tracking=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co https://*.upstash.io; frame-ancestors 'none'; form-action 'self'; base-uri 'self'",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
