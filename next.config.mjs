/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dclaevazetcjjkrzczpc.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/cabin-images/**",
      },
      { // Add new pattern for Deezer CDN
        protocol: "https",
        hostname: "cdn-images.dzcdn.net",
        port: "",
        pathname: "/images/cover/**", // Adjust pathname if needed, this allows any cover image
      },
    ],
  },
  // output: "export",
};

export default nextConfig;
