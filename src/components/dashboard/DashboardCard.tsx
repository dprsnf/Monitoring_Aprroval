"use client"

import Link from "next/link"
import { ChevronRight, LucideIcon } from "lucide-react"

interface DashboardCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  color: string
  iconColor: string
}

export default function DashboardCard({
  title,
  description,
  icon: Icon,
  href,
  color,
  iconColor,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="group relative bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-4 sm:p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out hover:border-white/50"
    >
      {/* Icon */}
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200 shadow-md`}
      >
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColor}`} />
      </div>

      {/* Content */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 group-hover:text-[#125d72] transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow Icon */}
      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#14a2ba] group-hover:text-[#125d72] transform group-hover:translate-x-1" />
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#14a2ba]/5 to-[#efe62f]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Link>
  )
}
