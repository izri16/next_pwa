import React, {ReactNode} from 'react'
import NextApp from 'next/app'
import NoSSR from 'react-no-ssr'

import {ServiceWorkerProvider} from '../helpers/serviceWorker'

type NoSSRWrapperProps = {
  children: ReactNode,
  queryStringObj: {app_shell?: string}
}

const NoSSRWrapper = ({children, queryStringObj}: NoSSRWrapperProps) => {
  return queryStringObj.app_shell === 'true' ? (
    <NoSSR>{children}</NoSSR>
  ) : (
    <React.Fragment>
      {/* Note typescript has issues when returning just "children" */}
      {children}
    </React.Fragment>
  )
}

// TODO: just demo handle better way
// For example store "updateAvailable" flag in global state, so user can update any time
const promptUserToRefresh = (reg: ServiceWorkerRegistration) => {
  const res = confirm('New version of app is available, update now?') // eslint-disable-line
  if (res === true) {
    if (!reg.waiting) return
    reg.waiting.postMessage('SKIP_WAITING')
  }
}

type Props = {
  query: {}
}

class MyApp extends NextApp<Props> {

  static async getInitialProps(appContext: any) {
    const appProps = await NextApp.getInitialProps(appContext)

    const {ctx} = appContext
    const query = ctx.req ? ctx.req.query : {} // Nore: ignored for browser evaluation
    return {...appProps, query}
  }

  render() {
    const {Component, pageProps, query} = this.props
    return  (
      <ServiceWorkerProvider fileName="/service-worker.js" onUpdateAvailable={promptUserToRefresh}>
        <NoSSRWrapper queryStringObj={query}>
          <Component {...pageProps} />
        </NoSSRWrapper>
      </ServiceWorkerProvider>
    )
  }
}

export default MyApp
