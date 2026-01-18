"use client";

import Link from "next/link";
import { Upload, CheckCircle, History, Monitor, ChevronRight, FileText } from "lucide-react";

export interface DashboardItem {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  iconColor: string;
}

const dashboardItems: DashboardItem[] = [
  {
    title: "Upload Drawing",
    description: "Melakukan Upload dokumen gambar",
    icon: Upload,
    href: "/vendor-upload",
    color: "bg-linear-to-br from-[#14a2ba] to-[#125d72]",
    iconColor: "text-white"
  },
  {
    title: "Approval Drawing",
    description: "Melakukan persetujuan gambar",
    icon: CheckCircle,
    href: "/approval",
    color: "bg-linear-to-br from-[#efe62f] to-[#f4d03f]",
    iconColor: "text-[#125d72]"
  },
  {
    title: "Upload Management",
    description: "Kelola dan review submission",
    icon: FileText,
    href: "/upload-management",
    color: "bg-linear-to-br from-emerald-500 to-emerald-600",
    iconColor: "text-white"
  },
  {
    title: "Histori",
    description: "Histori hasil approval drawing",
    icon: History,
    href: "/history",
    color: "bg-linear-to-br from-purple-500 to-purple-600",
    iconColor: "text-white"
  },
  {
    title: "Progress Approval",
    description: "Lihat progres approval drawing",
    icon: Monitor,
    href: "/progress",
    color: "bg-linear-to-br from-orange-500 to-orange-600",
    iconColor: "text-white"
  },
];

export default function MainCard() {
  return (
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
          <div className="absolute inset-0 bg-linear-to-br from-[#14a2ba]/5 to-[#efe62f]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </Link>
      ))}
    </div>
  );
}