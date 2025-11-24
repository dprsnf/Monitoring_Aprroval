"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, User, Lock, Mail, Building, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ApiErrorResponse, FormErrors } from "@/app/types";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    division: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setFormErrors({});
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setApiError("Password dan konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        division: formData.division,
        password: formData.password,
      });

      router.push("/login");
    } catch (error: unknown) {
      if (isAxiosError<ApiErrorResponse>(error)) {
        const message =
          error.response?.data?.message || "Terjadi kesalahan pada server.";
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
      {/* glossy animation */}
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
        animate={{ x: ["0%", "100%"] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
          ease: "easeInOut",
        }}
      />

      {/* main card */}
      <motion.div
        className="w-full max-w-xl z-10"
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
                height={70}
                width={125}
              />
            </div>
            <h1 className="text-xl font-bold mb-2">Daftar Akun Baru</h1>
            <p className="text-sm">Lengkapi data di bawah untuk membuat akun</p>
          </div>

          <CardContent className="px-8">
            <form onSubmit={handleSubmit} className="space-y-2">
              {apiError && (
                <div className="bg-red-500 text-white px-4 py-3 rounded-md text-sm text-center">
                  {apiError}
                </div>
              )}

              {/* Nama Lengkap */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className={cn(
                    "font-semibold mb-2 block text-sm",
                    formErrors.name ? "text-red-500" : "text-[#354052]"
                  )}
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={cn(
                    "font-semibold mb-2 block text-sm",
                    formErrors.email ? "text-red-500" : "text-[#354052]"
                  )}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Masukkan email PLN"
                  />
                </div>
              </div>

              {/* Divisi */}
              <div className="space-y-2">
                <label
                  htmlFor="division"
                  className="font-semibold mb-2 block text-[#354052] text-sm"
                >
                  Divisi
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    id="division"
                    name="division"
                    required
                    value={formData.division}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="">Pilih Divisi</option>
                    <option value="Dalkon">Dalkon</option>
                    <option value="Engineer">Engineer</option>
                  </select>
                </div>
              </div>

              {/* Password & Konfirmasi */}
              <div className="flex sm:flex-row flex-col sm:space-x-3 space-y-3 sm:space-y-0">
                {/* Password */}
                <div className="space-y-2 w-full">
                  <label
                    htmlFor="password"
                    className={cn(
                      "font-semibold mb-2 block text-sm",
                      formErrors.password ? "text-red-500" : "text-[#354052]"
                    )}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="Minimal 8 karakter"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div className="space-y-2 w-full">
                  <label
                    htmlFor="confirmPassword"
                    className="font-semibold mb-2 block text-[#354052] text-sm"
                  >
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="Ulangi password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tombol Submit */}
              <Button
                type="submit"
                className="w-full bg-[#14a2ba] hover:bg-[#11889d] text-white font-semibold mt-3 py-5 px-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "DAFTAR"
                  )}
                </div>
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Sudah punya akun?{" "}
                  <Link
                    href="/auth/login"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                  >
                    Masuk di sini
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
