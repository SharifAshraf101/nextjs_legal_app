/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so Netlify / Vercel serve the app as plain HTML+JS,
  // matching how the original single-file HTML app was deployed.
  output: 'export',

  // No image optimization service on a static host.
  images: { unoptimized: true },

  // Trailing slash mirrors static-site routing conventions used by Netlify.
  trailingSlash: true,

  reactStrictMode: true,
};

module.exports = nextConfig;
