const next = require('next')
const express = require('express')
const {join} = require('path')
const {parse} = require('url')

const dev = process.env.NODE_ENV !== 'production'
// process.env.PORT lets the port be set by Heroku
const port = process.env.PORT || 3000
const forceHttps = process.env.FORCE_HTTPS

const app = next({dev})
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = express()

  // Note1: not using default next.js "/static" folder, as in built time both bundled and static
  // resources would have /static prefix and we need to distinguish them when creating precache
  // manifest as the path of "bundles" need to be changed from "static" to "_next/static"
  // Note2: there is no http caching set on "assets" folder but we do not need
  // it as we cache all its content in service worker cache
  server.use(express.static('assets'))

  // To get https:// from req.protocol when running on heroku
  server.enable('trust proxy')

  // https://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
  server.use ((req, res, next) => {
    if (req.secure || !forceHttps) {
      next()
    } else {
      res.redirect(301, `https://${req.headers.host}${req.url}`)
    }
  })

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const {pathname} = parsedUrl

    // service worker is not stored in "assets" folder as we do not want to cache it
    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname)
      return app.serveStatic(req, res, filePath)
    } else {
      return handle(req, res, parsedUrl)
    }
  })

  server.listen(port, () => {
    console.log(`> Ready on localhost:${port}`) // eslint-disable-line
  })
})
