import { GraphQLClient } from 'graphql-request'


export interface TokenBalance {
  contract: string
  symbol?: string
  name?: string
  decimals?: number
  balance: string
  balanceFormatted: number
  balanceUSD?: number
}

export interface Transaction {
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

export interface PortfolioData {
  address: string
  balance: number
  balanceUSD: number
  transactions: Transaction[]
  tokens: TokenBalance[]
  totalValue: number
  transactionCount: number
}


export interface GoldskyUser {
  id: string
  address: string
  totalValue: string
  ethBalance: string
  ethBalanceUSD: string
  transactionCount: string
  tokenCount: string
  lastUpdated: string
  tokenBalances: GoldskyTokenBalance[]
  transactions: GoldskyTransaction[]
}

export interface GoldskyTokenBalance {
  id: string
  balance: string
  balanceUSD: string
  lastUpdated: string
  token: {
    id: string
    address: string
    name: string
    symbol: string
    decimals: number
    priceUSD: string
  }
}

export interface GoldskyTransaction {
  id: string
  hash: string
  from: { id: string }
  to: { id: string } | null
  value: string
  valueUSD: string
  gasPrice: string
  gasUsed: string
  type: string
  status: string
  blockNumber: string
  timestamp: string
  token?: {
    symbol: string
    name: string
  }
}

class GoldskyClient {
  private client: GraphQLClient
  private endpoint: string

  constructor() {
    this.endpoint = process.env.NEXT_PUBLIC_GOLDSKY_ENDPOINT || ''
    
    if (!this.endpoint) {
      console.warn('GOLDSKY_ENDPOINT not configured, Goldsky features will be disabled')
      this.endpoint = 'https://placeholder.goldsky.com' // fallback
    }

    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GOLDSKY_API_KEY || ''}`

      },
      timeout: 10000, 
    })
  }

  // Check if Goldsky is configured and available
  isAvailable(): boolean {
    return !!process.env.NEXT_PUBLIC_GOLDSKY_ENDPOINT
  }

  // Get user portfolio from Goldsky
  async getPortfolioData(address: string): Promise<PortfolioData | null> {
    if (!this.isAvailable()) {
      console.log('Goldsky not available, falling back to direct RPC')
      return null
    }

    try {
      const query = `
        query GetUserPortfolio($userId: ID!) {
          user(id: $userId) {
            id
            address
            totalValue
            ethBalance
            ethBalanceUSD
            transactionCount
            tokenCount
            lastUpdated
            tokenBalances(first: 100, where: { balance_gt: "0" }) {
              id
              balance
              balanceUSD
              lastUpdated
              token {
                id
                address
                name
                symbol
                decimals
                priceUSD
              }
            }
            transactions(
              first: 50
              orderBy: blockNumber
              orderDirection: desc
            ) {
              id
              hash
              from { id }
              to { id }
              value
              valueUSD
              gasPrice
              gasUsed
              type
              status
              blockNumber
              timestamp
              token {
                symbol
                name
              }
            }
          }
        }
      `

      const variables = {
        userId: address.toLowerCase()
      }

      const data = await this.client.request<{ user: GoldskyUser | null }>(query, variables)
      
      if (!data.user) {
        console.log(`No Goldsky data found for address ${address}`)
        return null
      }

      return this.transformToPortfolioData(data.user)
    } catch (error) {
      console.error('Goldsky query failed:', error)
      return null
    }
  }

  // Get recent transactions from Goldsky
  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    if (!this.isAvailable()) return []

    try {
      const query = `
        query GetTransactions($userId: ID!, $first: Int!) {
          user(id: $userId) {
            transactions(
              first: $first
              orderBy: blockNumber
              orderDirection: desc
            ) {
              id
              hash
              from { id }
              to { id }
              value
              valueUSD
              gasPrice
              gasUsed
              type
              status
              blockNumber
              timestamp
              token {
                symbol
                name
              }
            }
          }
        }
      `

      const data = await this.client.request<{ user: { transactions: GoldskyTransaction[] } | null }>(
        query,
        { userId: address.toLowerCase(), first: limit }
      )

      if (!data.user) return []

      return data.user.transactions.map(tx => this.transformTransaction(tx, address))
    } catch (error) {
      console.error('Failed to fetch Goldsky transactions:', error)
      return []
    }
  }

  // Get token balances from Goldsky  
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    if (!this.isAvailable()) return []

    try {
      const query = `
        query GetTokenBalances($userId: ID!) {
          user(id: $userId) {
            tokenBalances(first: 100, where: { balance_gt: "0" }) {
              id
              balance
              balanceUSD
              token {
                id
                address
                name
                symbol
                decimals
                priceUSD
              }
            }
          }
        }
      `

      const data = await this.client.request<{ user: { tokenBalances: GoldskyTokenBalance[] } | null }>(
        query,
        { userId: address.toLowerCase() }
      )

      if (!data.user) return []

      return data.user.tokenBalances.map(balance => ({
        contract: balance.token.address,
        symbol: balance.token.symbol,
        name: balance.token.name,
        decimals: balance.token.decimals,
        balance: balance.balance,
        balanceFormatted: parseFloat(balance.balance) / Math.pow(10, balance.token.decimals),
        balanceUSD: parseFloat(balance.balanceUSD)
      }))
    } catch (error) {
      console.error('Failed to fetch Goldsky token balances:', error)
      return []
    }
  }

  // Get global stats
  async getGlobalStats() {
    if (!this.isAvailable()) return null

    try {
      const query = `
        query GetGlobalStats {
          globalStats(id: "1") {
            totalUsers
            totalTokens
            totalTransactions
            totalVolumeUSD
            lastUpdatedBlock
            lastUpdatedTimestamp
          }
        }
      `

      const data = await this.client.request(query)
      return data.globalStats
    } catch (error) {
      console.error('Failed to fetch global stats:', error)
      return null
    }
  }

  // Transform Goldsky user data to your existing PortfolioData format
  private transformToPortfolioData(user: GoldskyUser): PortfolioData {
    return {
      address: user.address,
      balance: parseFloat(user.ethBalance),
      balanceUSD: parseFloat(user.ethBalanceUSD),
      totalValue: parseFloat(user.totalValue),
      transactionCount: parseInt(user.transactionCount),
      transactions: user.transactions.map(tx => this.transformTransaction(tx, user.address)),
      tokens: user.tokenBalances.map(balance => ({
        contract: balance.token.address,
        symbol: balance.token.symbol,
        name: balance.token.name,
        decimals: balance.token.decimals,
        balance: balance.balance,
        balanceFormatted: parseFloat(balance.balance) / Math.pow(10, balance.token.decimals),
        balanceUSD: parseFloat(balance.balanceUSD)
      }))
    }
  }

  // Transform Goldsky transaction to your existing Transaction format
  private transformTransaction(tx: GoldskyTransaction, userAddress: string): Transaction {
    const isSent = tx.from.id.toLowerCase() === userAddress.toLowerCase()
    
    return {
      hash: tx.hash,
      from: tx.from.id,
      to: tx.to?.id || '',
      value: tx.value,
      valueFormatted: parseFloat(tx.value) / 1e18,
      gasPrice: tx.gasPrice,
      gasUsed: tx.gasUsed,
      blockNumber: parseInt(tx.blockNumber),
      timestamp: parseInt(tx.timestamp),
      status: tx.status.toLowerCase(),
      type: isSent ? 'sent' : 'received'
    }
  }

  // Health check for Goldsky connection
  async healthCheck(): Promise<{ isHealthy: boolean; latestBlock?: number }> {
    if (!this.isAvailable()) {
      return { isHealthy: false }
    }

    try {
      const stats = await this.getGlobalStats()
      return {
        isHealthy: !!stats,
        latestBlock: stats ? parseInt(stats.lastUpdatedBlock) : undefined
      }
    } catch (error) {
      console.error('Goldsky health check failed:', error)
      return { isHealthy: false }
    }
  }
}

// Export singleton instance
export const goldskyClient = new GoldskyClient()
export default goldskyClient