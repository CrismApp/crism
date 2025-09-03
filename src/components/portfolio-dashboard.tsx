"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MetricsCard } from "@/components/metrics-card"
import { StatsChart } from "@/components/stats-chart"
import { TransactionHistory } from "@/components/transaction-history"
import { DeFiPositions } from "@/components/defi-positions"
import { YieldFarming } from "@/components/yield-farming"
import { CrossChainBridge } from "@/components/cross-chain-bridge"
import { TokenList } from "@/components/token-list"
import { ProfilePage } from "@/components/profile-page"
import { HamburgerMenu } from "@/components/ui/hamburger-menu"
import { Sidebar } from "@/components/sidebar"
import { useUser } from "@/context/UserContext"
import { RefreshCw, AlertCircle, User, Wallet } from "lucide-react"
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

// Token interface
interface Token {
  symbol: string
  balanceFormatted: number
  balanceUSD?: number
  address?: string
  decimals?: number
  valueUSD: number
  formattedBalance: string
  percentage: number
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
  tokens: Token[]
  balance: number
  balanceUSD: number
  totalValue: number
  transactionCount: number
  nativeBalance?: number
}

// Cache interface for storing fetched data
interface CachedData {
  data: PortfolioData
  timestamp: number
  walletAddress: string
}

interface PortfolioDashboardProps {
  walletAddress?: string
  onDisconnect: () => void
  onWalletConnect: (address: string) => void
}

// Cache duration: 30 seconds
const CACHE_DURATION = 30 * 1000

export function PortfolioDashboard({ walletAddress, onDisconnect, onWalletConnect }: PortfolioDashboardProps) {
  const { user } = useUser()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [activeTab, setActiveTab] = useState("overview")
  const [showProfile, setShowProfile] = useState(false)
  
  // Use refs to persist data and API instance
  const portfolioAPI = useRef(new PortfolioAPI())
  const dataCache = useRef<CachedData | null>(null)
  const isFetching = useRef(false)

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

  // Check if cache is valid
  const isCacheValid = useCallback((cache: CachedData | null) => {
    if (!cache) return false
    if (cache.walletAddress !== walletAddress) return false
    const isExpired = Date.now() - cache.timestamp > CACHE_DURATION
    return !isExpired
  }, [walletAddress])

  // Get cached data if valid
  const getCachedData = useCallback(() => {
    if (isCacheValid(dataCache.current)) {
      return dataCache.current!.data
    }
    return null
  }, [isCacheValid])

  const fetchPortfolioData = useCallback(async (forceRefresh = false) => {
    // Only fetch if wallet is connected
    if (!walletAddress) {
      setPortfolioData(mockData)
      setIsInitialLoading(false)
      return
    }

    // Prevent multiple simultaneous fetches
    if (isFetching.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping...')
      return
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = getCachedData()
      if (cachedData) {
        console.log('Using cached portfolio data')
        setPortfolioData(cachedData)
        setIsInitialLoading(false)
        setError(null)
        return
      }
    }

    // Set loading states
    isFetching.current = true
    if (forceRefresh) {
      setIsRefreshing(true)
    } else if (!portfolioData) {
      setIsInitialLoading(true)
    }
    setError(null)

    try {
      console.log(`Fetching fresh portfolio data for ${walletAddress}`)
      const data = await portfolioAPI.current.getPortfolioData(walletAddress)
      
      console.log('Portfolio data received:', data)
      console.log('Transactions in data:', data?.transactions)
      
      if (!data.transactions || data.transactions.length === 0) {
        console.warn("No transactions found in portfolio data")
      }
      
      // Cache the data
      dataCache.current = {
        data,
        timestamp: Date.now(),
        walletAddress
      }
      
      setPortfolioData(data)
      setLastUpdated(new Date())
      setError(null)
      
      console.log('Portfolio data cached and set successfully')
    } catch (error) {
      console.error("Failed to fetch portfolio data:", error)
      
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch portfolio data"
      setError(errorMessage)
      
      const cachedData = dataCache.current?.walletAddress === walletAddress ? dataCache.current.data : null
      if (cachedData) {
        console.warn("Using stale cached data due to fetch error")
        setPortfolioData(cachedData)
      } else if (!portfolioData) {
        console.warn("Using fallback portfolio data due to fetch error")
        setPortfolioData(mockData)
      }
    } finally {
      setIsInitialLoading(false)
      setIsRefreshing(false)
      isFetching.current = false
    }
  }, [walletAddress, getCachedData, portfolioData, mockData])

  // Clear cache when wallet address changes
  useEffect(() => {
    if (dataCache.current?.walletAddress !== walletAddress) {
      console.log('Wallet address changed, clearing cache')
      dataCache.current = null
      setPortfolioData(null)
      if (walletAddress) {
        setIsInitialLoading(true)
      }
    }
  }, [walletAddress])

  // Initial data fetch
  useEffect(() => {
    fetchPortfolioData()
  }, [fetchPortfolioData])

  const handleRefresh = useCallback(() => {
    console.log('Manual refresh triggered')
    fetchPortfolioData(true)
  }, [fetchPortfolioData])

  // Show profile if requested
  if (showProfile) {
    return (
      <ProfilePage 
        onBack={() => setShowProfile(false)}
        walletAddress={walletAddress}
        onDisconnect={onDisconnect}
        onWalletConnect={onWalletConnect}
      />
    )
  }

  // Show loading spinner only on initial load when wallet is connected
  if (isInitialLoading && walletAddress && !portfolioData) {
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

  // Only provide fallback if user is completely null, but preserve actual user data
  const userWithFallback = user || {
    id: '',
    email: '',
    name: 'Loading...',
    rank: 'Bronze'
  }

  console.log('🔍 Portfolio Dashboard - Current user data:', user)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
      
        <HamburgerMenu>
          <Sidebar 
            walletAddress={walletAddress} 
            user={userWithFallback}
            onDisconnect={onDisconnect}
            onShowProfile={() => setShowProfile(true)}
            onWalletConnect={onWalletConnect}
          />
        </HamburgerMenu>

        {/* Main Content */}
        <main className="p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="mb-4 lg:mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl lg:text-5xl font-bold">Portfolio Overview</h1>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <div className="text-base lg:text-base text-gray-400">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                {error && (
                  <div className="flex items-center gap-1 text-yellow-500 text-base">
                    <AlertCircle className="h-4 w-4" />
                    <span>Using cached/mock data</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Profile Button */}
              <Button
                onClick={() => setShowProfile(true)}
                variant="outline"
                className="gap-2 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>

              {/* Refresh Button */}
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing || !walletAddress}
                variant="outline"
                className="gap-2 border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent disabled:opacity-50 text-sm px-4 py-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

   

          {/* Error Banner */}
          {error && walletAddress && (
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-yellow-500">Portfolio data may be outdated</p>
                  <p className="text-xs text-gray-400 mt-1 break-words">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* No Wallet Connected Message */}
          {!walletAddress && (
            <div className="mb-6">
              <Card className="p-8 border-orange-500/20 bg-orange-500/5 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                <p className="text-gray-300 mb-2">
                  Use the sidebar to connect your wallet to Citrea Testnet
                </p>
                <p className="text-sm text-gray-400">
                  Once connected, your portfolio data will appear here
                </p>
              </Card>
            </div>
          )}

          {/* Portfolio Metrics */}
          <div className="grid gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 lg:mb-6">
            <MetricsCard
              title="Total Balance"
              value={`${displayData.totalBalance} CBTC`}
              change={{
                value: `$${displayData.totalBalanceUSD?.toLocaleString() || '0'}`,
                percentage: `${displayData.dailyChange || 0}%`,
                isPositive: (displayData.dailyChange || 0) > 0,
              }}
            />
            <MetricsCard
              title="Total Deposits"
              value={`$${displayData.totalDeposits?.toLocaleString() || '0'}`}
              change={{ value: "coming soon", percentage: "+13.2%", isPositive: true }}
            />
            <MetricsCard
              title="Accrued Yield"
              value={`$${displayData.accruedYield?.toLocaleString() || '0'}`}
              change={{ value: "coming soon", percentage: "+1.2%", isPositive: true }}
            />
            <MetricsCard
              title="Active Positions"
              value={(displayData.positions || 0).toString()}
              change={{ value: `${displayData.activeYields || 0} yielding`, percentage: "+2", isPositive: true }}
            />
          </div>

          {/* Tabs for different views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
              <TabsList className="border border-orange-500/20 h-auto p-1 inline-flex min-w-max lg:min-w-0">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 text-sm whitespace-nowrap"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="transactions"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 text-sm whitespace-nowrap"
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="defi" 
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 text-sm whitespace-nowrap"
                >
                  DeFi
                </TabsTrigger>
                <TabsTrigger 
                  value="yield" 
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 text-sm whitespace-nowrap"
                >
                  Yield
                </TabsTrigger>
                <TabsTrigger 
                  value="bridge" 
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-black px-3 py-2 text-sm whitespace-nowrap"
                >
                  Bridge
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4 lg:space-y-6">
              <Card className="p-4 lg:p-6 border-orange-500/20">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg lg:text-xl font-semibold">Portfolio Performance</h2>
                </div>
                <StatsChart />
              </Card>
              
              <TokenList 
                tokens={displayData.tokens || []}
                nativeBalance={displayData.nativeBalance || displayData.balance}
                totalBalanceUSD={displayData.totalBalanceUSD}
              />
            </TabsContent>
            
            <TabsContent value="transactions">
              <TransactionHistory 
                walletAddress={walletAddress || ''}
                transactions={displayData.transactions || []}
                isLoading={isInitialLoading && !portfolioData}
              />
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
          </Tabs>
        </main>
      </div>
    </div>
  )
}