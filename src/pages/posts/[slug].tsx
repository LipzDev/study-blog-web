import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/templates/Layout";
import { Button } from "@/components/atoms/Button";
import { Post } from "@/types";
import { apiService } from "@/services/api";
import {
  Calendar,
  User,
  Clock,
  ArrowLeft,
  Edit,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import CommentsPostForm from "@/components/CommentsPostForm";

export default function PostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    if (!post) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await apiService.deletePost(post.id);
      router.push("/posts");
    } catch (error: unknown) {
      setDeleteError("Erro ao excluir postagem");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
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
      return `${process.env.NEXT_PUBLIC_API_URL}${post.image.startsWith("/") ? post.image : "/" + post.image}`;
    }
    if (post.imagePath) {
      const path = post.imagePath.startsWith("/")
        ? post.imagePath
        : `/${post.imagePath}`;
      return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
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
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
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
                Postado por:{" "}
                <span className="font-medium">{post?.author?.name}</span>
              </p>
              <p>
                Última atualização: {post ? formatDate(post.updatedAt) : ""}
              </p>
            </div>
          </div>
          <CommentsPostForm />
        </div>

        {/* Modal de Exclusão de Post */}
        {showDeleteModal && post && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Excluir Postagem
                      </h3>
                      <p className="text-sm text-gray-600">
                        Remover permanentemente da plataforma
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="text-2xl leading-none" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-red-800 mb-1">
                          Ação Irreversível
                        </h4>
                        <p className="text-sm text-red-700">
                          Esta ação não pode ser desfeita. A postagem será
                          permanentemente removida da plataforma.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Postagem a ser excluída:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Título:</span>{" "}
                        {post.title}
                      </div>
                      <div>
                        <span className="font-medium">Autor:</span>{" "}
                        {post.author?.name}
                      </div>
                      <div>
                        <span className="font-medium">Data de criação:</span>{" "}
                        {formatDate(getCreatedAt())}
                      </div>
                    </div>
                  </div>
                  {deleteError && (
                    <div className="mt-4 text-sm text-red-600">
                      {deleteError}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1"
                    disabled={deleteLoading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDelete}
                    loading={deleteLoading}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
