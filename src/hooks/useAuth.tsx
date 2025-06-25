import { useState, useEffect, createContext, useContext } from "react";
import { User } from "@/types";
import { apiService } from "@/services/api";

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const user = await apiService.getProfile();
          setUser(user);
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
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao fazer login");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await apiService.register({ name, email, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erro ao registrar");
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
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao enviar email de recuperação",
      );
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      await apiService.resetPassword({ token, password });
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao redefinir senha",
      );
    }
  };

  const resendVerification = async (email: string) => {
    try {
      await apiService.resendVerification(email);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao reenviar verificação",
      );
    }
  };

  const checkVerificationStatus = async (email: string): Promise<boolean> => {
    try {
      const response = await apiService.checkVerificationStatus(email);
      return response.data?.verified || false;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
          "Erro ao verificar status de verificação",
      );
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await apiService.verifyEmail(token);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Erro ao verificar email",
      );
    }
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
