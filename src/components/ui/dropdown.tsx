"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType | undefined>(undefined)

function useDropdown() {
  const context = React.useContext(DropdownContext)
  if (!context) {
    throw new Error("useDropdown must be used within a Dropdown")
  }
  return context
}

interface DropdownProps {
  children: React.ReactNode
}

function Dropdown({ children }: DropdownProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

interface DropdownTriggerProps {
  children: React.ReactNode
  className?: string
}

function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { open, setOpen } = useDropdown()

  return (
    <button
      type="button"
      className={cn("inline-flex items-center", className)}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="true"
    >
      {children}
    </button>
  )
}

interface DropdownContentProps {
  children: React.ReactNode
  className?: string
  align?: "left" | "right"
}

function DropdownContent({ children, className, align = "right" }: DropdownContentProps) {
  const { open, setOpen } = useDropdown()
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  )
}

interface DropdownItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "danger"
}

function DropdownItem({ children, onClick, className, variant = "default" }: DropdownItemProps) {
  const { setOpen } = useDropdown()

  const handleClick = () => {
    onClick?.()
    setOpen(false)
  }

  return (
    <button
      type="button"
      className={cn(
        "w-full text-left px-4 py-2 text-sm transition-colors duration-150",
        variant === "default" 
          ? "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" 
          : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div className={cn("h-px bg-gray-200 dark:bg-gray-600 my-1", className)} />
  )
}

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
}