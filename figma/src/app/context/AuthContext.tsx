import React, { createContext, useContext, useState } from "react";

export type UserRole = "personal" | "aluno";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_PERSONAL: AuthUser = {
  name: "Carlos Mendes",
  email: "carlos@up4life.com",
  role: "personal",
};

const MOCK_ALUNO: AuthUser = {
  name: "Ana Paula",
  email: "ana@up4life.com",
  role: "aluno",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_PERSONAL);

  const login = (_email: string, _password: string, role: UserRole) => {
    setUser(role === "personal" ? MOCK_PERSONAL : MOCK_ALUNO);
  };

  const logout = () => setUser(null);

  const switchRole = (role: UserRole) => {
    setUser(role === "personal" ? MOCK_PERSONAL : MOCK_ALUNO);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
