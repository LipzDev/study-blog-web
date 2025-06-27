import React, { useEffect, useState } from "react";
import { Layout } from "@/components/templates/Layout";
import { PageHead } from "@/components/atoms/PageHead";
import { PostCard } from "@/components/molecules/PostCard";
import { Button } from "@/components/atoms/Button";
import { Post, UserRole } from "@/types";
import { apiService } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, ArrowRight, Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin =
    user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getPaginatedPosts({
          page: 1,
          limit: 6,
        });
        setPosts(response.posts);
      } catch (err: unknown) {
        setError("Erro ao carregar postagens");
        console.error("Erro ao carregar postagens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout>
      <PageHead
        title="StudyBlog - Início | Seu Blog de Estudos"
        description="Bem-vindo ao StudyBlog! Uma plataforma moderna para compartilhar conhecimento e experiências de estudo. Conecte-se com outros estudantes e aprenda juntos."
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <BookOpen className="h-16 w-16 text-blue-200" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bem-vindo ao <span className="text-blue-200">StudyBlog</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Uma plataforma moderna para compartilhar conhecimento e
              experiências de estudo. Conecte-se com outros estudantes e aprenda
              juntos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/posts">
                <Button size="lg" variant="secondary" className="text-blue-600">
                  Explorar Postagens
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/posts/create">
                  <Button
                    size="lg"
                    variant="primary"
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Criar Postagem
                  </Button>
                </Link>
              )}
              {!user && (
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Criar Conta
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Postagens Recentes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubra as últimas postagens da nossa comunidade de estudantes
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : posts?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhuma postagem encontrada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          {posts?.length > 0 && (
            <div className="text-center mt-12">
              <Link href="/posts">
                <Button size="lg" variant="primary">
                  Ver Todas as Postagens
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o StudyBlog?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece tudo que você precisa para compartilhar e
              aprender
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Compartilhe Conhecimento
              </h3>
              <p className="text-gray-600">
                Crie postagens sobre seus estudos, experiências e descobertas
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aprenda com Outros
              </h3>
              <p className="text-gray-600">
                Descubra novas perspectivas e métodos de estudo da comunidade
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Conecte-se
              </h3>
              <p className="text-gray-600">
                Interaja com outros estudantes e construa uma rede de
                conhecimento
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
