"use client"

import { useState, cloneElement, isValidElement } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface HamburgerMenuProps {
  children: React.ReactNode
  className?: string
}

export function HamburgerMenu({ children, className }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  // Clone children and pass the closeMenu function
  const childrenWithProps = isValidElement(children) 
    ? cloneElement(children, { onNavigate: closeMenu } as any)
    : children

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="lg:hidden fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="icon"
          className="bg-gray-900/90 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black backdrop-blur-sm"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // Base styles
          "border-r border-orange-500/20 bg-gray-900/50 backdrop-blur flex flex-col",
          // Desktop styles
          "lg:relative lg:translate-x-0",
          // Mobile styles
          "lg:block fixed inset-y-0 left-0 z-40 w-80 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {childrenWithProps}
      </aside>
    </>
  )
}
