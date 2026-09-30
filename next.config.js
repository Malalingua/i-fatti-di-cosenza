/** @type {import('next').NextConfig} */
const nextConfig = {
  // Old category addresses keep working after a slug change.
  async redirects() {
    return [{ source: '/intervista-sincera', destination: '/nessuno-l-ha-mai-chiesto', permanent: true }]
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
}

module.exports = nextConfig
