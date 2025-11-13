"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ApiErrorResponse, FormErrors } from "@/app/types";
import api from "@/lib/axios";
import Cookies from "js-cookie";
import { isAxiosError } from "axios";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiError, setApiError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setApiError("");
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { accessToken, refreshToken } = response.data;
      Cookies.set("access_token", accessToken, { expires: 1, secure: true });
      Cookies.set("refresh_token", refreshToken, { expires: 7, secure: true });
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      if (isAxiosError<ApiErrorResponse>(error)) {
        const message =
          error.response?.data?.message || "Alamat Email/Kata Sandi Salah.";
        setApiError(message);
      } else {
        setApiError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Efek glossy bergerak */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
          width: "200%",
          height: "200%",
          top: "-50%",
          left: "-100%",
          transform: "rotate(45deg)",
        }}
        animate={{
          x: ["0%", "100%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "easeInOut",
        }}
      />

      {/* Card utama */}
      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="bg-white border border-gray-200 shadow-xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/Logo_PLN.svg"
                alt="PLN Logo"
                height={90}
                width={140}
              />
            </div>
            <h1 className="text-2xl font-bold mb-2">Selamat Datang</h1>
            <p className="text-sm">Silahkan Masuk Untuk Mengakses Approval</p>
          </div>

          <CardContent className="px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {apiError && (
                <div className="bg-red-500 text-white px-4 py-3 rounded-md text-sm text-center">
                  {apiError}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={cn(
                    "font-semibold mb-2 block",
                    formErrors.email ? "text-red-500" : "text-[#354052]"
                  )}
                >
                  Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white",
                      formErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    )}
                    placeholder="Masukkan email Anda"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className={cn(
                    "font-semibold mb-2 block",
                    formErrors.password ? "text-red-500" : "text-[#354052]"
                  )}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(
                      "w-full pl-10 pr-12 py-3 rounded-lg border transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white",
                      formErrors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    )}
                    placeholder="Masukkan password Anda"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Lupa password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#14a2ba] hover:bg-[#11889d] text-white font-semibold py-5 px-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "MASUK"
                  )}
                </div>
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
