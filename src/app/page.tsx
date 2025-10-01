"use client";

import Image from "next/image";
import Link from "next/link";
import { Upload, CheckCircle, History, Monitor, ChevronRight, TrendingUp, Clock, X, Activity, ChevronDown, User, Wallet, LogOut } from "lucide-react";
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
      href: "/upload",
      color: "bg-blue-600"
    },
    {
      title: "Approval Drawing",
      description: "Melakukan persetujuan gambar",
      icon: CheckCircle,
      href: "/approval",
      color: "bg-yellow-500"
    },
    {
      title: "Histori",
      description: "Histori hasil approval drawing",
      icon: History,
      href: "/histori",
      color: "bg-blue-500"
    },
    {
      title: "Progress Approval",
      description: "Lihat progres approval drawing",
      icon: Monitor,
      href: "/progress",
      color: "bg-yellow-600"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-blue-600 shadow-lg border-b border-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_PLN.png/960px-Logo_PLN.png"
                  alt="PLN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold text-white">
                Dashboard Approval PLN
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 hover:bg-blue-700 rounded-lg px-3 py-2 transition-colors h-auto">
                    <div className="text-sm text-blue-100">
                      Nama Pengguna
                    </div>
                    <div className="w-8 h-8 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-900">NP</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-blue-100" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DropdownMenuLabel>
                    <div>
                      <p className="text-sm font-medium">Nama Pengguna</p>
                      <p className="text-xs text-muted-foreground">user@pln.co.id</p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => console.log("Profile clicked")}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors focus:bg-blue-100 dark:focus:bg-blue-800/30"
                  >
                    <User className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => console.log("Dana clicked")}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors focus:bg-blue-100 dark:focus:bg-blue-800/30"
                  >
                    <Wallet className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Dana
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors focus:bg--100 dark:focus:bg-blue-800/30"
                    onClick={() => console.log("Logout clicked")}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Dashboard Approval PLN
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            PT PLN (Persero) - Sistem Monitoring & Approval Drawing
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:scale-105 transition-all duration-200 ease-in-out"
            >
              {/* Icon */}
              <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Arrow Icon */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approve</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">24</p>
              </div>
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">7</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reject</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3</p>
              </div>
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">99.9%</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
