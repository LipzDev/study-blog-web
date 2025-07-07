import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Textarea } from "@/components/atoms/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { AlertCircle, Image as ImageIcon, Send } from "lucide-react";
import { createPostSchema, CreatePostFormData } from "@/utils/schemas";

interface PostFormProps {
  initialData?: Partial<CreatePostFormData>;
  onSubmit: (
    data: CreatePostFormData,
    imageFile?: File | null,
  ) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  mode?: "create" | "edit";
}

export const PostForm: React.FC<PostFormProps> = ({
  initialData,
  onSubmit,
  loading = false,
  error,
  mode = "create",
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    getImageUrl(initialData) || null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    mode: "onChange",
    defaultValues: initialData,
  });

  const titleValue = watch("title");

  // Gerar slug automático
  useEffect(() => {
    if (titleValue && mode === "create") {
      const slug = generateSlug(titleValue);
      setValue("slug", slug);
    }
  }, [titleValue, setValue, mode]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImagePreview(getImageUrl(initialData) || null);
    }
  }, [initialData, reset]);

  function generateSlug(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/[\s]+/g, "-");
  }

  function getImageUrl(data?: Partial<CreatePostFormData>) {
    if (!data) return null;
    if (data.image) {
      if (data.image.startsWith("http")) return data.image;
      return `http://localhost:3001${data.image.startsWith("/") ? data.image : "/" + data.image}`;
    }
    // Se quiser tratar imagePath, adicione aqui
    return null;
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione um arquivo de imagem válido");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue("image", "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "edit" ? "Editar Postagem" : "Criar Nova Postagem"}
        </CardTitle>
        <CardDescription>
          {mode === "edit"
            ? "Altere os campos abaixo para editar a postagem."
            : "Preencha os campos abaixo para criar uma nova postagem no blog"}
        </CardDescription>
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((data) => onSubmit(data, imageFile))}
          className="space-y-6"
        >
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
              disabled={mode === "edit"}
            />
            {errors.slug && (
              <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              O slug é gerado automaticamente baseado no título, mas você pode
              editá-lo
              {mode === "edit" && " (não pode ser alterado na edição)"}
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
              loading={loading}
              disabled={loading}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading
                ? mode === "edit"
                  ? "Salvando..."
                  : "Criando..."
                : mode === "edit"
                  ? "Salvar Alterações"
                  : "Criar Postagem"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
