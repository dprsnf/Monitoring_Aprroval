import { Status } from "@/app/types"

interface FilterSectionProps {
  searchTerm: string
  filterStatus: string
  onSearchChange: (value: string) => void
  onFilterChange: (value: string) => void
}

export default function FilterSection({
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
}: FilterSectionProps) {
  return (
    <div className="mb-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#125d72] focus:border-transparent"
        />
        <select
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#125d72] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value={Status.submitted}>Submitted</option>
          <option value={Status.inReviewEngineering}>
            In Review Engineering
          </option>
          <option value={Status.approved}>Approved</option>
          <option value={Status.approvedWithNotes}>
            Approved with Notes
          </option>
          <option value={Status.returnForCorrection}>
            Return for Correction
          </option>
          <option value={Status.rejected}>Rejected</option>
        </select>
      </div>
    </div>
  )
}