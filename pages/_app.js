import React from 'react'
import App from 'next/app'
import NoSSR from 'react-no-ssr'

import {ServiceWorkerProvider} from '../helpers/serviceWorker'

const NoSSRWrapper = ({children, queryStringObj}) => {
  return queryStringObj.app_shell === 'true' ? (
    <NoSSR>{children}</NoSSR>
  ) : (
    children
  )
}

// TODO: just demo handle better way
// For example store "updateAvailable" flag in global state, so user can update any time
const promptUserToRefresh = (reg) => {
  const res = confirm('New version of app is available, update now?') // eslint-disable-line
  if (res === true) {
    reg.waiting.postMessage('SKIP_WAITING')
  }
}

class MyApp extends App {
  static async getInitialProps(appContext) {
    const appProps = await App.getInitialProps(appContext)

    const {ctx} = appContext
    const query = ctx.req ? ctx.req.query : {} // Nore: ignored for browser evaluation
    return {...appProps, query}
  }

  render() {
    const {Component, pageProps, query} = this.props
    return (
      <ServiceWorkerProvider fileName="/service-worker.js" onUpdateAvailable={promptUserToRefresh}>
        <NoSSRWrapper queryStringObj={query}>
          <Component {...pageProps} />
        </NoSSRWrapper>
      </ServiceWorkerProvider>
    )
  }
}

export default MyApp
