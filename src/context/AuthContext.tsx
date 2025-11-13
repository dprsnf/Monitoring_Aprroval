// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@/app/types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface JwtPayload extends User {
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ← Mulai true

  const logout = useCallback(() => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setUser(null);
    window.location.href = "/auth/login";
  }, []);

  const checkUser = useCallback(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      setUser(null);
      setIsLoading(false); // ← SELESAI LOADING
      return;
    }

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      setUser({
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        division: decoded.division,
      });
    } catch (error) {
      console.error("Token invalid:", error);
      logout();
    } finally {
      setIsLoading(false); // ← PASTIKAN INI ADA
    }
  }, [logout]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth harus di dalam AuthProvider");
  return context;
};