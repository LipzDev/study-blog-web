import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/templates/Layout";
import { Button } from "@/components/atoms/Button";
import { Post } from "@/types";
import { apiService } from "@/services/api";
import { Calendar, User, Clock, ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function PostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && typeof slug === "string") {
      fetchPost(slug);
    }
  }, [slug]);

  const fetchPost = async (postSlug: string) => {
    try {
      setLoading(true);
      const postData = await apiService.getPostBySlug(postSlug);
      setPost(postData);
    } catch (error: unknown) {
      setError("Postagem não encontrada");
      console.error("Erro ao carregar postagem:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post || !confirm("Tem certeza que deseja excluir esta postagem?")) {
      return;
    }

    try {
      await apiService.deletePost(post.id);
      router.push("/posts");
    } catch (error: unknown) {
      alert("Erro ao excluir postagem");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCreatedAt = () => (post ? post.createdAt : "");

  const getImageUrl = () => {
    if (!post) return null;
    if (post.image) {
      if (post.image.startsWith("http")) return post.image;
      return `http://localhost:3001${post.image.startsWith("/") ? post.image : "/" + post.image}`;
    }
    if (post.imagePath) {
      const path = post.imagePath.startsWith("/")
        ? post.imagePath
        : `/${post.imagePath}`;
      return `http://localhost:3001${path}`;
    }
    return null;
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
              <Button variant="primary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para postagens
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const canEdit =
    user &&
    // Super admin pode tudo
    (user.role === "super_admin" ||
      // Admin pode editar posts de user e admin, mas não de super_admin
      (user.role === "admin" &&
        post.author &&
        post.author.role !== "super_admin") ||
      // User só pode editar o próprio post
      (user.role === "user" && user.id === post.authorId));
  const canDelete =
    user &&
    (user.id === post.authorId ||
      user.role === "admin" ||
      user.role === "super_admin");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/posts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para postagens
            </Button>
          </Link>
        </div>

        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post?.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{post?.author?.name}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(getCreatedAt())}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{formatTime(getCreatedAt())}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {canEdit && post && (
              <div className="flex items-center space-x-2">
                <Link href={`/posts/${post.slug}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                </Link>
                {canDelete && (
                  <Button variant="danger" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Image */}
        {getImageUrl() && post && (
          <div className="relative h-96 w-full overflow-hidden rounded-lg mb-8">
            <Image
              src={getImageUrl() || ""}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {post?.text}
          </div>
        </div>

        {/* Post Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              <p>
                Postado por{" "}
                <span className="font-medium">{post?.author?.name}</span>
              </p>
              <p>
                Última atualização: {post ? formatDate(post.updatedAt) : ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
