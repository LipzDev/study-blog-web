import { Avatar } from "@/components/atoms/Avatar";
import { Button } from "@/components/atoms/Button";
import { ProtectedRoute } from "@/components/atoms/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { apiService } from "@/services/api";
import { UserRole } from "@/types";
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Crown,
  Edit2,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Plus,
  Shield,
  Twitter,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
};

export function UserProfile() {
  return (
    <ProtectedRoute
      requiredRoles={[UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]}
    >
      <UserProfileContent />
    </ProtectedRoute>
  );
}

function UserProfileContent() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [social, setSocial] = useState({
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    twitter: user?.twitter || "",
    instagram: user?.instagram || "",
  });
  const [originalSocial, setOriginalSocial] = useState({
    github: user?.github || "",
    linkedin: user?.linkedin || "",
    twitter: user?.twitter || "",
    instagram: user?.instagram || "",
  });
  const [editingSocial, setEditingSocial] = useState({
    github: false,
    linkedin: false,
    twitter: false,
    instagram: false,
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const SOCIAL_MEDIA_KEYS = [
    "github",
    "linkedin",
    "twitter",
    "instagram",
  ] as const;
  type SocialMedia = (typeof SOCIAL_MEDIA_KEYS)[number];
  type SocialErrors = Record<SocialMedia, string>;

  const [socialErrors, setSocialErrors] = useState<SocialErrors>({
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => setSuccess(""), 3000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  const getAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return null;

    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    return `${apiBase}${avatarPath}`;
  };

  const canBeEmpty = (field: string) => {
    return ["bio"].includes(field);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  function isValidSocialUrl(url: string) {
    if (!url) return true;
    return isValidUrl(url);
  }

  const validateForm = (): SocialErrors => {
    return SOCIAL_MEDIA_KEYS.reduce((errors, key) => {
      const value = social[key];
      errors[key] = value && !isValidSocialUrl(value) ? "URL inválida" : "";
      return errors;
    }, {} as SocialErrors);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione apenas arquivos de imagem.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB.");
        return;
      }

      setAvatarFile(file);
      setAvatar(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      setError("");

      const response = await apiService.uploadAvatar(avatarFile);
      updateUser(response.user);
      setAvatarFile(null);
      setSuccess("Avatar atualizado com sucesso!");
    } catch (err: unknown) {
      let errorMessage = "Erro ao fazer upload do avatar";
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSocialChange = (key: SocialMedia, value: string) => {
    setSocial((prev) => ({ ...prev, [key]: value }));
    setSocialErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleAddSocial = (key: SocialMedia) => {
    setEditingSocial((prev) => ({ ...prev, [key]: true }));
  };

  const handleCancelSocial = (key: SocialMedia) => {
    setSocial((prev) => ({
      ...prev,
      [key]: originalSocial[key],
    }));
    setEditingSocial((prev) => ({ ...prev, [key]: false }));
    setSocialErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleRemoveSocial = async (key: SocialMedia) => {
    try {
      setLoading(true);
      setError("");

      const updateData: { [key: string]: string | undefined } = {};
      updateData[key] = undefined;

      const response = await apiService.updateProfile(updateData);
      updateUser(response.user);

      setSocial((prev) => ({ ...prev, [key]: "" }));
      setOriginalSocial((prev) => ({ ...prev, [key]: "" }));
      setEditingSocial((prev) => ({ ...prev, [key]: false }));

      setSuccess(
        `${key.charAt(0).toUpperCase() + key.slice(1)} removido com sucesso!`,
      );
    } catch (err: unknown) {
      let errorMessage = `Erro ao remover ${key}`;
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriedSubmit(true);

    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    } else if (name.trim().length < 2) {
      setError("Nome deve ter pelo menos 2 caracteres");
      return;
    }

    const errors = validateForm();
    const hasSocialErrors = Object.values(errors).some((error) => error !== "");
    if (hasSocialErrors) {
      setSocialErrors(errors);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const updateData: {
        name?: string;
        bio?: string;
        github?: string | undefined;
        linkedin?: string | undefined;
        twitter?: string | undefined;
        instagram?: string | undefined;
      } = {
        name: name.trim(),
        bio: bio.trim() || undefined,
      };

      Object.keys(social).forEach((key) => {
        const value = social[key as keyof typeof social];
        const originalValue =
          originalSocial[key as keyof typeof originalSocial];
        if (value !== originalValue) {
          updateData[key as keyof typeof updateData] = value || undefined;
        }
      });

      const response = await apiService.updateProfile(updateData);
      updateUser(response.user);
      setOriginalSocial(social);
      setSuccess("Perfil atualizado com sucesso!");
      setTriedSubmit(false);
    } catch (err: unknown) {
      let errorMessage = "Erro ao atualizar perfil";
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  async function handleSaveSocialField(key: SocialMedia, value: string) {
    try {
      setLoading(true);
      setError("");

      const updateData: { [key: string]: string | undefined } = {};
      updateData[key] = value || undefined;

      const response = await apiService.updateProfile(updateData);
      updateUser(response.user);

      setSocial((prev) => ({ ...prev, [key]: value }));
      setOriginalSocial((prev) => ({ ...prev, [key]: value }));
      setEditingSocial((prev) => ({ ...prev, [key]: false }));

      setSuccess(
        `${key.charAt(0).toUpperCase() + key.slice(1)} atualizado com sucesso!`,
      );
    } catch (err: unknown) {
      let errorMessage = `Erro ao atualizar ${key}`;
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "super_admin":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Crown className="h-3 w-3 mr-1" />
            Super Admin
          </div>
        );
      case "admin":
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <UserIcon className="h-3 w-3 mr-1" />
            Usuário
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar ao início
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas informações pessoais e redes sociais
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Foto do Perfil
            </h2>
            <div className="flex items-center space-x-6">
              <div className="relative">
                <Avatar
                  src={getAvatarUrl(avatar)}
                  alt={user?.name || "Avatar"}
                  size="lg"
                  className="w-24 h-24"
                />
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Clique na câmera para alterar sua foto de perfil
                </p>
                {avatarFile && (
                  <div className="space-y-2">
                    <Button
                      type="button"
                      onClick={handleUploadAvatar}
                      loading={uploadingAvatar}
                      disabled={uploadingAvatar}
                      size="sm"
                    >
                      Salvar nova foto
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatar(user?.avatar || null);
                      }}
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Básicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                />
                {triedSubmit && !name.trim() && (
                  <p className="text-red-600 text-sm mt-1">
                    Nome é obrigatório
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email não pode ser alterado
                </p>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografia
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Conte um pouco sobre você..."
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tipo de Conta
            </h2>
            <div className="flex items-center space-x-3">
              {getRoleBadge(user?.role || "user")}
              <span className="text-sm text-gray-600">
                {user?.role === "super_admin"
                  ? "Você tem acesso total ao sistema"
                  : user?.role === "admin"
                    ? "Você pode gerenciar usuários e conteúdo"
                    : "Você pode criar e editar suas próprias postagens"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Redes Sociais
            </h2>
            <div className="space-y-4">
              {SOCIAL_MEDIA_KEYS.map((key) => {
                const value = social[key];
                const Icon = socialIcons[key as keyof typeof socialIcons];
                const isEditing =
                  editingSocial[key as keyof typeof editingSocial];
                const hasError = socialErrors[key as keyof typeof socialErrors];

                return (
                  <div key={key} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="url"
                            value={value}
                            onChange={(e) =>
                              handleSocialChange(key, e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`URL do ${key}`}
                          />
                          {hasError && (
                            <p className="text-red-600 text-sm">{hasError}</p>
                          )}
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              onClick={() => handleSaveSocialField(key, value)}
                              loading={loading}
                              disabled={loading}
                              size="sm"
                            >
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => handleCancelSocial(key)}
                              size="sm"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {key}
                            </p>
                            {value ? (
                              <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-500"
                              >
                                {value}
                              </a>
                            ) : (
                              <p className="text-sm text-gray-500">
                                Não configurado
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {value ? (
                              <>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleAddSocial(key)}
                                  size="sm"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => handleRemoveSocial(key)}
                                  loading={loading}
                                  disabled={loading}
                                  size="sm"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleAddSocial(key)}
                                size="sm"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Adicionar
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              size="lg"
            >
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
