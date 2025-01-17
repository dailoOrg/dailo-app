/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add Eruda for development only
  scripts: process.env.NODE_ENV === 'development' ? [
    {
      src: 'https://cdn.jsdelivr.net/npm/eruda',
      onload: 'eruda.init()'
    }
  ] : []
};

export default nextConfig;
