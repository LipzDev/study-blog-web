import React from "react";
import { VerifyEmailForm } from "@/components/molecules/VerifyEmailForm";
import { PageHead } from "@/components/atoms/PageHead";

export default function VerifyEmailPage() {
  return (
    <>
      <PageHead
        title="StudyBlog - Verificar Email | Seu Blog de Estudos"
        description="Verifique seu email para ativar sua conta no StudyBlog e começar a compartilhar conhecimento."
      />
      <VerifyEmailForm />
    </>
  );
}
