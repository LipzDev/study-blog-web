import React, { useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/templates/Layout";
import { Button } from "@/components/atoms/Button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import { AxiosError } from "axios";
import { PostForm } from "@/components/molecules/PostForm";
import { CreatePostFormData } from "@/utils/schemas";

export function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar se o usuário tem permissão para criar posts
  const canCreatePost = !!user;

  const handleCreate = async (
    data: CreatePostFormData,
    imageFile?: File | null,
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      let image = "";
      // Upload da imagem se houver
      if (imageFile) {
        try {
          const uploadResponse = await apiService.uploadImage(imageFile);
          image = uploadResponse.url;
        } catch (uploadError) {
          setError("Erro ao fazer upload da imagem. Tente novamente.");
          return;
        }
      }
      // Criar o post
      const postData = {
        ...data,
        image: image || undefined,
      };
      const newPost = await apiService.createPost(postData);
      router.push(`/posts/${newPost.slug}`);
    } catch (err: unknown) {
      let errorMessage = "Erro ao criar postagem";
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as AxiosError;
        if (axiosError.response && (axiosError.response.data as any)?.message) {
          errorMessage = (axiosError.response.data as any).message;
        } else if (axiosError.response && axiosError.response.status === 409) {
          errorMessage =
            "Já existe uma postagem com este slug. Tente alterar o título ou slug.";
        } else if (axiosError.response && axiosError.response.status === 401) {
          errorMessage = "Você não tem permissão para criar postagens";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!canCreatePost) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h1>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para criar postagens.
            </p>
            <Link href="/posts">
              <Button variant="primary">Voltar para postagens</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/posts">
            <Button variant="outline" size="sm">
              Voltar para postagens
            </Button>
          </Link>
        </div>
        <PostForm
          mode="create"
          onSubmit={handleCreate}
          loading={isLoading}
          error={error}
        />
      </div>
    </Layout>
  );
}
