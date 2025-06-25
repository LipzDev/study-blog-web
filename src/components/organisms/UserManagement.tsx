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
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<User | null>(null);

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdmin = currentUser?.role === UserRole.ADMIN || isSuperAdmin;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      setUsers(response);
    } catch (err: any) {
      setError("Erro ao carregar usuários");
      console.error("Erro ao carregar usuários:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    try {
      setSearchLoading(true);
      setError(null);
      const user = await apiService.searchUser(searchEmail);
      setSearchResults(user);
    } catch (err: any) {
      setError("Usuário não encontrado");
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await apiService.promoteToAdmin(userId);
      setSuccess("Usuário promovido a administrador com sucesso!");
      fetchUsers();
      if (searchResults?.id === userId) {
        setSearchResults({ ...searchResults, role: UserRole.ADMIN });
      }
    } catch (err: any) {
      setError("Erro ao promover usuário");
    }
  };

  const handleDemoteFromAdmin = async (userId: string) => {
    try {
      await apiService.demoteFromAdmin(userId);
      setSuccess("Cargo de administrador removido com sucesso!");
      fetchUsers();
      if (searchResults?.id === userId) {
        setSearchResults({ ...searchResults, role: UserRole.USER });
      }
    } catch (err: any) {
      setError("Erro ao remover cargo de administrador");
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userEmail}?`)) {
      return;
    }

    try {
      await apiService.deleteUser(userId);
      setSuccess("Usuário excluído com sucesso!");
      fetchUsers();
      if (searchResults?.id === userId) {
        setSearchResults(null);
      }
    } catch (err: any) {
      setError("Erro ao excluir usuário");
    }
  };

  const handleUpdateUserName = async (userId: string, newName: string) => {
    try {
      await apiService.updateUserName(userId, newName);
      setSuccess("Nome do usuário atualizado com sucesso!");
      fetchUsers();
      if (searchResults?.id === userId) {
        setSearchResults({ ...searchResults, name: newName });
      }
    } catch (err: any) {
      setError("Erro ao atualizar nome do usuário");
    }
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
            Busque um usuário específico por email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-4">
            <Input
              placeholder="Digite o email do usuário"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              loading={searchLoading}
              disabled={searchLoading || !searchEmail.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </form>

          {searchResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Resultado da busca:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Nome:</span>{" "}
                  {searchResults.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span>{" "}
                  {searchResults.email}
                </div>
                <div>
                  <span className="font-medium">Cargo:</span>{" "}
                  <span className="inline-flex items-center gap-1">
                    {getRoleIcon(searchResults.role)}
                    {getRoleLabel(searchResults.role)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Criado em:</span>{" "}
                  {formatDate(searchResults.createdAt)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Usuários</CardTitle>
          <CardDescription>
            Lista completa de usuários da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
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
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1">
                          {getRoleIcon(user.role)}
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(user.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {canPromoteUser(user) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePromoteToAdmin(user.id)}
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
                                onClick={() => handleDemoteFromAdmin(user.id)}
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
                                onClick={() =>
                                  handleDeleteUser(user.id, user.email)
                                }
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Excluir
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
