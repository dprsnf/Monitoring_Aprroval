import { Status } from "@/app/types"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  CheckCircle,
  User,
  Send,
  XCircle,
  Ban,
} from "lucide-react"

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const badges = {
    [Status.submitted]: { color: "yellow", icon: Clock, text: "Submitted" },
    [Status.inReviewConsultant]: {
      color: "blue",
      icon: User,
      text: "In Review Consultant",
    },
    [Status.inReviewEngineering]: {
      color: "blue",
      icon: User,
      text: "In Review Engineering",
    },
    [Status.inReviewManager]: {
      color: "cyan",
      icon: User,
      text: "In Review Manager",
    },
    [Status.approved]: {
      color: "green",
      icon: CheckCircle,
      text: "Approved",
    },
    [Status.approvedWithNotes]: {
      color: "green",
      icon: CheckCircle,
      text: "Approved with Notes",
    },
    [Status.returnForCorrection]: {
      color: "orange",
      icon: Send,
      text: "Return for Correction",
    },
    [Status.rejected]: { color: "red", icon: XCircle, text: "Rejected" },
    [Status.overdue]: { color: "red", icon: Ban, text: "Overdue" },
  }

  const badge = badges[status]
  if (!badge) return null

  const Icon = badge.icon
  const colorClasses = {
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
    green: "bg-green-100 text-green-800 border-green-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    red: "bg-red-100 text-red-800 border-red-200",
  }

  const badgeClass = colorClasses[badge.color as keyof typeof colorClasses]

  return (
    <Badge className={`${badgeClass} border hover:${badgeClass}`}>
      <Icon className="w-3 h-3 mr-1" />
      {badge.text}
    </Badge>
  )
}