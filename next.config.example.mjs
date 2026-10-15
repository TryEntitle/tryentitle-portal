// Merge this into your existing next.config (don't replace other settings).
// basePath serves the whole app under tryentitle.tech/demo
// (/demo/login, /demo/admin, /demo/dashboard).
// To move it to the site root later, delete basePath and rebuild.
/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/demo',
}

export default nextConfig
