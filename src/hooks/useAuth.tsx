import { useState, useEffect, createContext, useContext } from "react";
import { User } from "@/types";
import { apiService } from "@/services/api";

// Função utilitária para tratar erros da API
const handleApiError = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    } else if (axiosError.message) {
      return axiosError.message;
    }
  } else if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  checkVerificationStatus: (email: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          const user = await apiService.getProfile();
          setUser(user);
          // Atualizar localStorage com dados frescos
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
    } catch (error: unknown) {
      let errorMessage = handleApiError(error, "Erro ao fazer login");

      // Tratamento específico para erro 401
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 401) {
          errorMessage = "Credenciais inválidas";
        }
      }

      throw new Error(errorMessage);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await apiService.register({ name, email, password });
    } catch (error: unknown) {
      let errorMessage = handleApiError(error, "Erro ao registrar");

      // Tratamento específico para erro 409
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.status === 409) {
          errorMessage = "Usuário com este email já existe";
        }
      }

      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    try {
      await apiService.forgotPassword({ email });
    } catch (error: unknown) {
      const errorMessage = handleApiError(
        error,
        "Erro ao enviar email de recuperação",
      );
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await apiService.resetPassword({ token, password });
    } catch (error: unknown) {
      const errorMessage = handleApiError(error, "Erro ao redefinir senha");
      throw new Error(errorMessage);
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await apiService.resendVerification(email);
    } catch (error: unknown) {
      const errorMessage = handleApiError(
        error,
        "Erro ao reenviar verificação",
      );
      throw new Error(errorMessage);
    }
  };

  const checkVerificationStatus = async (email: string): Promise<boolean> => {
    try {
      const response = await apiService.checkVerificationStatus(email);
      return response.verified || false;
    } catch (error: unknown) {
      console.warn("Erro ao verificar status:", error);
      return false;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await apiService.verifyEmail(token);
    } catch (error: unknown) {
      const errorMessage = handleApiError(error, "Erro ao verificar email");
      throw new Error(errorMessage);
    }
  };

  const updateUser = (user: User) => {
    console.log("Updating user in context:", {
      github: user.github,
      linkedin: user.linkedin,
      twitter: user.twitter,
      instagram: user.instagram,
    });
    setUser(user);
    // Atualizar também no localStorage para manter consistência
    localStorage.setItem("user", JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        resendVerification,
        checkVerificationStatus,
        verifyEmail,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
