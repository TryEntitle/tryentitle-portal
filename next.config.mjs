import { withSentryConfig } from '@sentry/nextjs/config'

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/demo/login', destination: '/login', permanent: true },
      { source: '/demo/:path*', destination: '/:path*', permanent: true },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
})
