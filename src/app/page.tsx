"use client"

import Header from "@/components/common/Header"
import DashboardGrid from "@/components/dashboard/DashboardGrid"
import DashboardStats from "@/components//dashboard/DashboardStats"
import { Division } from "./types"

export default function Home() {
  const currentUser = {
    id: 0,
    name: "Guest",
    email: "guest@example.com",
    division: Division.Dalkon,
  }

  const handleLogout = () => console.log("Logout clicked")

  return (
    <div className="min-h-screen bg-[#14a2ba]">
      <Header currentUser={currentUser} showLogo onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 text-center p-4 sm:p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
            Dashboard Approval PLN
          </h2>
          <p className="text-gray-700 text-sm sm:text-lg">
            PT PLN (Persero) UPT Manado - Sistem Monitoring & Approval Drawing
          </p>
        </div>

        {/* Dashboard Grid */}
        <DashboardGrid />

        {/* Quick Stats */}
        <DashboardStats />
      </main>
    </div>
  )
}
