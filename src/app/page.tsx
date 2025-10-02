"use client";

import Image from "next/image";
import Link from "next/link";
import { Upload, CheckCircle, History, Monitor, ChevronRight, TrendingUp, Clock, X, Activity, ChevronDown, User, Wallet, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const dashboardItems = [
    {
      title: "Upload Drawing",
      description: "Melakukan Upload dokumen gambar",
      icon: Upload,
      href: "/vendor-upload",
      color: "bg-gradient-to-br from-[#14a2ba] to-[#125d72]",
      iconColor: "text-white"
    },
    {
      title: "Approval Drawing",
      description: "Melakukan persetujuan gambar",
      icon: CheckCircle,
      href: "/approval",
      color: "bg-gradient-to-br from-[#efe62f] to-[#f4d03f]",
      iconColor: "text-[#125d72]"
    },
    {
      title: "Upload Management",
      description: "Kelola dan review submission",
      icon: FileText,
      href: "/upload-management",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconColor: "text-white"
    },
    {
      title: "Histori",
      description: "Histori hasil approval drawing",
      icon: History,
      href: "/history",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconColor: "text-white"
    },
    {
      title: "Progress Approval",
      description: "Lihat progres approval drawing",
      icon: Monitor,
      href: "/progress",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white"
    },
  ];

  return (
    <div className="min-h-screen bg-[#14a2ba]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_PLN.png/960px-Logo_PLN.png"
                  alt="PLN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-sm sm:text-xl font-semibold text-white">
                Dashboard Approval PLN
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="flex items-center gap-1 sm:gap-3 bg-[#efe62f] hover:bg-[#125d72] border border-white/20 rounded-lg px-2 sm:px-3 py-2 transition-all duration-200 h-auto text-gray-900 hover:text-white shadow-sm hover:shadow-md">
                    <div className="text-xs sm:text-sm font-medium">
                      <span className="hidden sm:inline">Nama Pengguna</span>
                      <span className="sm:hidden">User</span>
                    </div>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-100 shadow-xl rounded-lg">
                  <DropdownMenuLabel className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 rounded-t-lg">
                    <div className="py-1">
                      <p className="text-sm font-semibold text-gray-900">Nama Pengguna</p>
                      <p className="text-xs text-[#14a2ba]">user@pln.co.id</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-100" />

                  <DropdownMenuItem
                    className="hover:bg-red-50 cursor-pointer transition-all duration-200 focus:bg-red-100 mx-1 my-1 rounded-md"
                    onClick={() => console.log("Logout clicked")}
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-600">Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 text-center p-4 sm:p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
            Dashboard Approval PLN
          </h2>
          <p className="text-gray-700 text-sm sm:text-lg">
            PT PLN (Persero) - Sistem Monitoring & Approval Drawing
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {dashboardItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out hover:border-white/50"
            >
              {/* Icon */}
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${item.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200 shadow-md`}>
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 group-hover:text-[#125d72] transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Arrow Icon */}
              <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#14a2ba] group-hover:text-[#125d72] transform group-hover:translate-x-1" />
              </div>

              {/* Subtle gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#14a2ba]/5 to-[#efe62f]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-green-700 font-medium">Approve</p>
                <p className="text-lg sm:text-2xl font-bold text-green-800">24</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center shadow-md">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-800">7</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center shadow-md">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-red-700 font-medium">Reject</p>
                <p className="text-lg sm:text-2xl font-bold text-red-800">3</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-md">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-[#14a2ba] font-medium">Progress</p>
                <p className="text-lg sm:text-2xl font-bold text-[#125d72]">99.9%</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#14a2ba]/20 to-[#125d72]/20 rounded-full flex items-center justify-center shadow-md">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[#125d72]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
