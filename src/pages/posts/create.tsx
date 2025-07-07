import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { Layout } from "@/components/templates/Layout";
import { Button } from "@/components/atoms/Button";
import { Textarea } from "@/components/atoms/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { createPostSchema, CreatePostFormData } from "@/utils/schemas";
import { apiService } from "@/services/api";
import { AlertCircle, ArrowLeft, Send, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { AxiosError } from "axios";

function CreatePostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    mode: "onChange",
  });

  const titleValue = watch("title");

  // Função para gerar slug automático baseado no título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s]+/g, "-");
  };

  // Atualiza o slug automaticamente quando o título muda
  React.useEffect(() => {
    if (titleValue) {
      const slug = generateSlug(titleValue);
      setValue("slug", slug);
    }
  }, [titleValue, setValue]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar se é uma imagem válida
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione um arquivo de imagem válido");
        return;
      }

      // Verificar tamanho do arquivo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("A imagem deve ter no máximo 5MB");
        return;
      }

      setImageFile(file);

      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("image", "");
  };

  const onSubmit = async (data: CreatePostFormData) => {
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
          console.error("Erro ao fazer upload da imagem:", uploadError);
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

      // Redirecionar para o post criado
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

  // Verificar se o usuário tem permissão para criar posts
  const canCreatePost = !!user;

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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/posts">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para postagens
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar Nova Postagem</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para criar uma nova postagem no blog
            </CardDescription>
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Título */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  placeholder="Digite o título da postagem"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.title.message}
                  </p>
                )}
              </div>

              {/* Slug */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  placeholder="slug-da-postagem"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register("slug")}
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.slug.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  O slug é gerado automaticamente baseado no título, mas você
                  pode editá-lo
                </p>
              </div>

              {/* Imagem */}
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagem (opcional)
                </label>

                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <ImageIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Clique para selecionar uma imagem
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG até 5MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <Textarea
                label="Conteúdo *"
                placeholder="Digite o conteúdo da postagem..."
                rows={12}
                error={errors.text?.message}
                helperText="Mínimo de 50 caracteres"
                {...register("text")}
              />

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? "Criando..." : "Criar Postagem"}
                </Button>
                <Link href="/posts" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

export default CreatePostPage;
