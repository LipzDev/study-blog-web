import Head from "next/head";

interface PageHeadProps {
  title?: string;
  description?: string;
}

export function PageHead({
  title = "StudyBlog - Seu Blog de Estudos",
  description = "Blog dedicado ao compartilhamento de conhecimento e experiências de estudo",
}: PageHeadProps) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
}
