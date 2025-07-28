import React from "react";
import { CreatePostPage } from "@/components/organisms/CreatePostPage";
import { PageHead } from "@/components/atoms/PageHead";

export default function CreatePostPageWrapper() {
  return (
    <>
      <PageHead
        title="StudyBlog - Criar Postagem | Seu Blog de Estudos"
        description="Crie uma nova postagem no StudyBlog e compartilhe seu conhecimento com a comunidade de estudantes."
      />
      <CreatePostPage />
    </>
  );
}
