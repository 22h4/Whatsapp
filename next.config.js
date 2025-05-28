const path = require('path')
const webpack = require('webpack')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Set environment variable to prevent coverage version loading
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.FLUENTFFMPEG_COV': JSON.stringify(false)
      })
    )

    // Handle node modules that need to be processed by webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      crypto: false
    }

    // Add specific alias for fluent-ffmpeg
    config.resolve.alias = {
      ...config.resolve.alias,
      'fluent-ffmpeg': path.resolve(__dirname, 'node_modules/fluent-ffmpeg/lib/fluent-ffmpeg')
    }

    return config
  },
  // Optimize for Vercel deployment
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  // External packages that should be treated as server components
  serverExternalPackages: ['whatsapp-web.js', 'fluent-ffmpeg', '@ffmpeg-installer/ffmpeg']
}

module.exports = nextConfig 