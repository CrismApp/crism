"use client"

import { useState, cloneElement, isValidElement } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface HamburgerMenuProps {
  children: React.ReactNode
  className?: string
}

export function HamburgerMenu({ children, className }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  // Clone children and pass the closeMenu function
  const childrenWithProps = isValidElement(children) 
    ? cloneElement(children, { onNavigate: closeMenu } as { onNavigate: () => void })
    : children

  return (
    <>
      {/* Mobile Header with Logo and Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900/90 backdrop-blur-md border-b border-orange-500/20">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Image src="/crism-logo.png" alt="CRISM Logo" width={32} height={32} className="h-8 w-8" />
         
          </div>
          
          {/* Hamburger Button */}
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="outline"
            size="icon"
            className="bg-transparent border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black h-10 w-10"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Desktop Sidebar - Always visible */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col border-r border-orange-500/20 bg-gray-900/50 backdrop-blur",
          className
        )}
      >
        {childrenWithProps}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Mobile Sidebar - Slides from right */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 right-0 z-50 w-80 transform transition-transform duration-300 ease-in-out bg-gray-900/95 backdrop-blur-md border-l border-orange-500/20 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {childrenWithProps}
      </aside>
    </>
  )
}
