import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

const defiPositions = [
  {
    protocol: "Uniswap V3",
    position: "BTC/USDT LP",
    value: "$12,450",
    apy: "15.2%",
    dailyEarnings: "+$18.75",
    status: "Active",
    risk: "Medium",
  },
  {
    protocol: "Compound",
    position: "Lending BTC",
    value: "$8,900",
    apy: "4.8%",
    dailyEarnings: "+$1.17",
    status: "Active",
    risk: "Low",
  },
  {
    protocol: "Aave",
    position: "Borrowing USDT",
    value: "-$5,200",
    apy: "3.2%",
    dailyEarnings: "-$0.46",
    status: "Active",
    risk: "Medium",
  },
  {
    protocol: "Curve",
    position: "BTC Pool",
    value: "$15,600",
    apy: "8.9%",
    dailyEarnings: "+$3.81",
    status: "Active",
    risk: "Low",
  },
]

export function DeFiPositions() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Total DeFi Value</span>
          </div>
          <div className="text-2xl font-bold text-white">$31,750</div>
          <div className="text-sm text-green-500">+$23.27 today</div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Average APY</span>
          </div>
          <div className="text-2xl font-bold text-white">9.3%</div>
          <div className="text-sm text-green-500">+0.8% this week</div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Active Positions</span>
          </div>
          <div className="text-2xl font-bold text-white">4</div>
          <div className="text-sm text-gray-400">Across 4 protocols</div>
        </Card>
      </div>

      <Card className="bg-gray-900/50 border-orange-500/20">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">DeFi Positions</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-orange-500/20">
                <TableHead>Protocol</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>APY</TableHead>
                <TableHead>Daily Earnings</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {defiPositions.map((position, index) => (
                <TableRow key={index} className="border-orange-500/10">
                  <TableCell className="font-medium">{position.protocol}</TableCell>
                  <TableCell>{position.position}</TableCell>
                  <TableCell className={position.value.startsWith("-") ? "text-red-400" : "text-green-400"}>
                    {position.value}
                  </TableCell>
                  <TableCell className="text-orange-400">{position.apy}</TableCell>
                  <TableCell className={position.dailyEarnings.startsWith("-") ? "text-red-400" : "text-green-400"}>
                    {position.dailyEarnings}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        position.risk === "Low" ? "secondary" : position.risk === "Medium" ? "default" : "destructive"
                      }
                    >
                      {position.risk}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-500/10 text-green-500">{position.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
