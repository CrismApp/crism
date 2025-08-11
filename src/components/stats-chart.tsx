"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const data = [
  { date: "Mar", value: 300 },
  { date: "Apr", value: 350 },
  { date: "May", value: 200 },
  { date: "Jun", value: 400 },
  { date: "Jul", value: 300 },
  { date: "Aug", value: 200 },
  { date: "Sep", value: 450 },
  { date: "Oct", value: 500 },
  { date: "Nov", value: 480 },
  { date: "Dec", value: 400 },
  { date: "Jan", value: 350 },
  { date: "Feb", value: 400 },
]

export function StatsChart() {
  return (
    <ChartContainer
      config={{
        value: {
          label: "Portfolio Value",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px] w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="value" stroke="#ff6b00" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
