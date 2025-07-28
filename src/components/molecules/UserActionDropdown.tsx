import React from "react";
import { User, UserRole } from "@/types";
import { useAuth } from "@/hooks/useAuth";

interface UserActionDropdownProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onPromote: (user: User) => void;
  onDemote: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserActionDropdown({
  user,
  isOpen,
  onClose,
  onPromote,
  onDemote,
  onDelete,
}: UserActionDropdownProps) {
  const { user: currentUser } = useAuth();

  if (!isOpen) return null;

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdmin = currentUser?.role === UserRole.ADMIN || isSuperAdmin;

  const canDeleteUser = (user: User) => {
    if (isSuperAdmin) {
      return user.role !== UserRole.SUPER_ADMIN;
    }
    if (isAdmin) {
      return user.role === UserRole.USER;
    }
    return false;
  };

  const canPromoteUser = (user: User) => {
    return isSuperAdmin && user.role === UserRole.USER;
  };

  const canDemoteUser = (user: User) => {
    return isSuperAdmin && user.role === UserRole.ADMIN;
  };

  return (
    <>
      {/* Backdrop para fechar ao clicar fora */}
      <div className="fixed inset-0 z-10" onClick={onClose} />
      <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 animate-fade-in">
        <ul className="py-1 text-sm text-gray-700">
          {/* Verificar se é o próprio usuário */}
          {user.id === currentUser?.id && (
            <li>
              <span className="block px-4 py-2 text-gray-600 cursor-not-allowed">
                {isSuperAdmin
                  ? "Este usuário não pode ser gerenciado."
                  : "Você não pode gerenciar sua própria conta."}
              </span>
            </li>
          )}

          {/* SUPER ADMIN */}
          {isSuperAdmin && user.id !== currentUser?.id && (
            <>
              {user.role === UserRole.SUPER_ADMIN && (
                <li>
                  <span className="block px-4 py-2 text-gray-600 cursor-not-allowed">
                    Este usuário não pode ser gerenciado.
                  </span>
                </li>
              )}
              {user.role === UserRole.ADMIN && (
                <>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-orange-50"
                      onClick={() => {
                        if (canDemoteUser(user)) {
                          onDemote(user);
                          onClose();
                        }
                      }}
                      disabled={!canDemoteUser(user)}
                      style={
                        !canDemoteUser(user)
                          ? {
                              opacity: 0.5,
                              pointerEvents: "none",
                            }
                          : {}
                      }
                    >
                      Remover Admin
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                      onClick={() => {
                        if (canDeleteUser(user)) {
                          onDelete(user);
                          onClose();
                        }
                      }}
                      disabled={!canDeleteUser(user)}
                      style={
                        !canDeleteUser(user)
                          ? {
                              opacity: 0.5,
                              pointerEvents: "none",
                            }
                          : {}
                      }
                    >
                      Excluir Usuário
                    </button>
                  </li>
                </>
              )}
              {user.role === UserRole.USER && (
                <>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50"
                      onClick={() => {
                        if (canPromoteUser(user)) {
                          onPromote(user);
                          onClose();
                        }
                      }}
                      disabled={!canPromoteUser(user)}
                      style={
                        !canPromoteUser(user)
                          ? {
                              opacity: 0.5,
                              pointerEvents: "none",
                            }
                          : {}
                      }
                    >
                      Promover Admin
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                      onClick={() => {
                        if (canDeleteUser(user)) {
                          onDelete(user);
                          onClose();
                        }
                      }}
                      disabled={!canDeleteUser(user)}
                      style={
                        !canDeleteUser(user)
                          ? {
                              opacity: 0.5,
                              pointerEvents: "none",
                            }
                          : {}
                      }
                    >
                      Excluir Usuário
                    </button>
                  </li>
                </>
              )}
            </>
          )}

          {/* ADMIN (não super admin) */}
          {!isSuperAdmin && isAdmin && user.id !== currentUser?.id && (
            <>
              {user.role === UserRole.SUPER_ADMIN && (
                <li>
                  <span className="block px-4 py-2 text-gray-600 cursor-not-allowed">
                    Este usuário não pode ser gerenciado.
                  </span>
                </li>
              )}
              {user.role === UserRole.ADMIN && (
                <>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-orange-50"
                      disabled
                      style={{
                        opacity: 0.5,
                        pointerEvents: "none",
                      }}
                    >
                      Remover Admin
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                      disabled
                      style={{
                        opacity: 0.5,
                        pointerEvents: "none",
                      }}
                    >
                      Excluir
                    </button>
                  </li>
                </>
              )}
              {user.role === UserRole.USER && (
                <>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-blue-50"
                      disabled
                      style={{
                        opacity: 0.5,
                        pointerEvents: "none",
                      }}
                    >
                      Promover Admin
                    </button>
                  </li>
                  <li>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                      onClick={() => {
                        onDelete(user);
                        onClose();
                      }}
                    >
                      Excluir
                    </button>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </>
  );
}
