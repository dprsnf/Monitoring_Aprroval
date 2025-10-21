// context/AuthContext.tsx
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { User, Role } from "@/app/types" // Impor tipe User Anda
import Cookies from "js-cookie"
import { jwtDecode } from "jwt-decode" // <-- Impor library baru

// Tipe untuk payload JWT Anda
// SESUAIKAN INI dengan isi payload JWT Anda
// Saya asumsikan payload-nya berisi semua field dari 'User'
interface JwtPayload extends User {
  iat: number // Issued At
  exp: number // Expiration Time
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Tetap true untuk cek cookie

  // Fungsi untuk Logout (TETAP SAMA)
  const logout = () => {
    Cookies.remove("access_token")
    Cookies.remove("refresh_token")
    setUser(null)
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  // Ganti 'fetchUser' dengan 'checkUser'
  const checkUser = () => {
    setIsLoading(true)
    try {
      const token = Cookies.get("access_token")

      if (!token) {
        // Tidak ada token, user tidak login
        setUser(null)
        setIsLoading(false)
        return
      }

      // 1. Dekode token
      const decodedPayload = jwtDecode<JwtPayload>(token)

      // 2. Cek apakah token sudah kedaluwarsa
      const currentTimeInSeconds = Date.now() / 1000
      if (decodedPayload.exp < currentTimeInSeconds) {
        // Token kedaluwarsa
        console.warn("Token kedaluwarsa, menjalankan logout.")
        logout() // Jalankan logout untuk membersihkan cookie
      } else {
        // Token valid dan belum kedaluwarsa
        // Ekstrak data user dari payload
        const userData: User = {
          id: decodedPayload.id,
          email: decodedPayload.email,
          name: decodedPayload.name,
          role: decodedPayload.role,
          // ... tambahkan field lain dari 'User' jika ada
        }
        setUser(userData)
      }
    } catch (error) {
      // Error jika token tidak valid/rusak
      console.error("Gagal mendekode token:", error)
      setUser(null)
      Cookies.remove("access_token") // Bersihkan token yang rusak
      Cookies.remove("refresh_token")
    } finally {
      setIsLoading(false)
    }
  }

  // Jalankan checkUser() saat komponen pertama kali di-mount
  useEffect(() => {
    checkUser()
  }, []) // Dependency array kosong agar hanya jalan sekali

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom Hook (TETAP SAMA)
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider")
  }
  return context
}