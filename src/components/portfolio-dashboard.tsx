"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MetricsCard } from "@/components/metrics-card"
import { StatsChart } from "@/components/stats-chart"
import { VaultTable } from "@/components/vault-table"
import { TransactionHistory } from "@/components/transaction-history"
import { DeFiPositions } from "@/components/defi-positions"
import { YieldFarming } from "@/components/yield-farming"
import { CrossChainBridge } from "@/components/cross-chain-bridge"
import { HamburgerMenu } from "@/components/ui/hamburger-menu"
import { Sidebar } from "@/components/sidebar"
import { RefreshCw, AlertCircle } from "lucide-react"
import { PortfolioAPI } from '@/lib/api'

// Transaction interface
interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  valueFormatted: number
  gasPrice: string
  gasUsed?: string
  blockNumber: number
  timestamp?: number
  status?: string
  type?: 'sent' | 'received'
}

// Portfolio data interface
interface PortfolioData {
  totalBalance: number
  totalBalanceUSD: number
  dailyChange: number
  totalDeposits: number
  accruedYield: number
  positions: number
  activeYields: number
  transactions: Transaction[]
  tokens: unknown[]
  balance: number
  balanceUSD: number
  totalValue: number
  transactionCount: number
}

interface PortfolioDashboardProps {
  walletAddress: string
  onDisconnect: () => void
}

export function PortfolioDashboard({ walletAddress, onDisconnect }: PortfolioDashboardProps) {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const portfolioAPI = useMemo(() => new PortfolioAPI(), [])

  // Basic fallback data (without mock transactions)
  const mockData: PortfolioData = useMemo(() => ({
    totalBalance: 0,
    totalBalanceUSD: 0,
    dailyChange: 0,
    totalDeposits: 0,
    accruedYield: 0,
    positions: 0,
    activeYields: 0,
    transactions: [], // Empty transactions array
    tokens: [], // Empty tokens array
    balance: 0,
    balanceUSD: 0,
    totalValue: 0,
    transactionCount: 0
  }), [])

  const fetchPortfolioData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      // Directly call the API without timeout
      const data = await portfolioAPI.getPortfolioData(walletAddress)
      
      // Debug log to see the actual data structure
      console.log('Portfolio data received:', data)
      console.log('Transactions in data:', data?.transactions)
      
      // Validate transaction data
      if (!data.transactions || data.transactions.length === 0) {
        console.warn("No transactions found in portfolio data");
      }
      
      setPortfolioData(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error)
      
      // Set error message
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch portfolio data"
      setError(errorMessage)
      
      // Use basic fallback data if no real data exists
      if (!portfolioData) {
        console.warn("Using fallback portfolio data due to fetch error.")
        setPortfolioData(mockData)
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [portfolioAPI, portfolioData, walletAddress, mockData])

  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  const handleRefresh = () => {
    fetchPortfolioData(true)
  }

  // Show loading spinner only on initial load
  if (isLoading && !portfolioData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-500">Loading your portfolio...</p>
          <p className="text-gray-400 text-sm mt-2">This may take some time as we scan the blockchain...</p>
          <p className="text-gray-400 text-xs mt-1">We&apos;re scanning up to 1000 blocks on the Citrea network</p>
        </div>
      </div>
    )
  }

  // Use mock data if no portfolio data exists
  const displayData = portfolioData || mockData

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid lg:grid-cols-[280px_1fr]">
        {/* Hamburger Menu with Sidebar */}
        <HamburgerMenu>
          <Sidebar 
            walletAddress={walletAddress} 
            onDisconnect={onDisconnect}
          />
        </HamburgerMenu>

        {/* Main Content */}
        <main className="p-6 lg:p-6 pt-20 lg:pt-6 pr-20 lg:pr-6">{/* Add top padding on mobile for hamburger button and right padding for hamburger */}
          <div className="mb-6 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">Portfolio Overview</h1>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-400">Last updated: {lastUpdated.toLocaleTimeString()}</div>
                {error && (
                  <div className="flex items-center gap-1 text-yellow-500 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    <span>Using cached/mock data</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="gap-2 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium text-yellow-500">Portfolio data may be outdated</p>
                  <p className="text-xs text-gray-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Portfolio Metrics */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <MetricsCard
              title="Total Balance"
              value={`${displayData.totalBalance} BTC`}
              change={{
                value: `$${displayData.totalBalanceUSD?.toLocaleString() || '0'}`,
                percentage: `${displayData.dailyChange || 0}%`,
                isPositive: (displayData.dailyChange || 0) > 0,
              }}
            />
            <MetricsCard
              title="Total Deposits"
              value={`$${displayData.totalDeposits?.toLocaleString() || '0'}`}
              change={{ value: "$1,340", percentage: "+13.2%", isPositive: true }}
            />
            <MetricsCard
              title="Accrued Yield"
              value={`$${displayData.accruedYield?.toLocaleString() || '0'}`}
              change={{ value: "$1,340", percentage: "+1.2%", isPositive: true }}
            />
            <MetricsCard
              title="Active Positions"
              value={(displayData.positions || 0).toString()}
              change={{ value: `${displayData.activeYields || 0} yielding`, percentage: "+2", isPositive: true }}
            />
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-900/50 border border-orange-500/20">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-black"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger value="defi" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                DeFi Positions
              </TabsTrigger>
              <TabsTrigger value="yield" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                Yield Farming
              </TabsTrigger>
              <TabsTrigger value="bridge" className="data-[state=active]:bg-orange-500 data-[state=active]:text-black">
                Cross-Chain
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-black"
              >
                Transactions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="p-6 bg-gray-900/50 border-orange-500/20">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Portfolio Performance</h2>
                </div>
                <StatsChart />
              </Card>
              <VaultTable />
            </TabsContent>

            <TabsContent value="defi">
              <DeFiPositions />
            </TabsContent>

            <TabsContent value="yield">
              <YieldFarming />
            </TabsContent>

            <TabsContent value="bridge">
              <CrossChainBridge />
            </TabsContent>

            <TabsContent value="transactions">
              <TransactionHistory 
                walletAddress={walletAddress}
                transactions={displayData.transactions || []}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}