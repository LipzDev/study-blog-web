import React, { useEffect, useState, useCallback } from "react";
import { Layout } from "@/components/templates/Layout";
import { PostCard } from "@/components/molecules/PostCard";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Post, PaginatedPosts } from "@/types";
import { apiService } from "@/services/api";
import {
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/router";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPosts = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);
        const params: {
          page: number;
          limit: number;
          search?: string;
          startDate?: string;
          endDate?: string;
        } = {
          page,
          limit: 12,
        };

        if (search) params.search = search;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response: PaginatedPosts =
          await apiService.getPaginatedPosts(params);
        setPosts(response.posts);
        setTotalPages(response.totalPages);
        setCurrentPage(response.page);
      } catch (err: unknown) {
        setError("Erro ao carregar postagens");
        console.error("Erro ao carregar postagens:", err);
      } finally {
        setLoading(false);
      }
    },
    [search, startDate, endDate],
  );

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const page = Number(router.query.page) || 1;
    fetchPosts(page);
  }, [router.query.page, fetchPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPosts(page);
  };

  const clearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchPosts(1);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Postagens</h1>
          <p className="text-gray-600">
            Explore as postagens da nossa comunidade de estudantes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <form
            onSubmit={handleSearch}
            className="flex flex-col sm:flex-row gap-4 mb-4"
          >
            <div className="flex-1">
              <Input
                placeholder="Buscar postagens..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" variant="primary">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </form>

          {showFilters && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data inicial
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data final
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Limpar filtros
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Posts Grid */}
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-10 h-10"
                      >
                        {page}
                      </Button>
                    ),
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
