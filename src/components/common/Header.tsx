"use client"

import Link from "next/link"
import { ChevronLeft, ChevronDown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/app/types" // ⬅️ gunakan User dari types.ts

interface HeaderProps {
  currentUser?: User // ⬅️ langsung pakai interface User
  title?: string
  backHref?: string
  backLabel?: string
  showLogo?: boolean
  onLogout?: () => void
}

export default function Header({
  currentUser,
  title,
  backHref,
  backLabel,
  showLogo = false,
  onLogout,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* === LEFT SECTION === */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">

            {/* 🔹 Jika `showLogo` true, tampilkan versi dashboard */}
            {showLogo ? (
              <>
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center p-1 sm:p-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_PLN.png/960px-Logo_PLN.png"
                    alt="PLN Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-sm sm:text-xl font-semibold text-white truncate">
                  Dashboard Approval PLN
                </h1>
              </>
            ) : (
              <>
                {/* 🔹 Jika tidak pakai logo, tampilkan tombol kembali dan judul halaman */}
                {backHref && (
                  <Link href={backHref}>
                    <Button className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">
                        {backLabel ?? "Kembali"}
                      </span>
                    </Button>
                  </Link>
                )}
                {title && (
                  <>
                    {backHref && <div className="h-6 w-px bg-white/30 mx-2" />}
                    <h1 className="text-xs sm:text-sm lg:text-xl font-semibold text-white truncate">
                      {title}
                    </h1>
                  </>
                )}
              </>
            )}
          </div>

          {/* === RIGHT SECTION === */}
          {currentUser && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 sm:px-3 py-1.5 sm:py-2 rounded-lg">
                    <span className="hidden sm:inline text-xs sm:text-sm font-medium mr-1">
                      {currentUser.name.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-48 sm:w-56 bg-white border border-gray-100 shadow-xl rounded-lg"
                >
                  <DropdownMenuLabel className="bg-gradient-to-r from-[#125d72]/10 to-[#14a2ba]/10 rounded-t-lg">
                    <div className="py-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-[#14a2ba]">
                        {currentUser.role} - PLN
                      </p>
                      <p className="text-xs text-gray-600">
                        {currentUser.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className="bg-gray-100" />

                  <DropdownMenuItem
                    className="hover:bg-red-50 cursor-pointer transition-all duration-200 focus:bg-red-100 mx-1 my-1 rounded-md"
                    onClick={onLogout ?? (() => console.log("Logout clicked"))}
                  >
                    <LogOut className="mr-2 h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-600">Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
