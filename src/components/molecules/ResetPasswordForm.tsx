import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { resetPasswordSchema, ResetPasswordFormData } from "@/utils/schemas";
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
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export function ResetPasswordForm() {
  const { resetPassword, checkVerificationStatus } = useAuth();
  const router = useRouter();
  const { token } = router.query;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Verificar status de verificação quando token for carregado
  useEffect(() => {
    if (token && typeof token === "string") {
      const checkEmailVerification = async () => {
        try {
          // Aqui você precisaria extrair o email do token ou fazer uma chamada para obter o email
          // Por enquanto, vamos assumir que o token contém informações sobre o usuário
          // Na implementação real, você pode decodificar o JWT ou fazer uma chamada para a API
          setIsCheckingVerification(false);
          setIsEmailVerified(true); // Assumindo que está verificado por padrão
        } catch (error) {
          setIsCheckingVerification(false);
          setIsEmailVerified(false);
        }
      };

      checkEmailVerification();
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || typeof token !== "string") {
      setError("Token de redefinição inválido");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await resetPassword(token, data.password);

      setSuccess(
        "Senha redefinida com sucesso! Redirecionando para o login...",
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao redefinir senha");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Token inválido
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  O link de redefinição de senha é inválido ou expirou.
                </p>
                <Link href="/forgot-password">
                  <Button variant="primary">Solicitar novo link</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isCheckingVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">
                  Verificando status da conta...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isEmailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Email não verificado
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Você precisa verificar seu email antes de alterar sua senha.
                </p>
                <div className="space-y-2">
                  <Link href="/login">
                    <Button variant="primary" className="w-full">
                      Voltar para o login
                    </Button>
                  </Link>
                  <Link href="/forgot-password">
                    <Button variant="outline" className="w-full">
                      Solicitar novo link
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Redefinir senha
          </h2>
          <p className="mt-2 text-sm text-gray-600">Digite sua nova senha</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Nova senha</CardTitle>
            <CardDescription>
              Escolha uma nova senha para sua conta
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

              <PasswordInput
                label="Nova senha"
                placeholder="Mínimo 6 caracteres"
                error={errors.password?.message}
                {...register("password")}
              />

              <PasswordInput
                label="Confirmar nova senha"
                placeholder="Confirme sua nova senha"
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Redefinir senha
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para o login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
