import { Html, Head, Main, NextScript } from 'next/document';
import { JSX } from 'react';

const Document = (): JSX.Element => {
  return (
    <Html lang="en">
      <Head />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
