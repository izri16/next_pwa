const Dotenv = require('dotenv-webpack')
const path = require('path')

const {withPlugins} = require('next-compose-plugins')
const withCSS = require('@zeit/next-css')
const withOffline = require('next-offline')
const withTypescript = require('@zeit/next-typescript')

const config = {
  webpack: (config) => {
    config.plugins = config.plugins || []

    config.plugins = [
      ...config.plugins,

      new Dotenv({
        path: path.join(__dirname, '.env'),
        systemvars: true,
      }),
    ]

    return config
  },
  // next-offline options
  generateSw: false,
  dontAutoRegisterSw: true,
  transformManifest: (manifest) => {
    const bundled = manifest.map((item) => {
      return item.url.match(/^\/_next\/assets/)
        ? {
          ...item,
          url: item.url.replace(/^\/_next\/assets/, ''),
        }
        : item.url
    })
    return bundled
  },
  workboxOpts: {
    // Will precache all static assets
    globPatterns: ['assets/**/*'],
    globDirectory: '.',
    swSrc: './service-worker.js',
  },
}

module.exports = withPlugins(
  [
    withTypescript,
    withCSS(
      {
        cssModules: true,
        cssLoaderOptions: {
          importLoaders: 1,
          localIdentName: '[local]___[hash:base64:5]',
        },
      },
    ),
    // Note: this should be last
    withOffline,
  ],
  config
)
