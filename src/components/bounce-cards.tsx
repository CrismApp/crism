"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, AnimatePresence, type PanInfo } from "framer-motion"
import { cn } from "@/lib/utils"

interface BounceCardProps {
  children: React.ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  isActive?: boolean
  zIndex?: number
}

export function BounceCard({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  isActive = true,
  zIndex = 0,
}: BounceCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const constraintsRef = useRef<HTMLDivElement>(null)

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const threshold = 100

    if (info.offset.x > threshold) {
      onSwipeRight?.()
    } else if (info.offset.x < -threshold) {
      onSwipeLeft?.()
    }
  }

  return (
    <div ref={constraintsRef} className="relative w-full h-full">
      <motion.div
        drag={isActive ? "x" : false}
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{
          scale: 1.05,
          rotate: isDragging ? (Math.random() - 0.5) * 10 : 0,
          zIndex: 1000,
        }}
        animate={{
          scale: isActive ? 1 : 0.95,
          opacity: isActive ? 1 : 0.7,
          zIndex: zIndex,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "absolute inset-0 cursor-grab active:cursor-grabbing",
          "bg-card border border-border rounded-lg shadow-lg",
          "backdrop-blur-sm",
          className,
        )}
        style={{ zIndex }}
      >
        {children}
      </motion.div>
    </div>
  )
}

interface BounceCardsStackProps {
  children: React.ReactNode[]
  className?: string
  onCardSwipe?: (index: number, direction: "left" | "right") => void
}

export function BounceCardsStack({ children, className, onCardSwipe }: BounceCardsStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSwipe = (direction: "left" | "right") => {
    onCardSwipe?.(currentIndex, direction)
    if (currentIndex < children.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  return (
    <div className={cn("relative w-full h-96", className)}>
      <AnimatePresence>
        {children.map((child, index) => {
          const isVisible = index >= currentIndex && index < currentIndex + 3
          if (!isVisible) return null

          return (
            <BounceCard
              key={index}
              isActive={index === currentIndex}
              zIndex={children.length - index}
              onSwipeLeft={() => handleSwipe("left")}
              onSwipeRight={() => handleSwipe("right")}
              className={cn(
                index === currentIndex && "shadow-xl",
                index === currentIndex + 1 && "transform translate-y-2 scale-95",
                index === currentIndex + 2 && "transform translate-y-4 scale-90",
              )}
            >
              {child}
            </BounceCard>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
