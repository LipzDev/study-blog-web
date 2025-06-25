import React from "react";
import { RegisterForm } from "@/components/molecules/RegisterForm";
import { PageHead } from "@/components/atoms/PageHead";

export default function RegisterPage() {
  return (
    <>
      <PageHead
        title="StudyBlog - Cadastro | Seu Blog de Estudos"
        description="Crie sua conta no StudyBlog e comece a compartilhar conhecimento com a comunidade de estudantes."
      />
      <RegisterForm />
    </>
  );
}
