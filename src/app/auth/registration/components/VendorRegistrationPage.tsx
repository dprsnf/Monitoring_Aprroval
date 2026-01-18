"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Building, Lock, Mail, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ApiErrorResponse, FormErrors } from "@/app/types";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

export default function VendorRegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    // telepon: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error saat user mengetik
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsLoading(true);

    // Validasi sederhana
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = "Nama perusahaan wajib diisi";
    // if (!formData.telepon.trim()) errors.telepon = "Nomor telepon wajib diisi";
    if (!formData.email.trim()) errors.email = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      errors.email = "Format email tidak valid";
    if (!formData.password) errors.password = "Password wajib diisi";
    else if (formData.password.length < 8)
      errors.password = "Password minimal 8 karakter";
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Password tidak cocok";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("/auth/register", {
        email: formData.email,
        name: formData.name,
        password: formData.password,
        division: "Vendor",
      });

      console.log("Register success:", response.data);
      alert("Registrasi berhasil! Silakan login.");
      window.location.href = "/login";
    } catch (error: unknown) {
      console.error("Registration error:", error);
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
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 70%)",
          width: "300%",
          height: "300%",
          top: "-100%",
          left: "-100%",
          transform: "rotate(30deg)",
          filter: "blur(12px)",
        }}
        animate={{
          x: ["-20%", "120%"],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Card utama */}
      <motion.div
        className="w-full max-w-xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Back to Login
        <div className="mb-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </div> */}

        <Card className="bg-white border border-gray-200 shadow-xl">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo_pln.png"
                alt="PLN Logo"
                height={90}
                width={140}
              />
            </div>
            <h1 className="text-2xl font-bold mb-2">Registrasi Vendor</h1>
            <p className="text-sm px-3">
              Daftar sebagai mitra PLN UPT Manado untuk mengakses sistem
              approval
            </p>
          </div>

          <CardContent className="px-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {apiError && (
                <div className="bg-red-500 text-white px-4 py-3 rounded-md text-sm text-center">
                  {apiError}
                </div>
              )}
              {/* Nama Perusahaan */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className={cn(
                    "font-semibold block",
                    formErrors.name ? "text-red-500" : "text-[#354052]"
                  )}
                >
                  Nama Perusahaan *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white",
                      formErrors.name
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    )}
                    placeholder="PT. Nama Perusahaan"
                  />
                </div>
              </div>

              {/* No Telepon */}
              {/* <div className="space-y-2">
                <label
                  htmlFor="telepon"
                  className={cn(
                    "font-semibold block",
                    formErrors.telepon ? "text-red-500" : "text-[#354052]"
                  )}
                >
                  No. Telepon *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="telepon"
                    name="telepon"
                    type="tel"
                    required
                    value={formData.telepon}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white",
                      formErrors.telepon
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    )}
                    placeholder="021-xxxxxxxx atau 08xxxxxxxxxx"
                  />
                </div>
              </div> */}

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={cn(
                    "font-semibold block",
                    formErrors.email ? "text-red-500" : "text-[#354052]"
                  )}
                >
                  Email Perusahaan *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-lg border transition-all duration-200 text-gray-900 placeholder-gray-500 bg-white",
                      formErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500"
                    )}
                    placeholder="info@perusahaan.com"
                  />
                </div>
              </div>

              <div className="flex sm:flex-row flex-col space-x-3">
                {/* Password */}
                <div className="space-y-2">
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Minimal 8 karakter"
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

                {/* Konfirmasi Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="font-semibold mb-2 block text-[#354052] text-sm"
                  >
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:border-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                      placeholder="Ulangi password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#14a2ba] hover:bg-[#11889d] text-white font-semibold py-5 px-4 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center justify-center gap-2">
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "DAFTAR"
                  )}
                </div>
              </Button>

              {/* Login Link */}
              <div className="text-center pt-2">
                <p className="text-sm text-gray-600">
                  Sudah punya akun?{" "}
                  <Link
                    href="/login"
                    className="text-[#14a2ba] hover:underline font-medium"
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
