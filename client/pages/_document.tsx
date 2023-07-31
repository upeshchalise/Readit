import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/reddit.svg" />
        <meta property="og:site_name" content="readit" />
        {/* <meta property="twitter:site_name" content="@readit" /> */}
        <meta property="twitter:card" content="summary" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/reddit.svg`}
        />
        <meta
          property="twitter:image"
          content={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/reddit.svg`}
        />

        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </Head>
      <body style={{ backgroundColor: "#DAE0E6" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
