import { getPriorityTokens, getTokenConfig } from './token-config'

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

export interface EthTransaction {
  hash: string
  from: string
  to: string | null
  value: string
  gasPrice: string
  gas: string
}

export interface EthTransactionReceipt {
  status: string
  gasUsed: string
  blockNumber: string
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

export class CitreaAPI {
  private citreaRPC = 'https://rpc.testnet.citrea.xyz'
  private coingeckoAPI = 'https://api.coingecko.com/api/v3'
  
  // Cache for expensive operations
  private priceCache: { [key: string]: { price: number; timestamp: number } } = {}
  private tokenInfoCache: { [key: string]: { symbol: string; name: string; decimals: number; timestamp: number } } = {}

  constructor() {
    if (process.env.CITREA_RPC_URL) {
      this.citreaRPC = process.env.CITREA_RPC_URL
    }
  }

  private async makeRPCCall(method: string, params: unknown[] = []): Promise<unknown> {
    try {
      const response = await fetch(this.citreaRPC, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method,
          params
        })
      })

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message}`)
      }

      return data.result
    } catch (error) {
      console.error(`RPC call failed for method ${method}:`, error)
      throw error
    }
  }

  // Get ETH balance
  async getBalance(address: string): Promise<{ balance: number; balanceWei: string; balanceUSD: number }> {
    try {
      const [balanceWei, btcPrice] = await Promise.all([
        this.makeRPCCall('eth_getBalance', [address, 'latest']),
        this.getBTCPrice()
      ])

      const balance = parseInt(balanceWei as string, 16) / 1e18
      const balanceUSD = balance * btcPrice

      return {
        balance,
        balanceWei: balanceWei as string,
        balanceUSD
      }
    } catch (error) {
      console.error('Balance fetch error:', error)
      throw new Error('Failed to fetch wallet balance')
    }
  }

  private async getBTCPrice(): Promise<number> {
    const cacheKey = 'btc_price'
    const now = Date.now()
    const cached = this.priceCache[cacheKey]

    if (cached && (now - cached.timestamp) < 60000) { // Reduced to 1 minute cache
      return cached.price
    }

    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${this.coingeckoAPI}/simple/price?ids=bitcoin&vs_currencies=usd`, {
        signal: controller.signal
      })
      
      if (!response.ok) return cached?.price || 60000
      
      const data = await response.json()
      const price = data.bitcoin?.usd || 60000

      this.priceCache[cacheKey] = { price, timestamp: now }
      return price
    } catch (error) {
      console.error('Price fetch error:', error)
      return cached?.price || 60000
    }
  }

  // Get transaction history - OPTIMIZED FOR SPEED
  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      console.log(`Getting transaction history for ${address} (optimized)`)
      
      // SPEED OPTIMIZATION: Scan only last 50 blocks for instant results
      const currentBlock = await this.makeRPCCall('eth_blockNumber', []) as string
      const currentBlockNum = parseInt(currentBlock, 16)
      const fromBlock = Math.max(0, currentBlockNum - 50) // Only 50 blocks!
      
      console.log(`Fast scan: blocks ${fromBlock} to ${currentBlockNum} (${currentBlockNum - fromBlock} blocks)`)
      
      // Try fast method first - scan recent blocks directly
      const quickTransactions = await this.getRecentTransactionsFast(address, limit, fromBlock, currentBlockNum)
      
      if (quickTransactions.length > 0) {
        console.log(`Fast method found ${quickTransactions.length} transactions`)
        return quickTransactions
      }
      
      // If no recent transactions, return empty array (for speed)
      console.log('No recent transactions found')
      return []
      
    } catch (error) {
      console.error('Transaction history error:', error)
      return []
    }
  }

  // FAST method - scan only recent blocks
  private async getRecentTransactionsFast(address: string, limit: number, fromBlock: number, toBlock: number): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    const addressLower = address.toLowerCase()
    
    // Process only last 20 blocks for instant results
    const blocksToCheck = Math.min(20, toBlock - fromBlock)
    
    for (let i = 0; i < blocksToCheck && transactions.length < limit; i++) {
      const blockNum = toBlock - i
      
      try {
        const block = await this.makeRPCCall('eth_getBlockByNumber', [
          '0x' + blockNum.toString(16), 
          true
        ]) as {
          number: string
          timestamp: string
          transactions: EthTransaction[]
        }

        if (!block?.transactions) continue

        // Filter transactions involving our address
        const relevantTxs = block.transactions.filter((tx: EthTransaction) =>
          tx.from?.toLowerCase() === addressLower ||
          tx.to?.toLowerCase() === addressLower
        )

        // Process relevant transactions
        for (const tx of relevantTxs) {
          if (transactions.length >= limit) break
          
          const isSent = tx.from.toLowerCase() === addressLower
          const value = parseInt(tx.value || '0', 16)

          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: tx.value || '0',
            valueFormatted: value / 1e18,
            gasPrice: tx.gasPrice || '0',
            gasUsed: tx.gas,
            blockNumber: parseInt(block.number, 16),
            timestamp: parseInt(block.timestamp, 16),
            status: 'success',
            type: isSent ? 'sent' : 'received'
          })
        }
        
      } catch (blockError) {
        console.error(`Error scanning block ${blockNum}:`, blockError)
        continue // Skip failed blocks
      }
    }

    return transactions.sort((a, b) => b.blockNumber - a.blockNumber)
  }

  // Process transactions in batches to avoid overwhelming the RPC
  // Simplified token balance fetching - OPTIMIZED
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      // Check priority tokens for speed
      const priorityTokens = [
       '0xb669dC8cC6D044307Ba45366C0c836eC3c7e31AA', // USD Coin (USDC)
        '0x2252998B8281ba168Ab11b620b562035dC34EAE0', // Uniswap V2 (UNI-V2)
        '0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93', // Wrapped Citrea Bitcoin (WCBTC)
        '0xdE4251dd68e1aD5865b14Dd527E54018767Af58a', // SUMA (SUMA)
        '0x36c16eaC6B0Ba6c50f494914ff015fCa95B7835F', // USDC (USDC)
        '0x9B28B690550522608890C3C7e63c0b4A7eBab9AA', // Nectra USD (NUSD)
        '0x9FEE47Bf6A2Bf54A9cE38caFF94bb50adCa4710e', // USD (USD)
        '0xcfb6737893A18D10936bc622BCe04fc7f50776a0', // Nectra Position (NTP)
        '0x4126E0f88008610d6E6C3059d93e9814c20139cB', // WETH (WETH)
        '0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F', // Algebra Positions NFT-V2 (ALGB-POS)
       
      ]

      const balances: TokenBalance[] = []
      
      // Process tokens in parallel for speed
      const tokenPromises = priorityTokens.map(async (tokenAddress) => {
        try {
          return await this.getTokenBalance(address, tokenAddress)
        } catch {
          return null // Skip failed tokens
        }
      })
      
      const results = await Promise.all(tokenPromises)
      balances.push(...results.filter(balance => balance !== null) as TokenBalance[])

      return balances
    } catch (error) {
      console.error('Token balance fetch error:', error)
      return []
    }
  }

  private async getTokenBalancesFromExplorer(/* _address: string */): Promise<TokenBalance[]> {
    //HEY SAM CHECK THIS!!!
    // This is supposed to connect to a block explorer API when available
    // For now return empty array
    return []
  }

  private async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<TokenBalance | null> {
    try {
      // Get token info and balance in parallel
      const [tokenInfo, balance] = await Promise.all([
        this.getTokenInfo(tokenAddress),
        this.getERC20Balance(walletAddress, tokenAddress)
      ])

      if (!tokenInfo || balance === null) return null

      const balanceFormatted = balance / Math.pow(10, tokenInfo.decimals)
      
      // Skip tokens with zero balance
      if (balanceFormatted === 0) return null

      return {
        contract: tokenAddress,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        balance: balance.toString(),
        balanceFormatted,
        balanceUSD: 0 // Would need price API integration
      }
    } catch (error) {
      console.error(`Error fetching token balance ${tokenAddress}:`, error)
      return null
    }
  }

  private async getERC20Balance(walletAddress: string, tokenAddress: string): Promise<number | null> {
    try {
      // ERC20 balanceOf function signature
      const balanceOfSig = '0x70a08231' // balanceOf(address)
      const paddedAddress = walletAddress.slice(2).padStart(64, '0')
      const data = balanceOfSig + paddedAddress

      const result = await this.makeRPCCall('eth_call', [{
        to: tokenAddress,
        data: data
      }, 'latest'])

      if (!result || result === '0x') return null
      return parseInt(result as string, 16)
    } catch (error) {
      console.error(`ERC20 balance call failed:`, error)
      return null
    }
  }

  private async getTokenInfo(tokenAddress: string): Promise<{ symbol: string; name: string; decimals: number } | null> {
    const cacheKey = tokenAddress.toLowerCase()
    const cached = this.tokenInfoCache[cacheKey]
    
    if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1 hour cache
      return cached
    }

    try {
      // Get symbol, name, and decimals in parallel
      const [symbol, name, decimals] = await Promise.all([
        this.makeERC20Call(tokenAddress, '0x95d89b41'), // symbol()
        this.makeERC20Call(tokenAddress, '0x06fdde03'), // name()  
        this.makeERC20Call(tokenAddress, '0x313ce567')  // decimals()
      ])

      if (!symbol || !name || decimals === null) return null

      const tokenInfo = {
        symbol: this.decodeString(symbol as string),
        name: this.decodeString(name as string),
        decimals: parseInt(decimals as string, 16)
      }

      // Cache the result
      this.tokenInfoCache[cacheKey] = { ...tokenInfo, timestamp: Date.now() }
      return tokenInfo
    } catch {
      console.error(`Token info fetch failed for ${tokenAddress}`)
      return null
    }
  }

  private async makeERC20Call(tokenAddress: string, methodSig: string): Promise<unknown> {
    return this.makeRPCCall('eth_call', [{
      to: tokenAddress,
      data: methodSig
    }, 'latest'])
  }

  private decodeString(hexString: string): string {
    try {
      // Remove 0x prefix
      const hex = hexString.slice(2)
      // Skip the first 64 chars (offset and length info)
      const dataStart = 128
      const lengthHex = hex.slice(64, 128)
      const length = parseInt(lengthHex, 16) * 2
      const dataHex = hex.slice(dataStart, dataStart + length)
      
      // Convert hex to string
      let str = ''
      for (let i = 0; i < dataHex.length; i += 2) {
        const charCode = parseInt(dataHex.slice(i, i + 2), 16)
        if (charCode > 0) str += String.fromCharCode(charCode)
      }
      
      return str.trim()
    } catch {
      return ''
    }
  }

  // Get complete portfolio data for an address
  async getPortfolioData(address: string): Promise<PortfolioData> {
    try {
      console.log(`Getting portfolio data for ${address}`)
      
      // Get all data in parallel for better performance
      const [balanceData, transactions, tokens] = await Promise.all([
        this.getBalance(address),
        this.getTransactionHistory(address, 50),
        this.getTokenBalances(address)
      ])

      // Calculate total portfolio value
      const tokenValue = tokens.reduce((sum, token) => sum + (token.balanceUSD || 0), 0)
      const totalValue = balanceData.balanceUSD + tokenValue

      const portfolioData: PortfolioData = {
        address,
        balance: balanceData.balance,
        balanceUSD: balanceData.balanceUSD,
        transactions,
        tokens,
        totalValue,
        transactionCount: transactions.length
      }

      console.log(`Portfolio data collected:`, {
        balance: balanceData.balance,
        balanceUSD: balanceData.balanceUSD,
        transactionCount: transactions.length,
        tokenCount: tokens.length,
        totalValue
      })

      return portfolioData
    } catch (error) {
      console.error('Portfolio data error:', error)
      throw new Error('Failed to fetch portfolio data')
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; latestBlock: number; chainId?: string }> {
    try {
      const [blockNumber, chainId] = await Promise.all([
        this.makeRPCCall('eth_blockNumber', []),
        this.makeRPCCall('eth_chainId', [])
      ])

      const latestBlock = parseInt(blockNumber as string, 16)
      
      return {
        isHealthy: true,
        latestBlock,
        chainId: chainId as string
      }
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        isHealthy: false,
        latestBlock: 0
      }
    }
  }
}
