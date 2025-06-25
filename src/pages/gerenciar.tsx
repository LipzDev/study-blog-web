import React from "react";
import { Layout } from "@/components/templates/Layout";
import { ProtectedRoute } from "@/components/atoms/ProtectedRoute";
import { PageHead } from "@/components/atoms/PageHead";
import { UserManagement } from "@/components/organisms/UserManagement";

export default function GerenciarPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <PageHead
          title="StudyBlog - Gerenciar | Seu Blog de Estudos"
          description="Painel de gerenciamento de usuários do StudyBlog."
        />
        <UserManagement />
      </Layout>
    </ProtectedRoute>
  );
}
