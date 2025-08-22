export interface TokenBalance {
  token: {
    address: string
    symbol: string
    name: string
    decimals: number
    priceUSD: number
  }
  balance: string
  balanceUSD: number
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  valueUSD: number
  gasUsed: string
  gasPrice: string
  timestamp: number
  blockNumber: number
  type: 'sent' | 'received' | 'swap' | 'other'
  token?: {
    address: string
    symbol: string
    name: string
  }
}

export interface PortfolioData {
  address: string
  totalValueUSD: number
  ethBalance: string
  ethBalanceUSD: number
  tokens: TokenBalance[]
  transactions: Transaction[]
  transactionCount: number
  performance24h: number
  lastUpdated: number
}

export class CitreaAPI {
  private citreaRPC = 'https://rpc.testnet.citrea.xyz'
  private coingeckoAPI = 'https://api.coingecko.com/api/v3'
  private goldskyEndpoint = process.env.GOLDSKY_ENDPOINT || ''
  
  // Cache for expensive operations
  private priceCache: { [key: string]: { price: number; timestamp: number } } = {}
  private tokenInfoCache: { [key: string]: { symbol: string; name: string; decimals: number; timestamp: number } } = {}

  constructor() {
    if (process.env.CITREA_RPC_URL) {
      this.citreaRPC = process.env.CITREA_RPC_URL
    }
    if (process.env.GOLDSKY_ENDPOINT) {
      this.goldskyEndpoint = process.env.GOLDSKY_ENDPOINT
    }
  }

  /**
   * Get portfolio data for an address
   */
  async getPortfolioData(address: string): Promise<PortfolioData> {
    console.log(`Getting portfolio data for ${address}`)
    return await this.getRPCPortfolioData(address)
  }

  /**
   * Get transaction history for an address - GOLDSKY ONLY (FAST)
   */
  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    return await this.getGoldskyTransactionHistory(address, limit)
  }

  /**
   * Get token balances for an address
   */
  async getTokenBalances(address: string): Promise<TokenBalance[]> {
    return await this.getRPCTokenBalances(address)
  }

  /**
   * Health check for RPC connection
   */
  async healthCheck(): Promise<{ isHealthy: boolean; latestBlock: number; chainId?: string }> {
    return await this.getRPCHealthCheck()
  }

  
  private async getGoldskyTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    const query = `
      query GetTransactions($fromAddress: String!, $toAddress: String!, $limit: Int!) {
        transactions(
          where: { 
            or: [
              { from: $fromAddress }
              { to: $toAddress }
            ]
          }
          first: $limit
          orderBy: timestamp
          orderDirection: desc
        ) {
          id
          hash
          from {
            id
          }
          to {
            id
          }
          value
          tokenAddress
          tokenSymbol
          tokenName
          tokenDecimals
          blockNumber
          timestamp
        }
      }
    `

    const variables = {
      fromAddress: address.toLowerCase(),
      toAddress: address.toLowerCase(),
      limit
    }

    try {
      console.log('Making GraphQL request to:', this.goldskyEndpoint);
      console.log('Query variables:', variables);
      
      const response = await fetch(this.goldskyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      console.log('GraphQL response status:', response.status);

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`)
      }

      const data = await response.json()
      console.log('GraphQL response data:', JSON.stringify(data, null, 2));
      
      if (data.errors) {
        console.error('GraphQL Errors:', data.errors);
        throw new Error(`GraphQL Error: ${data.errors[0].message}`)
      }

      console.log('Transactions found:', data.data?.transactions?.length || 0);

      // Return empty array if no transactions found instead of throwing error
      if (!data.data?.transactions || data.data.transactions.length === 0) {
        console.log('No transactions found in Goldsky for this address');
        return [];
      }

      // Map the response based on your schema structure
      return data.data.transactions.map((transaction: {
        hash: string;
        from: { id: string };
        to: { id: string };
        value: string;
        timestamp: string;
        blockNumber: string;
        gasUsed: string;
        gasPrice: string;
        token: { symbol: string; name: string; contractAddress: string };
      }) => {
        const isSent = transaction.from.id.toLowerCase() === address.toLowerCase()
        const valueInWei = transaction.value
        
        return {
          hash: transaction.hash,
          from: transaction.from.id,
          to: transaction.to.id,
          value: valueInWei,
          valueUSD: 0, // You'd need token price data for accurate USD values
          gasUsed: '0', // Not available in ERC20 transfer events
          gasPrice: '0', // Not available in ERC20 transfer events  
          timestamp: parseInt(transaction.timestamp),
          blockNumber: parseInt(transaction.blockNumber),
          type: isSent ? 'sent' : 'received',
          token: {
            address: transaction.token.contractAddress,
            symbol: transaction.token.symbol,
            name: transaction.token.name
          }
        } as Transaction
      })
      
    } catch (error) {
      console.error('Goldsky GraphQL request failed:', error)
      throw error
    }
  }

  // Portfolio data using Goldsky for transactions, RPC for balances
  private async getRPCPortfolioData(address: string): Promise<PortfolioData> {
    console.log(`Getting portfolio data for ${address}`)
    
    // Get balance and tokens from RPC, transactions from Goldsky only
    const [balanceData, transactions, tokens] = await Promise.all([
      this.getBalance(address),
      this.getTransactionHistory(address, 50), // This will use Goldsky only now
      this.getRPCTokenBalances(address)
    ])

    // Calculate total portfolio value
    const tokenValue = tokens.reduce((sum, token) => sum + (token.balanceUSD || 0), 0)
    const totalValue = balanceData.balanceUSD + tokenValue

    const portfolioData: PortfolioData = {
      address,
      totalValueUSD: totalValue,
      ethBalance: balanceData.balance.toString(),
      ethBalanceUSD: balanceData.balanceUSD,
      tokens,
      transactions,
      transactionCount: transactions.length,
      performance24h: 0, // Not available via RPC
      lastUpdated: Date.now()
    }

    console.log(`RPC Portfolio data collected:`, {
      balance: balanceData.balance,
      balanceUSD: balanceData.balanceUSD,
      transactionCount: transactions.length,
      tokenCount: tokens.length,
      totalValue
    })

    return portfolioData
  }

  // Keep existing RPC methods unchanged
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

    if (cached && (now - cached.timestamp) < 60000) { // 1 minute cache
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

  // Keep as fallback - the original RPC transaction method
  private async getRPCTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      console.log(`Getting RPC transaction history for ${address} (fallback method)`)
      
      const currentBlock = await this.makeRPCCall('eth_blockNumber', []) as string
      const currentBlockNum = parseInt(currentBlock, 16)
      const fromBlock = Math.max(0, currentBlockNum - 50)
      
      console.log(`Fast scan: blocks ${fromBlock} to ${currentBlockNum}`)
      
      const quickTransactions = await this.getRecentTransactionsFast(address, limit, fromBlock, currentBlockNum)
      
      if (quickTransactions.length > 0) {
        console.log(`Fast method found ${quickTransactions.length} transactions`)
        return quickTransactions
      }
      
      console.log('No recent transactions found')
      return []
      
    } catch (error) {
      console.error('Transaction history error:', error)
      return []
    }
  }

  private async getRecentTransactionsFast(address: string, limit: number, fromBlock: number, toBlock: number): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    const addressLower = address.toLowerCase()
    
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

        const relevantTxs = block.transactions.filter((tx: EthTransaction) =>
          tx.from?.toLowerCase() === addressLower ||
          tx.to?.toLowerCase() === addressLower
        )

        for (const tx of relevantTxs) {
          if (transactions.length >= limit) break
          
          const isSent = tx.from.toLowerCase() === addressLower
          const value = parseInt(tx.value || '0', 16)

          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || '',
            value: tx.value || '0',
            valueUSD: value / 1e18,
            gasPrice: tx.gasPrice || '0',
            gasUsed: tx.gas,
            blockNumber: parseInt(block.number, 16),
            timestamp: parseInt(block.timestamp, 16),
            type: isSent ? 'sent' : 'received'
          })
        }
        
      } catch (blockError) {
        console.error(`Error scanning block ${blockNum}:`, blockError)
        continue
      }
    }

    return transactions.sort((a, b) => b.blockNumber - a.blockNumber)
  }

  
  private async getRPCTokenBalances(address: string): Promise<TokenBalance[]> {
    try {
      const priorityTokens = [
       '0xb669dC8cC6D044307Ba45366C0c836eC3c7e31AA',
        '0x2252998B8281ba168Ab11b620b562035dC34EAE0',
        '0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93',
        '0xdE4251dd68e1aD5865b14Dd527E54018767Af58a',
        '0x36c16eaC6B0Ba6c50f494914ff015fCa95B7835F',
        '0x9B28B690550522608890C3C7e63c0b4A7eBab9AA',
        '0x9FEE47Bf6A2Bf54A9cE38caFF94bb50adCa4710e',
        '0xcfb6737893A18D10936bc622BCe04fc7f50776a0',
        '0x4126E0f88008610d6E6C3059d93e9814c20139cB',
        '0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F',
      ]

      const balances: TokenBalance[] = []
      
      const tokenPromises = priorityTokens.map(async (tokenAddress) => {
        try {
          return await this.getTokenBalance(address, tokenAddress)
        } catch {
          return null
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

  private async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<TokenBalance | null> {
    try {
      const [tokenInfo, balance] = await Promise.all([
        this.getTokenInfo(tokenAddress),
        this.getERC20Balance(walletAddress, tokenAddress)
      ])

      if (!tokenInfo || balance === null) return null

      const balanceFormatted = balance / Math.pow(10, tokenInfo.decimals)
      
      if (balanceFormatted === 0) return null

      return {
        token: {
          address: tokenAddress,
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          decimals: tokenInfo.decimals,
          priceUSD: 0
        },
        balance: balance.toString(),
        balanceUSD: 0
      }
    } catch (error) {
      console.error(`Error fetching token balance ${tokenAddress}:`, error)
      return null
    }
  }

  private async getERC20Balance(walletAddress: string, tokenAddress: string): Promise<number | null> {
    try {
      const balanceOfSig = '0x70a08231'
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
    
    if (cached && (Date.now() - cached.timestamp) < 3600000) {
      return cached
    }

    try {
      const [symbol, name, decimals] = await Promise.all([
        this.makeERC20Call(tokenAddress, '0x95d89b41'),
        this.makeERC20Call(tokenAddress, '0x06fdde03'), 
        this.makeERC20Call(tokenAddress, '0x313ce567')
      ])

      if (!symbol || !name || decimals === null) return null

      const tokenInfo = {
        symbol: this.decodeString(symbol as string),
        name: this.decodeString(name as string),
        decimals: parseInt(decimals as string, 16)
      }

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
      const hex = hexString.slice(2)
      const dataStart = 128
      const lengthHex = hex.slice(64, 128)
      const length = parseInt(lengthHex, 16) * 2
      const dataHex = hex.slice(dataStart, dataStart + length)
      
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

  private async getRPCHealthCheck(): Promise<{ isHealthy: boolean; latestBlock: number; chainId?: string }> {
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

interface EthTransaction {
  hash: string
  from: string
  to: string | null
  value: string
  gasPrice: string
  gas: string
}