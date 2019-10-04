import React from 'react'
import Document, {Html, Head, Main, NextScript, DocumentContext} from 'next/document'

// Note: this is run only on server side
class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return {...initialProps}
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <title>Bitcoin live</title>

          <link rel="manifest" href="/manifest.json" />
          <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
          <meta name="theme-color" content="#F7AE29" />

          {/* Add iOS meta tags and icons as Safari on iOS does not support manifest yet */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="apple-mobile-web-app-title" content="Bitcoin live" />
          <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />

          {/* Add description here for SEO */}
          <meta name="description" content="A sample live bitcoin app" />

          <link rel="preconnect" href="https://api.coindesk.com" />
        </Head>
        <body>
          <noscript>You need to enable JavaScript to run this app.</noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
