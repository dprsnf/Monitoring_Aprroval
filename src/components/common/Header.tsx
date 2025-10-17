"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Home, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/app/types";

interface HeaderProps {
  currentUser?: User;
  title?: string;
  backHref?: string;
  backLabel?: string;
  showLogo?: boolean;
  onLogout?: () => void;
  onBack?: () => void; // <-- TAMBAHKAN INI
}

export default function Header({
  currentUser,
  title,
  backHref,
  backLabel,
  showLogo = false,
  onLogout,
  onBack, // <-- DESTRUKTUR
}: HeaderProps) {
  const router = useRouter();

  const handleBackOrDashboard = () => {
    if (onBack) {
      // Prioritaskan callback kustom dari halaman
      onBack();
    } else if (backHref !== undefined && backHref !== null) {
      // Jika backHref eksplisit diberikan (termasuk string kosong? hindari itu)
      router.push(backHref);
    } else {
      // Fallback ke dashboard
      router.push("/dashboard");
    }
  };

  // Tentukan apakah tombol back/home ditampilkan
  // Jika onBack atau backHref diberikan → tampilkan tombol
  // Jika tidak → tetap tampilkan tombol ke dashboard (opsional, bisa diubah)
  const showBackButton = onBack !== undefined || backHref !== undefined;

  return (
    <header className="bg-gradient-to-r from-[#125d72] to-[#14a2ba] shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {showBackButton && (
              <Button
                onClick={handleBackOrDashboard}
                className="bg-[#efe62f] hover:bg-[#125d72] text-gray-900 hover:text-white transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm flex items-center"
              >
                {onBack || (backHref && backHref.length > 0) ? (
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                ) : (
                  <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {onBack || (backHref && backHref.length > 0)
                    ? backLabel ?? "Kembali"
                    : "Dashboard"}
                </span>
              </Button>
            )}

            {title && (
              <>
                <div className="h-6 w-px bg-white/30 mx-2" />
                <h1 className="text-xs sm:text-sm lg:text-xl font-semibold text-white truncate">
                  {title}
                </h1>
              </>
            )}
          </div>

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
  );
}