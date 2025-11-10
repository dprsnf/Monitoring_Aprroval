"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback, 
} from "react";
import { User } from "@/app/types";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface JwtPayload extends User {
  iat: number; // Issued At
  exp: number; // Expiration Time
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  //logout function
  const logout = useCallback(() => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, []); 

  const checkUser = useCallback(() => {
    setIsLoading(true);
    try {
      const token = Cookies.get("access_token");

      if (!token) {
        // No token found, user is not logged in
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Decode Token
      const decodedPayload = jwtDecode<JwtPayload>(token);

      // Check token expiration
      const currentTimeInSeconds = Date.now() / 1000;
      if (decodedPayload.exp < currentTimeInSeconds) {
        // Token has expired
        console.warn("Token kedaluwarsa, menjalankan logout.");
        logout(); // Logout for clear cookies and user state
      } else {
        // Token is valid and not expired
        // extract user data from payload
        const userData: User = {
          id: decodedPayload.id,
          email: decodedPayload.email,
          name: decodedPayload.name,
          division: decodedPayload.division,
        };
        setUser(userData);
        console.log(setUser)
      }
    } catch (error) {
      // Error if token is invalid/corrupted
      console.error("Gagal mendekode token:", error);
      setUser(null);
      Cookies.remove("access_token"); // clear invalid token
      Cookies.remove("refresh_token");
    } finally {
      setIsLoading(false);
    }
  }, [logout]); 

  // running checkUser() when component is mounted
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
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};