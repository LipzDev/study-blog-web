import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { registerSchema, RegisterFormData } from "@/utils/schemas";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await registerUser(data.name, data.email, data.password);

      setSuccess(
        "Conta criada com sucesso! Verifique seu email para confirmar a conta.",
      );
      reset();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar conta";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Crie sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              entre na sua conta existente
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro</CardTitle>
            <CardDescription>
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-green-700">{success}</span>
                </div>
              )}

              {!success && (
                <>
                  <Input
                    label="Nome completo"
                    type="text"
                    placeholder="Seu nome completo"
                    error={errors.name?.message}
                    {...register("name")}
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="seu@email.com"
                    error={errors.email?.message}
                    {...register("email")}
                  />

                  <PasswordInput
                    label="Senha"
                    placeholder="Mínimo 6 caracteres"
                    error={errors.password?.message}
                    {...register("password")}
                  />

                  <PasswordInput
                    label="Confirmar senha"
                    placeholder="Confirme sua senha"
                    error={errors.confirmPassword?.message}
                    {...register("confirmPassword")}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Criar conta
                  </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
