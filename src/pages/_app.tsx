import type { AppProps } from "next/app";
import Head from "next/head";
import { AuthProvider } from "@/hooks/useAuth";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>StudyBlog - Seu Blog de Estudos</title>
        <meta
          name="description"
          content="Blog dedicado ao compartilhamento de conhecimento e experiências de estudo"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  );
}
