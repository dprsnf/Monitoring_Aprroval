"use client"

import { TrendingUp, Clock, X, Activity } from "lucide-react"

export default function DashboardStats() {
  const stats = [
    {
      label: "Approve",
      value: "24",
      color: "text-green-700",
      bg: "from-green-100 to-green-200",
      icon: TrendingUp,
    },
    {
      label: "Pending",
      value: "7",
      color: "text-yellow-600",
      bg: "from-yellow-100 to-yellow-200",
      icon: Clock,
    },
    {
      label: "Reject",
      value: "3",
      color: "text-red-700",
      bg: "from-red-100 to-red-200",
      icon: X,
    },
    {
      label: "Progress",
      value: "99.9%",
      color: "text-[#125d72]",
      bg: "from-[#14a2ba]/20 to-[#125d72]/20",
      icon: Activity,
    },
  ]

  return (
    <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((s, i) => (
        <div
          key={i}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs sm:text-sm font-medium ${s.color}`}>
                {s.label}
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {s.value}
              </p>
            </div>
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${s.bg} rounded-full flex items-center justify-center shadow-md`}
            >
              <s.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${s.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
