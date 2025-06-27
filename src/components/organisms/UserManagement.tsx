import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { User, UserRole } from "@/types";
import { apiService } from "@/services/api";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import {
  Search,
  Crown,
  Shield,
  User as UserIcon,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Estados dos modais
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [showDemoteModal, setShowDemoteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdmin = currentUser?.role === UserRole.ADMIN || isSuperAdmin;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Limpar mensagens automaticamente após 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers(currentPage, 10);
      setUsers(response);
    } catch (err: unknown) {
      setError("Erro ao carregar usuários");
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  // Função para detectar se o termo é email ou nome
  const detectSearchType = (term: string): "email" | "name" => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(term) ? "email" : "name";
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      setExpandedCards(new Set()); // Reset expanded cards on new search

      const searchType = detectSearchType(searchTerm.trim());
      const searchParams =
        searchType === "email"
          ? { email: searchTerm.trim() }
          : { name: searchTerm.trim() };

      const result = await apiService.searchUser(
        searchParams.email,
        searchParams.name,
        currentSearchPage,
        4, // Limitar a 4 cards por página
      );
      setSearchResults(result);
    } catch (err: unknown) {
      setError("Usuário não encontrado");
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleSearchPageChange = async (newPage: number) => {
    if (!searchTerm.trim()) return;

    try {
      setSearchLoading(true);
      setError(null);
      setExpandedCards(new Set()); // Reset expanded cards on page change

      const searchType = detectSearchType(searchTerm.trim());
      const searchParams =
        searchType === "email"
          ? { email: searchTerm.trim() }
          : { name: searchTerm.trim() };

      const result = await apiService.searchUser(
        searchParams.email,
        searchParams.name,
        newPage,
        4, // Limitar a 4 cards por página
      );
      setSearchResults(result);
      setCurrentSearchPage(newPage);
    } catch (err: unknown) {
      setError("Erro ao carregar página");
    } finally {
      setSearchLoading(false);
    }
  };

  const toggleCardExpansion = (userId: string) => {
    const newExpandedCards = new Set(expandedCards);
    if (newExpandedCards.has(userId)) {
      newExpandedCards.delete(userId);
    } else {
      newExpandedCards.add(userId);
    }
    setExpandedCards(newExpandedCards);
  };

  const canDeleteUser = (user: User) => {
    if (isSuperAdmin) {
      return user.role !== UserRole.SUPER_ADMIN;
    }
    if (isAdmin) {
      return user.role === UserRole.USER;
    }
    return false;
  };

  const canPromoteUser = (user: User) => {
    return isSuperAdmin && user.role === UserRole.USER;
  };

  const canDemoteUser = (user: User) => {
    return isSuperAdmin && user.role === UserRole.ADMIN;
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case UserRole.ADMIN:
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Super Admin";
      case UserRole.ADMIN:
        return "Admin";
      default:
        return "Usuário";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Funções para abrir modais
  const openPromoteModal = (user: User) => {
    setSelectedUser(user);
    setShowPromoteModal(true);
  };

  const openDemoteModal = (user: User) => {
    setSelectedUser(user);
    setShowDemoteModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Funções de confirmação dos modais
  const confirmPromote = async () => {
    if (!selectedUser) return;

    try {
      setModalLoading(true);
      await apiService.promoteToAdmin(selectedUser.id);
      setSuccess("Usuário promovido a administrador com sucesso!");
      fetchUsers();
      if (searchResults?.users.some((u) => u.id === selectedUser.id)) {
        setSearchResults({
          ...searchResults,
          users: searchResults.users.map((u) =>
            u.id === selectedUser.id ? { ...u, role: UserRole.ADMIN } : u,
          ),
        });
      }
      setShowPromoteModal(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      setError("Erro ao promover usuário");
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDemote = async () => {
    if (!selectedUser) return;

    try {
      setModalLoading(true);
      await apiService.demoteFromAdmin(selectedUser.id);
      setSuccess("Cargo de administrador removido com sucesso!");
      fetchUsers();
      if (searchResults?.users.some((u) => u.id === selectedUser.id)) {
        setSearchResults({
          ...searchResults,
          users: searchResults.users.map((u) =>
            u.id === selectedUser.id ? { ...u, role: UserRole.USER } : u,
          ),
        });
      }
      setShowDemoteModal(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      setError("Erro ao remover cargo de administrador");
    } finally {
      setModalLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      setModalLoading(true);
      await apiService.deleteUser(selectedUser.id);
      setSuccess("Usuário excluído com sucesso!");
      fetchUsers();
      if (searchResults?.users.some((u) => u.id === selectedUser.id)) {
        setSearchResults({
          ...searchResults,
          users: searchResults.users.filter((u) => u.id !== selectedUser.id),
        });
      }
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err: unknown) {
      setError("Erro ao excluir usuário");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Gerenciamento de Usuários
        </h1>
        <p className="text-gray-600">
          Gerencie usuários, permissões e configurações da plataforma
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-md mb-6">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-md mb-6">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-700">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Search Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Buscar Usuário</CardTitle>
          <CardDescription>
            Digite o email ou nome do usuário. Dica: Expanda os cards para ver
            as ações disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Ex: joao@email.com ou João Silva"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value.trim() === "") {
                  setSearchResults(null);
                }
              }}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              loading={searchLoading}
              disabled={searchLoading || !searchTerm.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>

          {searchResults && (
            <div className="mt-6 space-y-4">
              {/* Header do resultado */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {searchResults.total === 1
                          ? "Usuário Encontrado"
                          : `${searchResults.total} Usuários Encontrados`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {searchResults.total === 1
                          ? "Detalhes e ações disponíveis"
                          : `Página ${searchResults.page} de ${searchResults.totalPages}`}
                      </p>
                    </div>
                  </div>
                  {searchResults.total > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-3 py-1 bg-white rounded-full border border-gray-200 text-xs font-medium">
                        {searchResults.users.length} resultados nesta página
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cards dos usuários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.users.map((user) => {
                  const isExpanded = expandedCards.has(user.id);

                  return (
                    <div
                      key={user.id}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                    >
                      {/* Header do card */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {user.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {getRoleIcon(user.role)}
                              <span className="text-sm text-gray-600">
                                {getRoleLabel(user.role)}
                              </span>
                            </div>
                            <button
                              onClick={() => toggleCardExpansion(user.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Conteúdo expandido */}
                      {isExpanded && (
                        <div className="p-4">
                          <div className="flex flex-col md:flex-row gap-4 w-full">
                            {/* Informações detalhadas */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 md:w-1/3">
                              <div className="flex items-center gap-2 mb-1">
                                <svg
                                  className="h-4 w-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                  Criado em
                                </span>
                              </div>
                              <p className="font-medium text-gray-900">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>

                            {/* Seção de ações */}
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 md:w-2/3 flex flex-col justify-between">
                              <h5 className="font-medium text-gray-900 mb-3 text-sm">
                                Ações Disponíveis
                              </h5>

                              <div className="space-y-2">
                                {/* Verificar se é o próprio usuário */}
                                {user.id === currentUser?.id && (
                                  <p className="text-xs text-gray-600">
                                    Você não pode manipular sua própria conta.
                                  </p>
                                )}

                                {/* Verificar se é super admin */}
                                {user.role === UserRole?.SUPER_ADMIN &&
                                  user.id !== currentUser?.id && (
                                    <p className="text-xs text-gray-600">
                                      Não é possivel modificar o cargo ou
                                      excluir um super admin.
                                    </p>
                                  )}

                                {/* Ações disponíveis apenas se não for o próprio usuário */}
                                {user.id !== currentUser?.id && (
                                  <div className="flex flex-row gap-2">
                                    {canPromoteUser(user) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openPromoteModal(user)}
                                        className="bg-white hover:bg-blue-50 text-blue-600 border-blue-300 hover:border-blue-400 shadow-sm text-xs"
                                      >
                                        <Shield className="h-3 w-3 mr-1" />
                                        Promover a Admin
                                      </Button>
                                    )}
                                    {canDemoteUser(user) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openDemoteModal(user)}
                                        className="bg-white hover:bg-orange-50 text-orange-600 border-orange-300 hover:border-orange-400 shadow-sm text-xs"
                                      >
                                        <UserIcon className="h-3 w-3 mr-1" />
                                        Remover Admin
                                      </Button>
                                    )}
                                    {canDeleteUser(user) && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openDeleteModal(user)}
                                        className="bg-white hover:bg-red-50 text-red-600 border-red-300 hover:border-red-400 shadow-sm text-xs"
                                      >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Excluir Usuário
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Paginação */}
              {searchResults.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando{" "}
                    {(searchResults.page - 1) * searchResults.limit + 1} a{" "}
                    {Math.min(
                      searchResults.page * searchResults.limit,
                      searchResults.total,
                    )}{" "}
                    de {searchResults.total} resultados
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleSearchPageChange(searchResults.page - 1)
                      }
                      disabled={searchResults.page <= 1 || searchLoading}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {searchResults.page} de {searchResults.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleSearchPageChange(searchResults.page + 1)
                      }
                      disabled={
                        searchResults.page >= searchResults.totalPages ||
                        searchLoading
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
          <CardDescription>
            {users ? (
              <>
                Lista completa de usuários da plataforma - Página {users.page}{" "}
                de {users.totalPages} ({users.total} usuários no total)
              </>
            ) : (
              "Lista completa de usuários da plataforma"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Cargo
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Data de Criação
                      </th>
                      {isAdmin && (
                        <th className="text-left py-3 px-4 font-medium text-gray-900">
                          Ações
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users?.users.map((user, index) => (
                      <tr key={user.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="relative top-0.5">
                              {getRoleIcon(user.role)}
                            </span>
                            <span>{getRoleLabel(user.role)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {formatDate(user.createdAt)}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {/* Não mostrar ações para o próprio usuário */}
                              {user.id !== currentUser?.id && (
                                <>
                                  {canPromoteUser(user) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openPromoteModal(user)}
                                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                    >
                                      <Shield className="h-3 w-3 mr-1" />
                                      Promover
                                    </Button>
                                  )}
                                  {canDemoteUser(user) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDemoteModal(user)}
                                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                    >
                                      <UserIcon className="h-3 w-3 mr-1" />
                                      Remover Admin
                                    </Button>
                                  )}
                                  {canDeleteUser(user) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openDeleteModal(user)}
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Excluir
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação para Todos os Usuários */}
              {users && users.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando {(users.page - 1) * users.limit + 1} a{" "}
                    {Math.min(users.page * users.limit, users.total)} de{" "}
                    {users.total} usuários
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(users.page - 1)}
                      disabled={users.page <= 1 || loading}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-gray-600">
                      Página {users.page} de {users.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(users.page + 1)}
                      disabled={users.page >= users.totalPages || loading}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de Promoção */}
      {showPromoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Promover Usuário
                    </h3>
                    <p className="text-sm text-gray-600">
                      Elevar privilégios de acesso
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        Atenção
                      </h4>
                      <p className="text-sm text-yellow-700">
                        Ao promover este usuário, ele terá acesso a
                        funcionalidades administrativas incluindo gerenciamento
                        de outros usuários e configurações do sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Usuário selecionado:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span>{" "}
                      {selectedUser.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedUser.email}
                    </div>
                    <div>
                      <span className="font-medium">Cargo atual:</span>{" "}
                      {getRoleLabel(selectedUser.role)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPromoteModal(false)}
                  className="flex-1"
                  disabled={modalLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmPromote}
                  loading={modalLoading}
                  disabled={modalLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Confirmar Promoção
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Remoção de Admin */}
      {showDemoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Remover Admin
                    </h3>
                    <p className="text-sm text-gray-600">
                      Reduzir privilégios de acesso
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemoteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-orange-800 mb-1">
                        Atenção
                      </h4>
                      <p className="text-sm text-orange-700">
                        Ao remover os privilégios de administrador, este usuário
                        perderá acesso às funcionalidades administrativas do
                        sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Usuário selecionado:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span>{" "}
                      {selectedUser.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedUser.email}
                    </div>
                    <div>
                      <span className="font-medium">Cargo atual:</span>{" "}
                      {getRoleLabel(selectedUser.role)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDemoteModal(false)}
                  className="flex-1"
                  disabled={modalLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDemote}
                  loading={modalLoading}
                  disabled={modalLoading}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Confirmar Remoção
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {showDeleteModal && selectedUser && (
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
                      Excluir Usuário
                    </h3>
                    <p className="text-sm text-gray-600">
                      Remover permanentemente da plataforma
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
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
                        Esta ação não pode ser desfeita. O usuário será
                        permanentemente removido da plataforma e perderá acesso
                        a todos os dados.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Usuário a ser excluído:
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Nome:</span>{" "}
                      {selectedUser.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedUser.email}
                    </div>
                    <div>
                      <span className="font-medium">Cargo:</span>{" "}
                      {getRoleLabel(selectedUser.role)}
                    </div>
                    <div>
                      <span className="font-medium">Membro desde:</span>{" "}
                      {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1"
                  disabled={modalLoading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmDelete}
                  loading={modalLoading}
                  disabled={modalLoading}
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
  );
}
