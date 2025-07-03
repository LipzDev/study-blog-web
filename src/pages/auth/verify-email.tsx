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
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  const handleVerification = async () => {
    try {
      await verifyEmail(token as string);
      setStatus("success");
      setMessage("Email verificado com sucesso! Você já pode fazer login.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao verificar email";
      setStatus("error");
      setMessage(errorMessage);
    }
  };

  useEffect(() => {
    if (token && typeof token === "string") {
      handleVerification();
    }
  }, [token, handleVerification]);

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
                  O link de verificação é inválido ou expirou.
                </p>
                <Link href="/auth/login">
                  <Button variant="primary">Voltar para o login</Button>
                </Link>
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
                  <div className="text-center">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Voltar para o login
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
                  <div className="space-y-2">
                    <Link href="/auth/login">
                      <Button variant="primary" className="w-full">
                        Voltar para o login
                      </Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button variant="outline" className="w-full">
                        Criar nova conta
                      </Button>
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
