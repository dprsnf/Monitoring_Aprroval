import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moved from experimental in Next.js 16
  serverExternalPackages: [],
  async headers() {
    return [
      {
        // Force correct MIME for pdf.js worker aliases
        source: "/:path*(pdf.worker.mjs|js/pdf.worker.min.mjs|pdf.worker.min.mjs)",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/pdf.worker.mjs",
          destination: "/js/pdf.worker.min.mjs",
        },
        {
          source: "/pdf.worker.min.mjs",
          destination: "/js/pdf.worker.min.mjs",
        },
        {
          source: "/:path*/pdf.worker.mjs",
          destination: "/js/pdf.worker.min.mjs",
        },
        {
          source: "/:path*/pdf.worker.min.mjs",
          destination: "/js/pdf.worker.min.mjs",
        },
      ],
    };
  },
};

export default nextConfig;
