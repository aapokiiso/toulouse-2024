/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.NEXT_BUNDLE_ANALYZER_ENABLED === '1',
})

const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ['tsx', 'ts'],
  images: {
    unoptimized: true, // Required for static site generation
  },
  serverRuntimeConfig: {
    publicDir: `${__dirname}/public`,
  },
  staticPageGenerationTimeout: 1800, // 30min
}

module.exports = withBundleAnalyzer(nextConfig)
