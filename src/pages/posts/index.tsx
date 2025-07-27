import React from "react";
import { PostsList } from "@/components/organisms/PostsList";
import { PageHead } from "@/components/atoms/PageHead";

export default function PostsPage() {
  return (
    <>
      <PageHead
        title="StudyBlog - Postagens | Seu Blog de Estudos"
        description="Explore as postagens da nossa comunidade de estudantes. Compartilhe conhecimento e aprenda com outros estudantes."
      />
      <PostsList />
    </>
  );
}
