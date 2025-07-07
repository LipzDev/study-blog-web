import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/atoms/Button";
import { Avatar } from "@/components/atoms/Avatar";
import { apiService } from "@/services/api";
import Link from "next/link";
import {
  User as UserIcon,
  Camera,
  CheckCircle,
  XCircle,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Loader2,
  AlertCircle,
  ArrowLeft,
  X,
  Plus,
  Edit2,
  Crown,
  Shield,
} from "lucide-react";
import { ProtectedRoute } from "@/components/atoms/ProtectedRoute";
import { UserRole } from "@/types";

const socialIcons = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram,
};

export default function Perfil() {
  return (
    <ProtectedRoute
      requiredRoles={[UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]}
    >
      <PerfilContent />
    </ProtectedRoute>
  );
}

function PerfilContent() {
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

  // Função para obter a URL completa do avatar
  const getAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return null;

    // Se já é uma URL completa (começa com http), retorna como está
    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    // Se é uma URL relativa, adiciona a base da API
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${apiBase}${avatarPath}`;
  };

  // Atualizar estados quando o usuário mudar
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setAvatar(getAvatarUrl(user.avatar ?? null));
      const socialData = {
        github: user.github || "",
        linkedin: user.linkedin || "",
        twitter: user.twitter || "",
        instagram: user.instagram || "",
      };
      setSocial(socialData);
      setOriginalSocial(socialData);

      // Resetar estado de edição
      setEditingSocial({
        github: false,
        linkedin: false,
        twitter: false,
        instagram: false,
      });
    }
  }, [user]);

  // Função para validar se um campo social pode ser vazio
  const canBeEmpty = (field: string) => {
    return !originalSocial[field as keyof typeof originalSocial];
  };

  // Função para validar URLs
  const isValidUrl = (url: string) => {
    if (!url) return true; // URLs vazias são válidas (opcionais)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Função para validar todos os campos antes de salvar
  const validateForm = () => {
    const errors: string[] = [];

    if (!name.trim()) {
      errors.push("Nome é obrigatório");
    }

    // Validar redes sociais
    Object.entries(social).forEach(([key, value]) => {
      const trimmedValue = value.trim();

      // Se o campo está vazio mas tinha dados originais
      if (trimmedValue === "" && !canBeEmpty(key)) {
        errors.push(
          `${key.charAt(0).toUpperCase() + key.slice(1)} não pode ser removido se já possui dados. Deixe o campo inalterado ou forneça uma URL válida.`,
        );
      }

      // Se o campo tem valor, deve ser uma URL válida
      if (trimmedValue !== "" && !isValidUrl(trimmedValue)) {
        errors.push(
          `${key.charAt(0).toUpperCase() + key.slice(1)} deve ser uma URL válida.`,
        );
      }
    });

    return errors;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione um arquivo de imagem válido.");
        return;
      }

      // Validar tamanho (máximo 5MB)
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

    setUploadingAvatar(true);
    setError("");
    setSuccess("");

    try {
      // Fazer upload do avatar
      const avatarResult = await apiService.uploadAvatar(avatarFile);

      // Atualizar o avatar com a URL completa
      setAvatar(getAvatarUrl(avatarResult.user.avatar ?? null));

      // Se há outros dados para atualizar, fazer updateProfile também
      const hasOtherChanges =
        name !== user?.name ||
        bio !== user?.bio ||
        social.github !== user?.github ||
        social.linkedin !== user?.linkedin ||
        social.twitter !== user?.twitter ||
        social.instagram !== user?.instagram;

      if (hasOtherChanges) {
        const profileResult = await apiService.updateProfile({
          name,
          bio,
          github: social.github,
          linkedin: social.linkedin,
          twitter: social.twitter,
          instagram: social.instagram,
        });

        // Usar os dados mais atualizados (do profileResult)
        updateUser(profileResult.user);
        setAvatar(getAvatarUrl(profileResult.user.avatar ?? null));
        setSuccess("Perfil e avatar atualizados com sucesso!");
      } else {
        // Apenas avatar foi atualizado
        updateUser(avatarResult.user);
        setSuccess("Avatar atualizado com sucesso!");
      }

      setAvatarFile(null);

      // Atualizar dados originais após sucesso
      setOriginalSocial({
        github: social.github,
        linkedin: social.linkedin,
        twitter: social.twitter,
        instagram: social.instagram,
      });

      // Fechar campos de edição
      setEditingSocial({
        github: false,
        linkedin: false,
        twitter: false,
        instagram: false,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Erro ao fazer upload do avatar.",
      );
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSocialChange = (key: string, value: string) => {
    setSocial((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddSocial = (key: string) => {
    setEditingSocial((prev) => ({ ...prev, [key]: true }));
  };

  const handleCancelSocial = (key: string) => {
    setEditingSocial((prev) => ({ ...prev, [key]: false }));
    setSocial((prev) => ({
      ...prev,
      [key]: originalSocial[key as keyof typeof originalSocial],
    }));
  };

  const handleRemoveSocial = async (key: string) => {
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const updateData = {
        name,
        bio,
        github: key === "github" ? "" : social.github,
        linkedin: key === "linkedin" ? "" : social.linkedin,
        twitter: key === "twitter" ? "" : social.twitter,
        instagram: key === "instagram" ? "" : social.instagram,
      };

      const result = await apiService.updateProfile(updateData);
      updateUser(result.user);

      // Atualizar estados locais
      setSocial((prev) => ({ ...prev, [key]: "" }));
      setOriginalSocial((prev) => ({ ...prev, [key]: "" }));
      setSuccess("Rede social removida com sucesso!");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao remover rede social.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    // Validar formulário
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      setLoading(false);
      return;
    }

    try {
      // Primeiro, fazer upload do avatar se houver um novo
      if (avatarFile) {
        await handleUploadAvatar();
        // Não continuar com updateProfile se o upload foi bem-sucedido
        // O upload já atualiza o usuário e o avatar
        setLoading(false);
        return;
      }

      // Se não há novo avatar, apenas atualizar o perfil
      const result = await apiService.updateProfile({
        name,
        bio,
        github: social.github,
        linkedin: social.linkedin,
        twitter: social.twitter,
        instagram: social.instagram,
      });

      updateUser(result.user);
      setSuccess("Perfil atualizado com sucesso!");

      // Atualizar dados originais após sucesso
      setOriginalSocial({
        github: result.user.github || "",
        linkedin: result.user.linkedin || "",
        twitter: result.user.twitter || "",
        instagram: result.user.instagram || "",
      });

      // Fechar campos de edição
      setEditingSocial({
        github: false,
        linkedin: false,
        twitter: false,
        instagram: false,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  // Função para exibir o badge de cargo com ícone
  const getRoleBadge = (role: string) => {
    if (role === UserRole.SUPER_ADMIN)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 ml-2">
          <Crown className="h-3 w-3 mr-1 text-yellow-600" /> Super Admin
        </span>
      );
    if (role === UserRole.ADMIN)
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300 ml-2">
          <Shield className="h-3 w-3 mr-1 text-blue-600" /> Admin
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300 ml-2">
        <UserIcon className="h-3 w-3 mr-1 text-gray-600" /> Usuário
      </span>
    );
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para o início
          </Button>
        </Link>
      </div>
      <div className="mb-8 flex items-center gap-3">
        <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
        {user && getRoleBadge(user.role)}
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl shadow p-6 space-y-6 border border-gray-100"
      >
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar
              src={avatar}
              alt="Avatar"
              name={name}
              size="lg"
              className="w-24 h-24 shadow"
            />
            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow cursor-pointer border border-gray-200 hover:bg-blue-50 transition">
              <Camera className="h-5 w-5 text-blue-600" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
            {/* Indicador de nova imagem selecionada */}
            {avatarFile && (
              <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Nova
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={40}
              required
            />
            {/* Mensagem informativa sobre nova imagem */}
            {avatarFile && (
              <p className="text-xs text-blue-600 mt-1">
                Nova imagem selecionada. Clique em &quot;Salvar Alterações&quot;
                para fazer upload.
              </p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="border border-gray-200 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
            maxLength={200}
            placeholder="Conte um pouco sobre você..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {bio.length}/200 caracteres
          </p>
        </div>

        {/* Redes sociais */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Redes Sociais
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(social).map(([key, value]) => {
              const Icon = socialIcons[key as keyof typeof socialIcons];
              const isEditing =
                editingSocial[key as keyof typeof editingSocial];
              const hasSavedValue =
                originalSocial[key as keyof typeof originalSocial].trim() !==
                "";
              const isInvalid = value.trim() !== "" && !isValidUrl(value);
              const socialName = key.charAt(0).toUpperCase() + key.slice(1);

              return (
                <div key={key} className="space-y-1">
                  {!isEditing && hasSavedValue ? (
                    // Mostrar rede social salva
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <a
                          href={
                            originalSocial[key as keyof typeof originalSocial]
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          {socialName}
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAddSocial(key)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSocial(key)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          title="Remover"
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : !isEditing && !hasSavedValue ? (
                    // Mostrar botão para adicionar rede social
                    <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-600">{socialName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddSocial(key)}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">Adicionar</span>
                      </button>
                    </div>
                  ) : (
                    // Mostrar campo de edição
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-gray-500" />
                        <input
                          type="url"
                          placeholder={`Link do ${socialName}`}
                          value={value}
                          onChange={(e) =>
                            handleSocialChange(key, e.target.value)
                          }
                          className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isInvalid
                              ? "border-red-300 focus:ring-red-500"
                              : "border-gray-200"
                          }`}
                          autoFocus
                        />
                      </div>
                      {isInvalid && (
                        <p className="text-xs text-red-600">URL inválida</p>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCancelSocial(key)}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isInvalid || loading}
                          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? "Salvando..." : "Salvar"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback */}
        {success && (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded p-2">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded p-2">
            <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span className="whitespace-pre-line">{error}</span>
          </div>
        )}

        {/* Botão salvar */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || uploadingAvatar}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || uploadingAvatar ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
