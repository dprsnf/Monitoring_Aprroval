"use client"

import DashboardCard from "./DashboardCard"
import {
  Upload,
  CheckCircle,
  FileText,
  History,
  Monitor,
} from "lucide-react"

export default function DashboardGrid() {
  const dashboardItems = [
    {
      title: "Upload Drawing",
      description: "Melakukan Upload dokumen gambar",
      icon: Upload,
      href: "/vendor-upload",
      color: "bg-gradient-to-br from-[#14a2ba] to-[#125d72]",
      iconColor: "text-white",
    },
    {
      title: "Approval Drawing",
      description: "Melakukan persetujuan gambar",
      icon: CheckCircle,
      href: "/approval",
      color: "bg-gradient-to-br from-[#efe62f] to-[#f4d03f]",
      iconColor: "text-[#125d72]",
    },
    {
      title: "Upload Management",
      description: "Kelola dan review submission",
      icon: FileText,
      href: "/upload-management",
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconColor: "text-white",
    },
    {
      title: "Histori",
      description: "Histori hasil approval drawing",
      icon: History,
      href: "/history",
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconColor: "text-white",
    },
    {
      title: "Progress Approval",
      description: "Lihat progres approval drawing",
      icon: Monitor,
      href: "/progress",
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconColor: "text-white",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {dashboardItems.map((item, index) => (
        <DashboardCard key={index} {...item} />
      ))}
    </div>
  )
}
