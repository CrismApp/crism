"use client"

import { Coins, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface GoldDisplayProps {
  amount: number
  variant?: "default" | "compact" | "large" | "badge"
  showIcon?: boolean
  showLabel?: boolean
  animated?: boolean
  className?: string
  trend?: number // Positive for increase, negative for decrease
}

export function GoldDisplay({ 
  amount = 0,
  variant = "default", 
  showIcon = true, 
  showLabel = true,
  animated = false,
  className,
  trend
}: GoldDisplayProps) {

  const staticAmount = 30
  const formatGold = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toLocaleString()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "compact":
        return {
          container: "flex items-center gap-1",
          icon: "h-3 w-3",
          amount: "text-sm font-medium",
          label: "text-xs"
        }
      case "large":
        return {
          container: "flex items-center gap-3",
          icon: "h-6 w-6",
          amount: "text-2xl font-bold",
          label: "text-base"
        }
      case "badge":
        return {
          container: "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20",
          icon: "h-3 w-3",
          amount: "text-xs font-semibold",
          label: "text-xs"
        }
      default:
        return {
          container: "flex items-center gap-2",
          icon: "h-4 w-4",
          amount: "text-base font-semibold",
          label: "text-sm"
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={cn(styles.container, className)}>
      {showIcon && (
        <Coins className={cn(
          styles.icon,
          "text-orange-500",
          animated && "animate-pulse"
        )} />
      )}
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <span className={cn(
            styles.amount,
            "text-orange-400",
            animated && "animate-pulse"
          )}>
            {formatGold(staticAmount)}
          </span>
          
          {trend !== undefined && trend !== 0 && (
            <span className={cn(
              "text-xs",
              trend > 0 ? "text-green-400" : "text-red-400"
            )}>
              <TrendingUp className={cn(
                "h-3 w-3 inline",
                trend < 0 && "rotate-180"
              )} />
              {Math.abs(trend)}
            </span>
          )}
        </div>
        
        {showLabel && variant !== "badge" && (
          <span className={cn(styles.label, "text-gray-400")}>
            Gold
          </span>
        )}
      </div>
    </div>
  )
}

// Specialized components for different use cases
export function GoldBadge({ amount = 30, className }: { amount?: number; className?: string }) {
  return (
    <GoldDisplay
      amount={30} // Static amount
      variant="badge"
      showLabel={false}
      className={className}
    />
  )
}

export function GoldCounter({ 
  amount = 30, 
  trend, 
  animated = false,
  className 
}: { 
  amount?: number
  trend?: number
  animated?: boolean
  className?: string 
}) {
  return (
    <GoldDisplay
      amount={30} // Static amount
      variant="large"
      trend={trend}
      animated={animated}
      className={className}
    />
  )
}

export function CompactGold({ amount, className }: { amount: number; className?: string }) {
  return (
    <GoldDisplay
      amount={amount}
      variant="compact"
      showLabel={false}
      className={className}
    />
  )
}
