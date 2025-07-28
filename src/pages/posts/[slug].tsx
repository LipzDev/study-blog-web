import React from "react";
import { PostDetail } from "@/components/organisms/PostDetail";
import { PageHead } from "@/components/atoms/PageHead";

export default function PostPage() {
  return (
    <>
      <PageHead
        title="StudyBlog - Postagem | Seu Blog de Estudos"
        description="Leia postagens da nossa comunidade de estudantes e compartilhe conhecimento."
      />
      <PostDetail />
    </>
  );
}
