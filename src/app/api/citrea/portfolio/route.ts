// File: app/api/citrea/portfolio/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { CitreaAPI, PortfolioData } from '@/lib/citrea-api'

// Interface for the transformed portfolio response
interface PortfolioResponse {
  // Core wallet data
  address: string
  totalBalance: number
  totalBalanceUSD: number
  
  // Portfolio metrics (matching your frontend component)
  totalDeposits: number
  accruedYield: number
  dailyChange: number
  positions: number
  activeYields: number
  
  // Detailed data
  transactions: any[]
  tokens: any[]
  nativeBalance: number
  
  // Metadata
  lastUpdated: string
  chainInfo: {
    name: string
    testnet: boolean
    rpcHealthy: boolean
    latestBlock?: number
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('address')
  
  // Validate wallet address
  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' }, 
      { status: 400 }
    )
  }
  
  if (!isValidEthereumAddress(walletAddress)) {
    return NextResponse.json(
      { error: 'Invalid wallet address format' }, 
      { status: 400 }
    )
  }

  try {
    const citreaAPI = new CitreaAPI()
    
    // Check if RPC is healthy first
    const healthCheck = await citreaAPI.healthCheck()
    if (!healthCheck.isHealthy) {
      return NextResponse.json(
        { 
          error: 'Citrea network is currently unavailable',
          details: 'Unable to connect to Citrea RPC endpoint'
        }, 
        { status: 503 }
      )
    }

    // Fetch portfolio data
    console.log(`Fetching portfolio data for address: ${walletAddress}`)
    const portfolioData: PortfolioData = await citreaAPI.getPortfolioData(walletAddress)
    
    // Transform the data to match your frontend expectations
    const transformedData: PortfolioResponse = {
      address: portfolioData.address,
      totalBalance: portfolioData.balance,
      totalBalanceUSD: portfolioData.balanceUSD,
      
      // Calculate portfolio metrics
      totalDeposits: calculateTotalDeposits(portfolioData.transactions),
      accruedYield: calculateAccruedYield(portfolioData.transactions, portfolioData.balance),
      dailyChange: calculateDailyChange(portfolioData.transactions),
      positions: portfolioData.tokens.length + (portfolioData.balance > 0 ? 1 : 0), // Include native token
      activeYields: calculateActiveYields(portfolioData.tokens),
      
      // Detailed data
      transactions: portfolioData.transactions.map(tx => ({
        ...tx,
        valueUSD: tx.valueFormatted * (portfolioData.balanceUSD / portfolioData.balance || 0),
        formattedValue: `${tx.valueFormatted.toFixed(6)} BTC`,
        age: Date.now() - (tx.timestamp || 0) * 1000,
        status: 'completed' // Citrea transactions are final
      })),
      tokens: portfolioData.tokens.map(token => ({
        ...token,
        valueUSD: token.balanceUSD || 0,
        formattedBalance: `${token.balanceFormatted.toFixed(6)} ${token.symbol}`,
        percentage: portfolioData.totalValue > 0 ? (token.balanceUSD || 0) / portfolioData.totalValue * 100 : 0
      })),
      nativeBalance: portfolioData.balance,
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      chainInfo: {
        name: 'Citrea Testnet',
        testnet: true,
        rpcHealthy: healthCheck.isHealthy,
        latestBlock: healthCheck.latestBlock
      }
    }

    console.log(`Successfully fetched portfolio for ${walletAddress}:`, {
      balance: transformedData.totalBalance,
      balanceUSD: transformedData.totalBalanceUSD,
      tokens: transformedData.tokens.length,
      transactions: transformedData.transactions.length
    })

    return NextResponse.json(transformedData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })

  } catch (error: any) {
    console.error('Portfolio API Error:', {
      address: walletAddress,
      error: error.message,
      stack: error.stack
    })

    // Return appropriate error response
    const statusCode = error.message?.includes('Invalid address') ? 400 : 500
    const errorMessage = statusCode === 400 
      ? 'Invalid wallet address' 
      : 'Failed to fetch portfolio data. Please try again later.'

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: new Date().toISOString()
      }, 
      { status: statusCode }
    )
  }
}

// OPTIONS handler for CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

// Helper functions for portfolio calculations

function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

function calculateTotalDeposits(transactions: any[]): number {
  // Calculate total incoming transactions (deposits)
  return transactions
    .filter(tx => tx.type === 'received')
    .reduce((sum, tx) => sum + tx.valueFormatted, 0)
}

function calculateAccruedYield(transactions: any[], currentBalance: number): number {
  // Simple yield calculation: current balance - total deposits + total withdrawals
  const totalDeposits = calculateTotalDeposits(transactions)
  const totalWithdrawals = transactions
    .filter(tx => tx.type === 'sent')
    .reduce((sum, tx) => sum + tx.valueFormatted, 0)
  
  const accruedYield = currentBalance + totalWithdrawals - totalDeposits
  return Math.max(0, accruedYield) // Don't show negative yield
}

function calculateDailyChange(transactions: any[]): number {
  // Calculate 24h change based on transactions
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
  const recentTransactions = transactions.filter(tx => 
    (tx.timestamp || 0) * 1000 > oneDayAgo
  )
  
  if (recentTransactions.length === 0) return 0
  
  const dailyVolume = recentTransactions.reduce((sum, tx) => sum + tx.valueFormatted, 0)
  
  // Simple heuristic: positive change if more received than sent
  const received = recentTransactions
    .filter(tx => tx.type === 'received')
    .reduce((sum, tx) => sum + tx.valueFormatted, 0)
  const sent = recentTransactions
    .filter(tx => tx.type === 'sent')
    .reduce((sum, tx) => sum + tx.valueFormatted, 0)
    
  const netChange = received - sent
  
  // Convert to percentage (rough estimate)
  return dailyVolume > 0 ? (netChange / dailyVolume) * 100 : 0
}

function calculateActiveYields(tokens: any[]): number {
  // Count tokens that might represent yield-bearing positions
  // This is a placeholder - you'd need to identify actual DeFi tokens
  const yieldTokens = tokens.filter(token => 
    token.symbol?.toLowerCase().includes('lp') || 
    token.symbol?.toLowerCase().includes('stake') ||
    token.balanceFormatted > 0
  )
  
  return yieldTokens.length
}

// Additional utility function for error handling
function createErrorResponse(message: string, statusCode: number = 500) {
  return NextResponse.json(
    { 
      error: message,
      timestamp: new Date().toISOString()
    }, 
    { status: statusCode }
  )
}