import React from "react";
import { UserProfile } from "@/components/organisms/UserProfile";
import { PageHead } from "@/components/atoms/PageHead";

export default function PerfilPage() {
  return (
    <>
      <PageHead
        title="StudyBlog - Meu Perfil | Seu Blog de Estudos"
        description="Gerencie suas informações pessoais, foto de perfil e redes sociais no StudyBlog."
      />
      <UserProfile />
    </>
  );
}
