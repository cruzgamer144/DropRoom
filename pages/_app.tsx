import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';
import { SupabaseProvider } from '../lib/supabase-context';

export default function DropRoomApp({ Component, pageProps }: AppProps) {
  return (
    <SupabaseProvider>
      <Head>
        <title>DropRoom</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '16px', background: '#111', color: '#fff' } }} />
    </SupabaseProvider>
  );
}
