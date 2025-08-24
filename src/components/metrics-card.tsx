import { Card } from "@/components/ui/card"
import { ArrowUpRight } from "lucide-react"
import type React from "react" 

interface MetricsCardProps {
  title: string
  value: string
  change: {
    value: string
    percentage: string
    isPositive: boolean
  }
  chart?: React.ReactNode
}

export function MetricsCard({ title, value, change, chart }: MetricsCardProps) {
  return (
    <Card className="p-4 lg:p-6 bg-gray-900/50 border-orange-500/20 hover:border-orange-500/40 transition-all duration-200">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-sm lg:text-xs text-gray-400 font-medium">{title}</h3>
        {chart ? <ArrowUpRight className="h-4 w-4 lg:h-3 lg:w-3 text-gray-400" /> : null}
      </div>
      <div className="flex items-end justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xl lg:text-2xl font-bold text-white truncate" title={value}>{value}</p>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <span className="text-sm lg:text-xs text-gray-300">{change.value}</span>
            <span className={`text-sm lg:text-xs font-medium ${change.isPositive ? "text-green-400" : "text-red-400"}`}>
              {change.percentage}
            </span>
          </div>
        </div>
        {chart && <div className="ml-2 flex-shrink-0">{chart}</div>}
      </div>
    </Card>
  )
}
