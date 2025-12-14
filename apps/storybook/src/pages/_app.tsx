import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { JSX } from 'react';

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  return <Component {...pageProps} />;
};

export default App;
