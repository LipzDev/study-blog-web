import React from "react";
import { LoginForm } from "@/components/molecules/LoginForm";
import { PageHead } from "@/components/atoms/PageHead";

export default function LoginPage() {
  return (
    <>
      <PageHead
        title="StudyBlog - Login | Seu Blog de Estudos"
        description="Faça login no StudyBlog para acessar sua conta e compartilhar conhecimento com a comunidade."
      />
      <LoginForm />
    </>
  );
}
