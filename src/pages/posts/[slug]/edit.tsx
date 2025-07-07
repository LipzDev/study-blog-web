import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/templates/Layout";
import { Button } from "@/components/atoms/Button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import { AxiosError } from "axios";
import { PostForm } from "@/components/molecules/PostForm";
import { CreatePostFormData } from "@/utils/schemas";
import { Post } from "@/types";

const EditPostPage = () => {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && typeof slug === "string") {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const postData = await apiService.getPostBySlug(postSlug);
      setPost(postData);
    } catch (err) {
      setError("Postagem não encontrada ou você não tem permissão.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (
    data: CreatePostFormData,
    imageFile?: File | null,
  ) => {
    if (!post) return;
    try {
      setSubmitLoading(true);
      setSubmitError(null);
      let image = post.image || "";
      // Upload da imagem se houver nova
      if (imageFile) {
        try {
          const uploadResponse = await apiService.uploadImage(imageFile);
          image = uploadResponse.url;
        } catch (uploadError) {
          setSubmitError("Erro ao fazer upload da imagem. Tente novamente.");
          return;
        }
      }
      const updateData = {
        ...data,
        image: image || undefined,
      };
      await apiService.updatePost(post.id, updateData);
      router.push(`/posts/${post.slug}`);
    } catch (err: unknown) {
      let errorMessage = "Erro ao atualizar postagem";
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as AxiosError;
        if (axiosError.response && (axiosError.response.data as any)?.message) {
          errorMessage = (axiosError.response.data as any).message;
        } else if (axiosError.response && axiosError.response.status === 401) {
          errorMessage = "Você não tem permissão para editar esta postagem";
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setSubmitError(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Postagem não encontrada"}
            </h1>
            <Link href="/posts">
              <Button variant="primary">Voltar para postagens</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Permissão: só autor, admin ou super_admin pode editar
  const canEdit =
    user &&
    (user.role === "super_admin" ||
      user.role === "admin" ||
      (user.role === "user" && user.id === post.authorId));

  if (!canEdit) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Você não tem permissão para editar esta postagem
            </h1>
            <Link href="/posts">
              <Button variant="primary">Voltar para postagens</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const initialData: CreatePostFormData = {
    slug: post.slug,
    title: post.title,
    text: post.text,
    image: post.image || "",
  };

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
          mode="edit"
          initialData={initialData}
          onSubmit={handleEdit}
          loading={submitLoading}
          error={submitError}
        />
      </div>
    </Layout>
  );
};

export default EditPostPage;
