import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sprout, Clock, Target, Zap } from "lucide-react"

const yieldFarms = [
  {
    name: "BTC-USDT Farm",
    protocol: "PancakeSwap",
    apy: "24.5%",
    tvl: "$2.4M",
    staked: "$5,200",
    rewards: "0.0045 BTC",
    rewardsUSD: "$123.45",
    lockPeriod: "30 days",
    timeLeft: "12 days",
    progress: 60,
    status: "Active",
  },
  {
    name: "BTC Single Stake",
    protocol: "Compound",
    apy: "8.2%",
    tvl: "$15.6M",
    staked: "$8,900",
    rewards: "0.0023 BTC",
    rewardsUSD: "$62.89",
    lockPeriod: "Flexible",
    timeLeft: "Anytime",
    progress: 100,
    status: "Active",
  },
  {
    name: "BTC-ETH LP",
    protocol: "Uniswap V3",
    apy: "18.7%",
    tvl: "$8.9M",
    staked: "$3,400",
    rewards: "0.0031 BTC",
    rewardsUSD: "$84.67",
    lockPeriod: "7 days",
    timeLeft: "2 days",
    progress: 85,
    status: "Active",
  },
]

export function YieldFarming() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sprout className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Total Staked</span>
          </div>
          <div className="text-2xl font-bold text-white">$17,500</div>
          <div className="text-sm text-green-500">+$450 this week</div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Pending Rewards</span>
          </div>
          <div className="text-2xl font-bold text-white">0.0099 BTC</div>
          <div className="text-sm text-orange-400">$271.01</div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Average APY</span>
          </div>
          <div className="text-2xl font-bold text-white">17.1%</div>
          <div className="text-sm text-green-500">+2.3% vs last month</div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Active Farms</span>
          </div>
          <div className="text-2xl font-bold text-white">3</div>
          <div className="text-sm text-gray-400">Across 3 protocols</div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {yieldFarms.map((farm, index) => (
          <Card key={index} className="p-6 bg-gray-900/50 border-orange-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-white">{farm.name}</h3>
                <p className="text-sm text-gray-400">{farm.protocol}</p>
              </div>
              <Badge className="bg-green-500/10 text-green-500">{farm.status}</Badge>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">APY</span>
                <span className="text-sm font-semibold text-orange-400">{farm.apy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">TVL</span>
                <span className="text-sm text-white">{farm.tvl}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Staked</span>
                <span className="text-sm text-white">{farm.staked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Rewards</span>
                <div className="text-right">
                  <div className="text-sm text-white">{farm.rewards}</div>
                  <div className="text-xs text-gray-400">{farm.rewardsUSD}</div>
                </div>
              </div>
            </div>

            {farm.lockPeriod !== "Flexible" && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Lock Period</span>
                  <span className="text-white">{farm.timeLeft} left</span>
                </div>
                <Progress value={farm.progress} className="h-2" />
              </div>
            )}

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-orange-500 hover:bg-orange-600">
                Claim Rewards
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent"
              >
                Manage
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
