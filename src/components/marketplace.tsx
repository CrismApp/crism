"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, TrendingUp, Star, ExternalLink } from "lucide-react"

const protocols = [
  {
    name: "Uniswap V3",
    category: "DEX",
    tvl: "$4.2B",
    apy: "15.2%",
    risk: "Medium",
    description: "Leading decentralized exchange with concentrated liquidity",
    logo: "/placeholder.svg?height=40&width=40",
    rating: 4.8,
    users: "2.1M",
  },
  {
    name: "Compound",
    category: "Lending",
    tvl: "$2.8B",
    apy: "8.5%",
    risk: "Low",
    description: "Algorithmic money market protocol for lending and borrowing",
    logo: "/placeholder.svg?height=40&width=40",
    rating: 4.6,
    users: "890K",
  },
  {
    name: "Aave",
    category: "Lending",
    tvl: "$6.1B",
    apy: "12.3%",
    risk: "Low",
    description: "Open source and non-custodial liquidity protocol",
    logo: "/placeholder.svg?height=40&width=40",
    rating: 4.7,
    users: "1.5M",
  },
  {
    name: "Curve Finance",
    category: "DEX",
    tvl: "$3.9B",
    apy: "18.7%",
    risk: "Medium",
    description: "Decentralized exchange optimized for stablecoin trading",
    logo: "/placeholder.svg?height=40&width=40",
    rating: 4.5,
    users: "750K",
  },
  {
    name: "Yearn Finance",
    category: "Yield",
    tvl: "$1.2B",
    apy: "22.1%",
    risk: "High",
    description: "Yield optimization protocol for DeFi strategies",
    logo: "/placeholder.svg?height=40&width=40",
    rating: 4.4,
    users: "320K",
  },
  {
    name: "Balancer",
    category: "DEX",
    tvl: "$1.8B",
    apy: "14.9%",
    risk: "Medium",
    description: "Automated portfolio manager and trading platform",
    logo: "/placeholder.svg?height=40&width=40",
    rating: 4.3,
    users: "180K",
  },
]

const opportunities = [
  {
    protocol: "Uniswap V3",
    pair: "BTC/USDT",
    apy: "24.5%",
    tvl: "$125M",
    risk: "Medium",
    timeLeft: "5 days",
    minDeposit: "0.01 BTC",
  },
  {
    protocol: "Compound",
    pair: "BTC Lending",
    apy: "8.2%",
    tvl: "$890M",
    risk: "Low",
    timeLeft: "Ongoing",
    minDeposit: "0.001 BTC",
  },
  {
    protocol: "Yearn Finance",
    pair: "BTC Vault",
    apy: "31.7%",
    tvl: "$45M",
    risk: "High",
    timeLeft: "12 hours",
    minDeposit: "0.05 BTC",
  },
]

export function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "DEX", "Lending", "Yield", "Staking"]

  const filteredProtocols = protocols.filter((protocol) => {
    const matchesSearch =
      protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      protocol.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || protocol.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Low":
        return "bg-green-500/10 text-green-500"
      case "Medium":
        return "bg-orange-500/10 text-orange-500"
      case "High":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-3xl font-bold mb-2">DeFi Marketplace</h1>
          <p className="text-lg lg:text-base text-gray-400">Discover and invest in the best DeFi protocols on Citrea</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 lg:h-4 lg:w-4 text-gray-400" />
            <Input
              placeholder="Search protocols..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-orange-500/20 text-base lg:text-sm h-12 lg:h-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`text-base lg:text-sm px-4 py-2 lg:px-3 lg:py-1.5 whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="protocols" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="bg-gray-900/50 border border-orange-500/20 h-auto p-1 text-base lg:text-sm whitespace-nowrap inline-flex min-w-full lg:min-w-0">
              <TabsTrigger 
                value="protocols" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base whitespace-nowrap"
              >
                All Protocols
              </TabsTrigger>
              <TabsTrigger
                value="opportunities"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base whitespace-nowrap"
              >
                Hot Opportunities
              </TabsTrigger>
              <TabsTrigger 
                value="trending" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 lg:px-4 lg:py-2 text-sm lg:text-base whitespace-nowrap"
              >
                Trending
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="protocols">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProtocols.map((protocol, index) => (
                <Card
                  key={index}
                  className="p-6 bg-gray-900/50 border-orange-500/20 hover:border-orange-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={protocol.logo || "/placeholder.svg"}
                      alt={protocol.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{protocol.name}</h3>
                      <Badge className={getRiskColor(protocol.risk)}>{protocol.risk} Risk</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-orange-500 fill-current" />
                      <span className="text-sm text-gray-400">{protocol.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-4">{protocol.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">TVL</p>
                      <p className="font-semibold text-white">{protocol.tvl}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">APY</p>
                      <p className="font-semibold text-orange-400">{protocol.apy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Category</p>
                      <p className="font-semibold text-white">{protocol.category}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Users</p>
                      <p className="font-semibold text-white">{protocol.users}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600">Invest Now</Button>
                    <Button
                      variant="outline"
                      className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="opportunities">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity, index) => (
                <Card key={index} className="p-6 bg-gray-900/50 border-orange-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{opportunity.protocol}</h3>
                      <p className="text-sm text-gray-400">{opportunity.pair}</p>
                    </div>
                    <Badge className="bg-orange-500/10 text-orange-500">Hot</Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">APY</span>
                      <span className="text-lg font-bold text-orange-400">{opportunity.apy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">TVL</span>
                      <span className="text-sm text-white">{opportunity.tvl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Risk</span>
                      <Badge className={getRiskColor(opportunity.risk)}>{opportunity.risk}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Time Left</span>
                      <span className="text-sm text-white">{opportunity.timeLeft}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Min Deposit</span>
                      <span className="text-sm text-white">{opportunity.minDeposit}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Join Pool</Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {protocols.slice(0, 3).map((protocol, index) => (
                <Card key={index} className="p-6 bg-gray-900/50 border-orange-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <Badge className="bg-orange-500/10 text-orange-500">Trending #{index + 1}</Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <Image
                      src={protocol.logo || "/placeholder.svg"}
                      alt={protocol.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{protocol.name}</h3>
                      <p className="text-sm text-gray-400">{protocol.category}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">APY</p>
                      <p className="font-semibold text-orange-400">{protocol.apy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">TVL</p>
                      <p className="font-semibold text-white">{protocol.tvl}</p>
                    </div>
                  </div>

                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Explore</Button>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
