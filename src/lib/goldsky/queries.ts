import { gql } from 'graphql-request'

// Complete portfolio query - matches your existing getPortfolioData function
export const GET_PORTFOLIO_DATA = gql`
  query GetPortfolioData($userId: ID!) {
    user(id: $userId) {
      id
      address
      totalValue
      ethBalance
      ethBalanceUSD
      transactionCount
      tokenCount
      lastUpdated
      
      tokenBalances(
        first: 100
        where: { balance_gt: "0" }
        orderBy: balanceUSD
        orderDirection: desc
      ) {
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

// Transaction history query - matches your getTransactionHistory function  
export const GET_TRANSACTION_HISTORY = gql`
  query GetTransactionHistory($userId: ID!, $first: Int!, $skip: Int = 0) {
    user(id: $userId) {
      id
      transactionCount
      transactions(
        first: $first
        skip: $skip
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
          id
          symbol
          name
        }
      }
    }
  }
`

// Token balances query - matches your getTokenBalances function
export const GET_TOKEN_BALANCES = gql`
  query GetTokenBalances($userId: ID!) {
    user(id: $userId) {
      id
      tokenCount
      tokenBalances(
        first: 100
        where: { balance_gt: "0" }
        orderBy: balanceUSD
        orderDirection: desc
      ) {
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
          holderCount
          transferCount
        }
      }
    }
  }
`

// Get ETH balance - matches your getBalance function
export const GET_ETH_BALANCE = gql`
  query GetEthBalance($userId: ID!) {
    user(id: $userId) {
      id
      address
      ethBalance
      ethBalanceUSD
      lastUpdated
    }
  }
`

// Get recent transfers for a specific token
export const GET_TOKEN_TRANSFERS = gql`
  query GetTokenTransfers($tokenId: ID!, $userId: ID, $first: Int!) {
    transfers(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { 
        token: $tokenId
        or: [
          { from: $userId }
          { to: $userId }
        ]
      }
    ) {
      id
      from { id }
      to { id }
      amount
      amountUSD
      token {
        symbol
        name
      }
      transaction {
        hash
        blockNumber
        timestamp
      }
    }
  }
`

// Get top tokens by volume/holders
export const GET_TOP_TOKENS = gql`
  query GetTopTokens($first: Int!, $orderBy: String = "volume24h") {
    tokens(
      first: $first
      orderBy: $orderBy
      orderDirection: desc
      where: { holderCount_gt: 0 }
    ) {
      id
      address
      name
      symbol
      decimals
      priceUSD
      volume24h
      holderCount
      transferCount
      totalSupply
    }
  }
`

// Get portfolio performance over time
export const GET_PORTFOLIO_SNAPSHOTS = gql`
  query GetPortfolioSnapshots($userId: ID!, $first: Int = 30) {
    portfolioSnapshots(
      first: $first
      orderBy: timestamp
      orderDirection: desc
      where: { user: $userId }
    ) {
      id
      totalValue
      ethBalance
      ethBalanceUSD
      tokenCount
      timestamp
      blockNumber
      tokenValues {
        token {
          symbol
          name
        }
        balance
        balanceUSD
        priceUSD
      }
    }
  }
`

// Get daily user stats for analytics
export const GET_DAILY_USER_STATS = gql`
  query GetDailyUserStats($userId: ID!, $first: Int = 30) {
    dailyUserStats(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { user: $userId }
    ) {
      id
      date
      transactionCount
      volumeUSD
      gasSpent
      portfolioValueStart
      portfolioValueEnd
      portfolioChange
    }
  }
`

// Get token price history
export const GET_TOKEN_DAILY_STATS = gql`
  query GetTokenDailyStats($tokenId: ID!, $first: Int = 30) {
    dailyTokenStats(
      first: $first
      orderBy: date
      orderDirection: desc
      where: { token: $tokenId }
    ) {
      id
      date
      transferCount
      volumeUSD
      uniqueUsers
      priceOpen
      priceClose
      priceHigh
      priceLow
    }
  }
`

// Global platform statistics
export const GET_GLOBAL_STATS = gql`
  query GetGlobalStats {
    globalStats(id: "1") {
      id
      totalUsers
      totalTokens
      totalTransactions
      totalVolumeUSD
      lastUpdatedBlock
      lastUpdatedTimestamp
    }
  }
`

// Search users by transaction activity
export const SEARCH_ACTIVE_USERS = gql`
  query SearchActiveUsers($first: Int!, $minTransactions: BigInt = "1") {
    users(
      first: $first
      orderBy: transactionCount
      orderDirection: desc
      where: { transactionCount_gte: $minTransactions }
    ) {
      id
      address
      totalValue
      transactionCount
      tokenCount
      lastUpdated
    }
  }
`

// Find users holding a specific token
export const GET_TOKEN_HOLDERS = gql`
  query GetTokenHolders($tokenId: ID!, $first: Int!, $minBalance: BigDecimal = "0") {
    tokenBalances(
      first: $first
      orderBy: balance
      orderDirection: desc
      where: { 
        token: $tokenId
        balance_gt: $minBalance
      }
    ) {
      id
      balance
      balanceUSD
      user {
        id
        address
        totalValue
        transactionCount
      }
      token {
        symbol
        name
        priceUSD
      }
    }
  }
`

// Get recent activity across all users
export const GET_RECENT_ACTIVITY = gql`
  query GetRecentActivity($first: Int!) {
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
`

// Health check query for monitoring
export const HEALTH_CHECK = gql`
  query HealthCheck {
    globalStats(id: "1") {
      lastUpdatedBlock
      lastUpdatedTimestamp
    }
    _meta {
      block {
        number
        hash
        timestamp
      }
      deployment
      hasIndexingErrors
    }
  }
`