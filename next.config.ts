import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/start", // Path to your specific landing page folder
        permanent: true,       // Tells browsers to cache this redirect
      },
    ];
  },
};

export default nextConfig;
