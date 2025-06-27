import React from "react";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  // Função para obter a URL completa do avatar
  const getAvatarUrl = (avatarPath: string | null) => {
    if (!avatarPath) return null;

    // Se já é uma URL completa (http, blob ou data), retorna como está
    if (
      avatarPath.startsWith("http") ||
      avatarPath.startsWith("blob:") ||
      avatarPath.startsWith("data:")
    ) {
      return avatarPath;
    }

    // Se é uma URL relativa, adiciona a base da API
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${apiBase}${avatarPath}`;
  };

  // Classes de tamanho
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // Classes para o ícone
  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  // Classes para o texto
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  if (src) {
    return (
      <img
        src={getAvatarUrl(src) || ""}
        alt={alt}
        className={`rounded-full object-cover border-2 border-blue-200 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 ${sizeClasses[size]} ${className}`}
    >
      {name ? (
        <span className={`font-bold text-blue-600 ${textSizeClasses[size]}`}>
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className={`text-blue-600 ${iconSizeClasses[size]}`} />
      )}
    </div>
  );
}
