import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, LoginFormData } from "@/utils/schemas";
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
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

export function LoginForm() {
  const { login, checkVerificationStatus, resendVerification } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
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

  // Verificar status de verificação quando email mudar
  useEffect(() => {
    if (email && email.includes("@")) {
      const checkVerification = async () => {
        try {
          const verified = await checkVerificationStatus(email);
          setIsVerified(verified);
          if (!verified) {
            setVerificationMessage("Verifique seu email antes de logar");
            // Limpar mensagem após 10 segundos
            setTimeout(() => setVerificationMessage(null), 10000);
          } else {
            setVerificationMessage(null);
          }
        } catch (error) {
          // Silenciar erro, não mostrar mensagem de erro para verificação
        }
      };

      const timeoutId = setTimeout(checkVerification, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [email, checkVerificationStatus]);

  const handleResendVerification = async () => {
    if (!email) return;

    try {
      setIsResending(true);
      await resendVerification(email);
      setVerificationMessage(
        "Email de verificação reenviado! Verifique sua caixa de entrada.",
      );
      setTimeout(() => setVerificationMessage(null), 5000);
    } catch (error: any) {
      setError(error.message || "Erro ao reenviar verificação");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data.email, data.password)
        .then(() => {
          router.push("/");
        })
        .catch((err: any) => {
          setError(err.message || "Erro ao fazer login");
        });
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
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
              href="/register"
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
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}

              {verificationMessage && (
                <div className="flex flex-col space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-yellow-700 font-medium">
                      {verificationMessage}
                    </span>
                  </div>
                  {isVerified === false && email && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      loading={isResending}
                      disabled={isResending}
                      className="self-start text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      Reenviar verificação
                    </Button>
                  )}
                </div>
              )}

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
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Esqueceu sua senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
