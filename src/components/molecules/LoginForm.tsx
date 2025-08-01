import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginFormData } from "@/utils/schemas";
import { Button } from "@/components/atoms/Button";
import { PasswordInput } from "@/components/atoms/PasswordInput";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export function LoginForm() {
  const { login, resendVerification, checkVerificationStatus } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const email = watch("email");

  useEffect(() => {
    if (email) {
      setCurrentEmail(email);
    }
  }, [email]);

  const handleResendVerification = async () => {
    if (!currentEmail) return;

    try {
      setIsResending(true);
      await resendVerification(currentEmail);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao reenviar verificação";
      setError(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setShowResendButton(false);

      await login(data.email, data.password);
      router.push("/");
    } catch (err: unknown) {
      let errorMessage = "Erro ao fazer login";

      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as any;
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.status === 401) {
          errorMessage = "Credenciais inválidas";
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      if (
        errorMessage.toLowerCase().includes("verificar") ||
        errorMessage.toLowerCase().includes("verificado") ||
        errorMessage.toLowerCase().includes("confirme")
      ) {
        try {
          const isVerified = await checkVerificationStatus(data.email);

          if (!isVerified) {
            setShowResendButton(true);
            setCurrentEmail(data.email);
            setError("Verifique seu email antes de fazer login");
            return;
          }
        } catch (verificationError: unknown) {
          console.warn("Erro ao verificar status:", verificationError);
        }
      }

      const normalizedError = errorMessage
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Remove acentos

      const emailNotFoundPatterns = [
        "nao encontrado",
        "nao existe",
        "user not found",
        "usuario nao encontrado",
        "email nao encontrado",
      ];

      const isEmailNotFound = emailNotFoundPatterns.some((pattern) =>
        normalizedError.includes(pattern),
      );

      if (isEmailNotFound) {
        setError(
          `O email "${data.email}" não está cadastrado em nossa plataforma. Verifique se digitou corretamente ou crie uma nova conta.`,
        );
        return;
      }

      if (
        errorMessage.toLowerCase().includes("credenciais") ||
        errorMessage.toLowerCase().includes("invalid") ||
        errorMessage.toLowerCase().includes("401")
      ) {
        setError(
          "Email ou senha incorretos. Verifique suas credenciais e tente novamente.",
        );
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
      setIsCheckingVerification(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Entre na sua conta
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ou{" "}
            <Link
              href="/auth/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              crie uma nova conta
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Digite suas credenciais para acessar sua conta
            </CardDescription>
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            {showResendButton && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendVerification}
                  loading={isResending}
                  disabled={isResending}
                  className="w-full text-blue-700 border-blue-300 hover:bg-blue-100 hover:text-blue-800"
                >
                  Reenviar verificação de email
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:bg-white focus:text-black"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <PasswordInput
                label="Senha"
                placeholder="Sua senha"
                error={errors.password?.message}
                {...register("password")}
              />

              <div className="flex items-center justify-between">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading || isCheckingVerification}
                disabled={isLoading || isCheckingVerification}
              >
                {isCheckingVerification ? "Verificando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
