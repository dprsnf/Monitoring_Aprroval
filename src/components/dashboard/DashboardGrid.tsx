"use client";

import DashboardCard from "./DashboardCard";
import {
  Upload,
  CheckCircle,
  FileText,
  History,
  Monitor,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardGrid() {
  const { user } = useAuth();
  const division = user?.division;

  const menuConfig: Record<string, Array<{ title: string; description: string; icon: any; href: string; color: string; iconColor: string }>> = {
    Vendor: [
      {
        title: "Upload Drawing",
        description: "Melakukan Upload dokumen gambar",
        icon: Upload,
        href: "/upload-drawing",
        color: "bg-gradient-to-br from-[#14a2ba] to-[#125d72]",
        iconColor: "text-white",
      },
      {
        title: "Histori",
        description: "Histori hasil approval drawing",
        icon: History,
        href: "/approval-history",
        color: "bg-gradient-to-br from-purple-500 to-purple-600",
        iconColor: "text-white",
      },
      {
        title: "Progress Approval",
        description: "Lihat progres approval drawing",
        icon: Monitor,
        href: "/approval-progress",
        color: "bg-gradient-to-br from-orange-500 to-orange-600",
        iconColor: "text-white",
      },
    ],
    Engineer: [
      {
        title: "Approval Drawing",
        description: "Melakukan persetujuan gambar",
        icon: CheckCircle,
        href: "/documents/review-approval",
        color: "bg-gradient-to-br from-[#efe62f] to-[#f4d03f]",
        iconColor: "text-[#125d72]",
      },
      {
        title: "Histori",
        description: "Histori hasil approval drawing",
        icon: History,
        href: "/approval-history",
        color: "bg-gradient-to-br from-purple-500 to-purple-600",
        iconColor: "text-white",
      },
      {
        title: "Progress Approval",
        description: "Lihat progres approval drawing",
        icon: Monitor,
        href: "/approval-progress",
        color: "bg-gradient-to-br from-orange-500 to-orange-600",
        iconColor: "text-white",
      },
    ],
    Dalkon: [
      {
        title: "Upload Management",
        description: "Kelola dan review submission",
        icon: FileText,
        href: "/documents/review-management",
        color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        iconColor: "text-white",
      },
      {
        title: "Histori",
        description: "Histori hasil approval drawing",
        icon: History,
        href: "/approval-history",
        color: "bg-gradient-to-br from-purple-500 to-purple-600",
        iconColor: "text-white",
      },
      {
        title: "Progress Approval",
        description: "Lihat progres approval drawing",
        icon: Monitor,
        href: "/approval-progress",
        color: "bg-gradient-to-br from-orange-500 to-orange-600",
        iconColor: "text-white",
      },
    ],
    Manager: [
      {
        title: "Upload Management",
        description: "Kelola dan review submission",
        icon: FileText,
        href: "/documents/review-management",
        color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
        iconColor: "text-white",
      },
      {
        title: "Histori",
        description: "Histori hasil approval drawing",
        icon: History,
        href: "/approval-history",
        color: "bg-gradient-to-br from-purple-500 to-purple-600",
        iconColor: "text-white",
      },
      {
        title: "Progress Approval",
        description: "Lihat progres approval drawing",
        icon: Monitor,
        href: "/approval-progress",
        color: "bg-gradient-to-br from-orange-500 to-orange-600",
        iconColor: "text-white",
      },
    ],
  };

  const items = division ? menuConfig[division] || [] : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item, index) => (
        <DashboardCard key={index} {...item} />
      ))}
    </div>
  );
}