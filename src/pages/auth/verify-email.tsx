import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { token } = router.query;
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "idle"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleVerification = async () => {
      if (!token || typeof token !== "string") return;

      try {
        setStatus("loading");
        await verifyEmail(token);
        setStatus("success");
        setMessage("Email verificado com sucesso! Você já pode fazer login.");

        // Redirecionar automaticamente para o login após 3 segundos
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro ao verificar email";
        setStatus("error");
        setMessage(errorMessage);
      }
    };

    if (token && typeof token === "string") {
      handleVerification();
    } else if (token === undefined) {
      // Ainda carregando os query params
      setStatus("loading");
    } else {
      // Token não existe ou é inválido
      setStatus("error");
      setMessage("Token de verificação inválido");
    }
  }, [token, verifyEmail, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              {status === "loading" && (
                <>
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Verificando email...
                  </h3>
                  <p className="text-sm text-gray-600">
                    Aguarde enquanto verificamos seu email.
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email verificado!
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{message}</p>
                  <p className="text-xs text-gray-500 mb-4">
                    Você será redirecionado automaticamente em alguns
                    segundos...
                  </p>
                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Ir para o login agora
                    </Link>
                  </div>
                </>
              )}

              {status === "error" && (
                <>
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Erro na verificação
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">{message}</p>
                  <div className="flex justify-center items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Ir para o login
                    </Link>
                    <span className="text-sm text-gray-500">ou</span>
                    <Link
                      href="/auth/register"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Criar nova conta
                    </Link>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
