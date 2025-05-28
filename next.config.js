const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Set environment variable to prevent coverage version loading
    config.plugins.push(
      new config.webpack.DefinePlugin({
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
  // Enable experimental features needed for WhatsApp Web.js
  experimental: {
    serverComponentsExternalPackages: ['whatsapp-web.js', 'fluent-ffmpeg', '@ffmpeg-installer/ffmpeg']
  }
}

module.exports = nextConfig 