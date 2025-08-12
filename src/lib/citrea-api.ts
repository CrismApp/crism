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

    if (cached && (now - cached.timestamp) < 300000) {
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

  // Get transaction history
  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      console.log(`Getting transaction history for ${address}`)
      
      // Get current block number
      const currentBlock = await this.makeRPCCall('eth_blockNumber', []) as string
      const currentBlockNum = parseInt(currentBlock, 16)
      
      // CRITICAL FIX: Citrea has max block range of 1000
      const maxBlockRange = 999 // Use 999 to be safe
      const fromBlock = Math.max(0, currentBlockNum - maxBlockRange)
      
      console.log(`Scanning blocks ${fromBlock} to ${currentBlockNum} (range: ${currentBlockNum - fromBlock})`)
      
      try {
        // Try eth_getLogs with limited range first
        const logs = await this.makeRPCCall('eth_getLogs', [{
          fromBlock: '0x' + fromBlock.toString(16),
          toBlock: 'latest',
          topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer event
            null,
            null
          ]
        }]) as any[]

        console.log(`Found ${logs.length} log entries`)

        // Get unique transaction hashes involving our address
        const relevantLogs = logs.filter(log => {
          if (!log.topics || log.topics.length < 3) return false
          const from = '0x' + log.topics[1]?.slice(-40)
          const to = '0x' + log.topics[2]?.slice(-40)
          return from.toLowerCase() === address.toLowerCase() || 
                 to.toLowerCase() === address.toLowerCase()
        })

        const uniqueTxHashes = [...new Set(relevantLogs.map(log => log.transactionHash))]
        console.log(`Found ${uniqueTxHashes.length} unique transactions`)

        if (uniqueTxHashes.length > 0) {
          // Process transactions in smaller batches
          const transactions = await this.processTransactionBatch(uniqueTxHashes.slice(0, limit), address, limit)
          
          if (transactions.length > 0) {
            console.log(`Processed ${transactions.length} transactions via logs`)
            return transactions.sort((a, b) => b.blockNumber - a.blockNumber).slice(0, limit)
          }
        }
      } catch (logsError) {
        console.error('eth_getLogs failed:', logsError)
      }
      
      // Fallback to direct block scanning
      console.log('Falling back to direct block scanning')
      return this.getTransactionsByDirectScan(address, limit)
      
    } catch (error) {
      console.error('Transaction history error:', error)
      return []
    }
  }

  // Process transactions in batches to avoid overwhelming the RPC
  private async processTransactionBatch(txHashes: string[], userAddress: string, maxCount: number): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    const batchSize = 5 // Small batches to be safe
    
    for (let i = 0; i < txHashes.length && transactions.length < maxCount; i += batchSize) {
      const batch = txHashes.slice(i, i + batchSize)
      
      try {
        const batchPromises = batch.map(async (hash) => {
          try {
            const [tx, receipt] = await Promise.all([
              this.makeRPCCall('eth_getTransactionByHash', [hash]),
              this.makeRPCCall('eth_getTransactionReceipt', [hash])
            ])
            
            if (!tx || !receipt) return null
            return this.processTransaction(tx as any, receipt as any, userAddress)
          } catch (error) {
            console.error(`Error fetching tx ${hash}:`, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        const validTransactions = batchResults.filter(tx => tx !== null) as Transaction[]
        transactions.push(...validTransactions)
        
        // Small delay between batches
        if (i + batchSize < txHashes.length && transactions.length < maxCount) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (batchError) {
        console.error(`Batch processing error:`, batchError)
      }
    }

    return transactions
  }

  // Process individual transaction correctly
  private processTransaction(tx: any, receipt: any, userAddress: string): Transaction {
    const isSent = tx.from.toLowerCase() === userAddress.toLowerCase()
    const value = parseInt(tx.value || '0', 16)
    const gasUsed = parseInt(receipt.gasUsed || '0', 16)
    const gasPrice = parseInt(tx.gasPrice || '0', 16)

    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to || '',
      value: tx.value || '0',
      valueFormatted: value / 1e18,
      gasPrice: tx.gasPrice || '0',
      gasUsed: receipt.gasUsed,
      blockNumber: parseInt(receipt.blockNumber, 16),
      timestamp: undefined, // Will be filled later if needed
      status: parseInt(receipt.status, 16) === 1 ? 'success' : 'failed',
      type: isSent ? 'sent' : 'received'
    }
  }

  // Simplified direct block scanning with smaller range
  private async getTransactionsByDirectScan(address: string, limit: number): Promise<Transaction[]> {
    console.log('Using direct block scan fallback')
    
    try {
      const currentBlock = await this.makeRPCCall('eth_blockNumber', []) as string
      const currentBlockNum = parseInt(currentBlock, 16)
      const transactions: Transaction[] = []
      
      // MUCH smaller range to avoid timeouts - only scan last 200 blocks
      const blocksToScan = Math.min(200, currentBlockNum)
      
      console.log(`Direct scan: checking last ${blocksToScan} blocks`)
      
      for (let i = 0; i < blocksToScan && transactions.length < limit; i++) {
        const blockNum = currentBlockNum - i
        
        try {
          const block = await this.makeRPCCall('eth_getBlockByNumber', [
            '0x' + blockNum.toString(16), 
            true
          ]) as any

          if (!block?.transactions) continue

          const relevantTxs = block.transactions.filter((tx: any) =>
            tx.from?.toLowerCase() === address.toLowerCase() ||
            tx.to?.toLowerCase() === address.toLowerCase()
          )

          for (const tx of relevantTxs) {
            const isSent = tx.from.toLowerCase() === address.toLowerCase()
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

            if (transactions.length >= limit) break
          }
        } catch (blockError) {
          console.error(`Error scanning block ${blockNum}:`, blockError)
        }
        
        // Add small delay every 10 blocks to be nice to RPC
        if (i > 0 && i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      console.log(`Direct scan found ${transactions.length} transactions`)
      return transactions.sort((a, b) => b.blockNumber - a.blockNumber)
      
    } catch (error) {
      console.error('Direct scan error:', error)
      return []
    }
  }

  // Simplified token balance fetching
  async getTokenBalances(address: string, tokenContracts: string[] = []): Promise<TokenBalance[]> {
    try {
      // Try explorer first
      const explorerBalances = await this.getTokenBalancesFromExplorer(address)
      if (explorerBalances.length > 0) {
        return explorerBalances.slice(0, 10) // Limit to prevent timeout
      }
    } catch (error) {
      console.log('Explorer failed, using RPC fallback')
    }

    // Fallback: Check only essential tokens
    const priorityTokens = [
      '0xb669dC8cC6D044307Ba45366C0c836eC3c7e31AA', // USDC
      '0x4126E0f88008610d6E6C3059d93e9814c20139cB', // WETH
      '0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93', // WCBTC
    ]

    const balances: TokenBalance[] = []
    for (const tokenAddress of priorityTokens.slice(0, 5)) {
      try {
        const balance = await this.getTokenBalance(address, tokenAddress)
        if (balance) {
          balances.push(balance)
        }
      } catch (error) {
        console.error(`Error fetching balance for token ${tokenAddress}:`, error)
      }
    }

    return balances
  }

  private async getTokenBalancesFromExplorer(address: string): Promise<TokenBalance[]> {
    // This would connect to a block explorer API when available
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
    } catch (error) {
      console.error(`Token info fetch failed for ${tokenAddress}:`, error)
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
    } catch (error) {
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
        this.getTokenBalances(address, [])
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
