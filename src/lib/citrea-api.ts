// export interface TokenBalance {
//   contract: string
//   symbol?: string
//   name?: string
//   decimals?: number
//   balance: string
//   balanceFormatted: number
//   balanceUSD?: number
// }

// export interface Transaction {
//   hash: string
//   from: string
//   to: string
//   value: string
//   valueFormatted: number
//   gasPrice: string
//   gasUsed?: string
//   blockNumber: number
//   timestamp?: number
//   status?: string
//   type?: 'sent' | 'received'
// }

// export interface PortfolioData {
//   address: string
//   balance: number
//   balanceUSD: number
//   transactions: Transaction[]
//   tokens: TokenBalance[]
//   totalValue: number
//   transactionCount: number
// }

// export class CitreaAPI {
//   private citreaRPC = 'https://rpc.testnet.citrea.xyz'
//   private routescanAPI = process.env.ROUTESCAN_API_URL || 'https://citrea.routescan.io/api'
//   private coingeckoAPI = 'https://api.coingecko.com/api/v3'
//   private routescanApiKey = process.env.ROUTESCAN_API_KEY

//   constructor() {
//     if (!process.env.CITREA_RPC_URL) {
//       console.warn('CITREA_RPC_URL not set, using default testnet RPC')
//     } else {
//       this.citreaRPC = process.env.CITREA_RPC_URL
//     }
//   }

//   private async makeRPCCall(method: string, params: any[] = []): Promise<any> {
//     try {
//       const response = await fetch(this.citreaRPC, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify({
//           jsonrpc: '2.0',
//           id: Date.now(),
//           method,
//           params
//         })
//       })

//       if (!response.ok) {
//         throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
//       }

//       const data = await response.json()
      
//       if (data.error) {
//         throw new Error(`RPC Error: ${data.error.message} (Code: ${data.error.code})`)
//       }

//       return data.result
//     } catch (error) {
//       console.error(`RPC call failed for method ${method}:`, error)
//       throw error
//     }
//   }

//   async getBalance(address: string): Promise<{ balance: number; balanceWei: string; balanceUSD: number }> {
//     try {
//       const balanceWei = await this.makeRPCCall('eth_getBalance', [address, 'latest'])
//       const balance = parseInt(balanceWei, 16) / 1e18

//       // Get BTC price for USD conversion
//       const btcPrice = await this.getBTCPrice()
//       const balanceUSD = balance * btcPrice

//       return {
//         balance,
//         balanceWei,
//         balanceUSD
//       }
//     } catch (error) {
//       console.error('Balance fetch error:', error)
//       throw new Error('Failed to fetch wallet balance')
//     }
//   }

  
//   private async getBTCPrice(): Promise<number> {
//     try {
//       const response = await fetch(`${this.coingeckoAPI}/simple/price?ids=bitcoin&vs_currencies=usd`, {
//         //(5minutes cache)
//         next: { revalidate: 300 }
//       })
      
//       if (!response.ok) return 0
      
//       const data = await response.json()
//       return data.bitcoin?.usd || 0
//     } catch (error) {
//       console.error('Price fetch error:', error)
//       return 0
//     }
//   }

 
// async getTokenBalances(address: string, tokenContracts: string[] = []): Promise<TokenBalance[]> {
//   const balances: TokenBalance[] = []
  
//   try {
//     // First, try to get all tokens owned by the address from the explorer API
//     const explorerBalances = await this.getTokenBalancesFromExplorer(address)
//     balances.push(...explorerBalances)
    
//     // Additionally check specific token contracts if provided
//     for (const tokenContract of tokenContracts) {
//       // Skip if we already have this token from explorer
//       if (balances.some(b => b.contract.toLowerCase() === tokenContract.toLowerCase())) {
//         continue
//       }
      
//       try {
//         // Get token balance using explorer API
//         const tokenBalance = await this.getTokenBalanceFromExplorer(address, tokenContract)
//         if (tokenBalance) {
//           balances.push(tokenBalance)
//         }
//       } catch (error) {
//         console.error(`Token balance error for ${tokenContract}:`, error)
//         // Fallback to RPC call if explorer API fails
//         try {
//           const rpcBalance = await this.getTokenBalanceFromRPC(address, tokenContract)
//           if (rpcBalance) {
//             balances.push(rpcBalance)
//           }
//         } catch (rpcError) {
//           console.error(`RPC token balance error for ${tokenContract}:`, rpcError)
//           // Continue with next token
//         }
//       }
//     }
//   } catch (error) {
//     console.error('Explorer API failed, falling back to RPC method:', error)
//     // Fallback to original RPC method
//     return await this.getTokenBalancesFromRPC(address, tokenContracts)
//   }
  
//   return balances.filter(b => b.balanceFormatted > 0)
// }

// // Get all token balances from Citrea explorer API
// private async getTokenBalancesFromExplorer(address: string): Promise<TokenBalance[]> {
//   const response = await fetch(
//     `https://explorer.testnet.citrea.xyz/api?module=account&action=tokenlist&address=${address}`
//   )
  
//   if (!response.ok) {
//     throw new Error(`Explorer API failed: ${response.status}`)
//   }
  
//   const data = await response.json()
  
//   if (data.status !== '1' || !data.result) {
//     throw new Error('Explorer API returned error or no data')
//   }
  
//   return data.result.map((token: any) => ({
//     contract: token.contractAddress,
//     symbol: token.symbol,
//     name: token.name,
//     decimals: parseInt(token.decimals),
//     balance: token.balance,
//     balanceFormatted: parseInt(token.balance) / Math.pow(10, parseInt(token.decimals)),
//     balanceUSD: 0 // Would need token price data
//   }))
// }

// // Get specific token balance from Citrea explorer API
// private async getTokenBalanceFromExplorer(address: string, contractAddress: string): Promise<TokenBalance | null> {
//   const response = await fetch(
//     `https://explorer.testnet.citrea.xyz/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}`
//   )
  
//   if (!response.ok) {
//     throw new Error(`Explorer API failed: ${response.status}`)
//   }
  
//   const data = await response.json()
  
//   if (data.status !== '1' || !data.result || data.result === '0') {
//     return null
//   }
  
//   // Get token details
//   const tokenInfo = await this.getTokenInfo(contractAddress)
  
//   return {
//     contract: contractAddress,
//     symbol: tokenInfo?.symbol || 'UNKNOWN',
//     name: tokenInfo?.name || 'Unknown Token',
//     decimals: tokenInfo?.decimals || 18,
//     balance: data.result,
//     balanceFormatted: parseInt(data.result) / Math.pow(10, tokenInfo?.decimals || 18),
//     balanceUSD: 0
//   }
// }

// // Get token information from Citrea explorer API
// private async getTokenInfo(contractAddress: string): Promise<{symbol: string, name: string, decimals: number} | null> {
//   try {
//     const response = await fetch(
//       `https://explorer.testnet.citrea.xyz/api?module=token&action=getToken&contractaddress=${contractAddress}`
//     )
    
//     if (!response.ok) {
//       return null
//     }
    
//     const data = await response.json()
    
//     if (data.status !== '1' || !data.result) {
//       return null
//     }
    
//     return {
//       symbol: data.result.symbol,
//       name: data.result.name,
//       decimals: parseInt(data.result.decimals)
//     }
//   } catch (error) {
//     console.error(`Token info error for ${contractAddress}:`, error)
//     return null
//   }
// }

// // Fallback RPC method (your original implementation)
// private async getTokenBalancesFromRPC(address: string, tokenContracts: string[] = []): Promise<TokenBalance[]> {
//   const balances: TokenBalance[] = []
  
//   // Common Citrea testnet tokens (you can expand this list)
//   const defaultTokens: string[] = [
//     '0xb669dC8cC6D044307Ba45366C0c836eC3c7e31AA', // USD Coin (USDC)
//     '0x2252998B8281ba168Ab11b620b562035dC34EAE0', // Uniswap V2 (UNI-V2)
//     '0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93', // Wrapped Citrea Bitcoin (WCBTC)
//     '0xdE4251dd68e1aD5865b14Dd527E54018767Af58a', // SUMA (SUMA)
//     '0x36c16eaC6B0Ba6c50f494914ff015fCa95B7835F', // USDC (USDC)
//     '0x9B28B690550522608890C3C7e63c0b4A7eBab9AA', // Nectra USD (NUSD)
//     '0x9FEE47Bf6A2Bf54A9cE38caFF94bb50adCa4710e', // USD (USD)
//     '0xcfb6737893A18D10936bc622BCe04fc7f50776a0', // Nectra Position (NTP)
//     '0x4126E0f88008610d6E6C3059d93e9814c20139cB', // WETH (WETH)
//     '0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F', // Algebra Positions NFT-V2 (ALGB-POS)
//   ]
  
//   const tokensToCheck: string[] = [...tokenContracts, ...defaultTokens]

//   for (const tokenContract of tokensToCheck) {
//     try {
//       const rpcBalance = await this.getTokenBalanceFromRPC(address, tokenContract)
//       if (rpcBalance) {
//         balances.push(rpcBalance)
//       }
//     } catch (error) {
//       console.error(`Token balance error for ${tokenContract}:`, error)
//       // Continue with next token
//     }
//   }
  
//   return balances.filter(b => b.balanceFormatted > 0)
// }

// // Get single token balance via RPC
// private async getTokenBalanceFromRPC(address: string, tokenContract: string): Promise<TokenBalance | null> {
//   // Get token balance
//   const balanceResult = await this.makeRPCCall('eth_call', [{
//     to: tokenContract,
//     data: `0x70a08231000000000000000000000000${address.slice(2)}` // balanceOf(address)
//   }, 'latest'])

//   if (!balanceResult || balanceResult === '0x0') {
//     return null
//   }

//   const balance = parseInt(balanceResult, 16)
  
//   // Get token decimals
//   let decimals = 18 // Default
//   try {
//     const decimalsResult = await this.makeRPCCall('eth_call', [{
//       to: tokenContract,
//       data: '0x313ce567' // decimals()
//     }, 'latest'])
//     if (decimalsResult) {
//       decimals = parseInt(decimalsResult, 16)
//     }
//   } catch (e) {
//     // Use default decimals if call fails
//   }

//   // Get token symbol
//   let symbol = 'UNKNOWN'
//   try {
//     const symbolResult = await this.makeRPCCall('eth_call', [{
//       to: tokenContract,
//       data: '0x95d89b41' // symbol()
//     }, 'latest'])
//     if (symbolResult && symbolResult !== '0x') {
//       // Decode hex string to ASCII
//       symbol = this.hexToString(symbolResult)
//     }
//   } catch (e) {
//     // Use default symbol if call fails
//   }

//   // Get token name
//   let name = 'Unknown Token'
//   try {
//     const nameResult = await this.makeRPCCall('eth_call', [{
//       to: tokenContract,
//       data: '0x06fdde03' 
//     }, 'latest'])
//     if (nameResult && nameResult !== '0x') {
//       name = this.hexToString(nameResult)
//     }
//   } catch (e) {
  
//   }

//   return {
//     contract: tokenContract,
//     symbol,
//     name,
//     decimals,
//     balance: balance.toString(),
//     balanceFormatted: balance / Math.pow(10, decimals),
//     balanceUSD: 0 
//   }
// }

// // Helper function to convert hex string to ASCII (keep your existing implementation)
// private hexToString(hex: string): string {
//   try {
//     const cleanHex = hex.replace('0x', '')
//     let str = ''
//     for (let i = 0; i < cleanHex.length; i += 2) {
//       const charCode = parseInt(cleanHex.substr(i, 2), 16)
//       if (charCode > 0) {
//         str += String.fromCharCode(charCode)
//       }
//     }
//     return str.trim() || 'UNKNOWN'
//   } catch {
//     return 'UNKNOWN'
//   }
// }

//   // Get transaction history
//   async getTransactionHistory(address: string, limit = 50): Promise<Transaction[]> {
//     try {
//       // First try Routescan API if available
//       if (this.routescanApiKey) {
//         try {
//           const routescanTxs = await this.getTransactionsFromRoutescan(address, limit)
//           if (routescanTxs.length > 0) {
//             return routescanTxs
//           }
//         } catch (error) {
//           console.log('Routescan failed, falling back to RPC scan')
//         }
//       }

//       // Fallback to RPC block scanning
//       return await this.getTransactionsFromRPC(address, limit)
//     } catch (error) {
//       console.error('Transaction history error:', error)
//       return []
//     }
//   }

//   // Get transactions from Routescan API
//   private async getTransactionsFromRoutescan(address: string, limit: number): Promise<Transaction[]> {
//     const headers: Record<string, string> = {
//       'Content-Type': 'application/json'
//     }
    
//     if (this.routescanApiKey) {
//       headers['Authorization'] = `Bearer ${this.routescanApiKey}`
//     }

//     const response = await fetch(
//       `${this.routescanAPI}/account/${address}/transactions?limit=${limit}`,
//       { headers }
//     )

//     if (!response.ok) {
//       throw new Error('Routescan API failed')
//     }

//     const data = await response.json()
//     return this.transformRoutescanTransactions(data.transactions || [], address)
//   }

//   // Transform Routescan transaction data
//   private transformRoutescanTransactions(transactions: any[], userAddress: string): Transaction[] {
//     return transactions.map(tx => ({
//       hash: tx.hash,
//       from: tx.from,
//       to: tx.to,
//       value: tx.value,
//       valueFormatted: parseInt(tx.value || '0', 16) / 1e18,
//       gasPrice: tx.gasPrice,
//       gasUsed: tx.gasUsed,
//       blockNumber: parseInt(tx.blockNumber, 16),
//       timestamp: tx.timestamp,
//       status: tx.status === '1' ? 'success' : 'failed',
//       type: tx.from.toLowerCase() === userAddress.toLowerCase() ? 'sent' : 'received'
//     }))
//   }

//   // Get transactions by scanning recent blocks (RPC fallback)
//   private async getTransactionsFromRPC(address: string, limit: number): Promise<Transaction[]> {
//     const transactions: Transaction[] = []
//     const lowerAddress = address.toLowerCase()
    
//     try {
//       // Get latest block number
//       const latestBlock = await this.makeRPCCall('eth_blockNumber')
//       const latestBlockNumber = parseInt(latestBlock, 16)
      
//       // Scan recent blocks (limit to prevent timeout)
//       const blocksToScan = Math.min(1000, latestBlockNumber)
      
//       for (let i = 0; i < blocksToScan && transactions.length < limit; i++) {
//         const blockNumber = latestBlockNumber - i
//         const blockNumberHex = `0x${blockNumber.toString(16)}`
        
//         try {
//           const block = await this.makeRPCCall('eth_getBlockByNumber', [blockNumberHex, true])
          
//           if (block && block.transactions) {
//             const relevantTxs = block.transactions.filter((tx: any) => 
//               tx.from?.toLowerCase() === lowerAddress || 
//               tx.to?.toLowerCase() === lowerAddress
//             )
            
//             for (const tx of relevantTxs) {
//               const transaction: Transaction = {
//                 hash: tx.hash,
//                 from: tx.from,
//                 to: tx.to || '',
//                 value: tx.value,
//                 valueFormatted: parseInt(tx.value || '0', 16) / 1e18,
//                 gasPrice: tx.gasPrice,
//                 blockNumber: blockNumber,
//                 timestamp: parseInt(block.timestamp, 16),
//                 type: tx.from.toLowerCase() === lowerAddress ? 'sent' : 'received'
//               }
              
//               transactions.push(transaction)
              
//               if (transactions.length >= limit) break
//             }
//           }
//         } catch (blockError) {
//           console.error(`Error fetching block ${blockNumber}:`, blockError)
//           // Continue with next block
//         }
//       }
//     } catch (error) {
//       console.error('RPC transaction scan error:', error)
//     }
    
//     return transactions
//       .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
//       .slice(0, limit)
//   }

//   // Get complete portfolio data
//   async getPortfolioData(address: string): Promise<PortfolioData> {
//     try {
//       // Fetch all data in parallel
//       const [balance, tokens, transactions] = await Promise.allSettled([
//         this.getBalance(address),
//         this.getTokenBalances(address),
//         this.getTransactionHistory(address, 50)
//       ])

//       const balanceData = balance.status === 'fulfilled' ? balance.value : { balance: 0, balanceWei: '0x0', balanceUSD: 0 }
//       const tokenData = tokens.status === 'fulfilled' ? tokens.value : []
//       const transactionData = transactions.status === 'fulfilled' ? transactions.value : []

//       // Calculate total portfolio value
//       const totalTokenValue = tokenData.reduce((sum, token) => sum + (token.balanceUSD || 0), 0)
//       const totalValue = balanceData.balanceUSD + totalTokenValue

//       return {
//         address,
//         balance: balanceData.balance,
//         balanceUSD: balanceData.balanceUSD,
//         transactions: transactionData,
//         tokens: tokenData,
//         totalValue,
//         transactionCount: transactionData.length
//       }
//     } catch (error) {
//       console.error('Portfolio data fetch error:', error)
//       throw new Error('Failed to fetch portfolio data')
//     }
//   }

//   // Health check method
//   async healthCheck(): Promise<{ isHealthy: boolean; latestBlock: number; chainId?: string }> {
//     try {
//       const [blockNumber, chainId] = await Promise.all([
//         this.makeRPCCall('eth_blockNumber'),
//         this.makeRPCCall('eth_chainId')
//       ])

//       return {
//         isHealthy: true,
//         latestBlock: parseInt(blockNumber, 16),
//         chainId: chainId
//       }
//     } catch (error) {
//       return {
//         isHealthy: false,
//         latestBlock: 0
//       }
//     }
//   }
// }




//PERFORMANCE OPTIMIZATIONS

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
    if (!process.env.CITREA_RPC_URL) {
      console.warn('CITREA_RPC_URL not set, using default testnet RPC')
    } else {
      this.citreaRPC = process.env.CITREA_RPC_URL
    }
  }

  // Basic RPC call without timeout
  private async makeRPCCall(method: string, params: any[] = []): Promise<any> {
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
        throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`RPC Error: ${data.error.message} (Code: ${data.error.code})`)
      }

      return data.result
    } catch (error: unknown) {
      console.error(`RPC call failed for method ${method}:`, error)
      throw error
    }
  }

  // CRITICAL FIX: Batch RPC calls together without timeout
  private async makeBatchRPCCall(calls: { method: string; params: any[] }[]): Promise<any[]> {
    try {
      const batchPayload = calls.map((call, index) => ({
        jsonrpc: '2.0',
        id: index,
        method: call.method,
        params: call.params
      }))

      const response = await fetch(this.citreaRPC, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(batchPayload)
      })

      if (!response.ok) {
        throw new Error(`Batch RPC request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return Array.isArray(data) ? data.map(item => item.result) : [data.result]
    } catch (error: unknown) {
      console.error('Batch RPC call failed:', error)
      throw error
    }
  }

  async getBalance(address: string): Promise<{ balance: number; balanceWei: string; balanceUSD: number }> {
    try {
      const [balanceWei, btcPrice] = await Promise.all([
        this.makeRPCCall('eth_getBalance', [address, 'latest']),
        this.getBTCPrice()
      ])

      const balance = parseInt(balanceWei, 16) / 1e18
      const balanceUSD = balance * btcPrice

      return {
        balance,
        balanceWei,
        balanceUSD
      }
    } catch (error) {
      console.error('Balance fetch error:', error)
      throw new Error('Failed to fetch wallet balance')
    }
  }

  // PERFORMANCE FIX: Cache BTC price for 5 minutes
  private async getBTCPrice(): Promise<number> {
    const cacheKey = 'btc_price'
    const now = Date.now()
    const cached = this.priceCache[cacheKey]

    // Return cached price if less than 5 minutes old
    if (cached && (now - cached.timestamp) < 300000) {
      return cached.price
    }

    try {
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 3000)

      const response = await fetch(`${this.coingeckoAPI}/simple/price?ids=bitcoin&vs_currencies=usd`, {
        signal: controller.signal
      })
      
      if (!response.ok) return cached?.price || 60000 // Fallback to cached or default price
      
      const data = await response.json()
      const price = data.bitcoin?.usd || 60000

      // Cache the price
      this.priceCache[cacheKey] = { price, timestamp: now }
      return price
    } catch (error) {
      console.error('Price fetch error:', error)
      return cached?.price || 60000 // Return cached or fallback price
    }
  }

  // MAJOR PERFORMANCE FIX: Limit and parallelize token queries
  async getTokenBalances(address: string, tokenContracts: string[] = []): Promise<TokenBalance[]> {
    try {
      // First, try explorer API with timeout
      const explorerBalances = await Promise.race([
        this.getTokenBalancesFromExplorer(address),
        new Promise<TokenBalance[]>((_, reject) => 
          setTimeout(() => reject(new Error('Explorer timeout')), 8000)
        )
      ])
      
      if (explorerBalances.length > 0) {
        return explorerBalances.slice(0, 20) // Limit to 20 tokens max
      }
    } catch (error) {
      console.log('Explorer API failed, using limited RPC fallback')
    }

    // Fallback: Only check top 5 most important tokens to avoid timeout
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

    const tokensToCheck = [...tokenContracts.slice(0, 3), ...priorityTokens].slice(0, 8)
    
    // CRITICAL FIX: Process tokens in parallel with Promise.allSettled
    const tokenPromises = tokensToCheck.map(contract => 
      this.getTokenBalanceFromRPC(address, contract).catch(() => null)
    )

    const results = await Promise.allSettled(tokenPromises)
    const balances = results
      .filter(result => result.status === 'fulfilled' && result.value !== null)
      .map(result => (result as PromiseFulfilledResult<TokenBalance>).value)
      .filter(balance => balance.balanceFormatted > 0)

    return balances
  }

  // PERFORMANCE FIX: Add timeout to explorer API calls
  private async getTokenBalancesFromExplorer(address: string): Promise<TokenBalance[]> {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      `https://explorer.testnet.citrea.xyz/api?module=account&action=tokenlist&address=${address}`,
      { signal: controller.signal }
    )
    
    if (!response.ok) {
      throw new Error(`Explorer API failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== '1' || !data.result) {
      throw new Error('Explorer API returned error or no data')
    }
    
    return data.result
      .map((token: any) => ({
        contract: token.contractAddress,
        symbol: token.symbol,
        name: token.name,
        decimals: parseInt(token.decimals),
        balance: token.balance,
        balanceFormatted: parseInt(token.balance) / Math.pow(10, parseInt(token.decimals)),
        balanceUSD: 0
      }))
      .filter((token: TokenBalance) => token.balanceFormatted > 0)
      .slice(0, 15) // Limit results
  }

  // PERFORMANCE FIX: Cache token info and use batch calls
  private async getTokenBalanceFromRPC(address: string, tokenContract: string): Promise<TokenBalance | null> {
    try {
      // Batch all token calls together
      const calls = [
        { method: 'eth_call', params: [{ to: tokenContract, data: `0x70a08231000000000000000000000000${address.slice(2)}` }, 'latest'] }, // balance
        { method: 'eth_call', params: [{ to: tokenContract, data: '0x313ce567' }, 'latest'] }, // decimals
        { method: 'eth_call', params: [{ to: tokenContract, data: '0x95d89b41' }, 'latest'] }, // symbol
        { method: 'eth_call', params: [{ to: tokenContract, data: '0x06fdde03' }, 'latest'] }  // name
      ]

      const [balanceResult, decimalsResult, symbolResult, nameResult] = await this.makeBatchRPCCall(calls)

      if (!balanceResult || balanceResult === '0x0') {
        return null
      }

      const balance = parseInt(balanceResult, 16)
      if (balance === 0) return null

      // Use cached token info if available
      const cacheKey = tokenContract.toLowerCase()
      let tokenInfo = this.tokenInfoCache[cacheKey]
      const now = Date.now()

      if (!tokenInfo || (now - tokenInfo.timestamp) > 3600000) { // Cache for 1 hour
        const decimals = decimalsResult ? parseInt(decimalsResult, 16) : 18
        const symbol = symbolResult && symbolResult !== '0x' ? this.hexToString(symbolResult) : 'UNKNOWN'
        const name = nameResult && nameResult !== '0x' ? this.hexToString(nameResult) : 'Unknown Token'

        tokenInfo = { symbol, name, decimals, timestamp: now }
        this.tokenInfoCache[cacheKey] = tokenInfo
      }

      return {
        contract: tokenContract,
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        decimals: tokenInfo.decimals,
        balance: balance.toString(),
        balanceFormatted: balance / Math.pow(10, tokenInfo.decimals),
        balanceUSD: 0
      }
    } catch (error) {
      console.error(`Token balance error for ${tokenContract}:`, error)
      return null
    }
  }

  private hexToString(hex: string): string {
    try {
      const cleanHex = hex.replace('0x', '')
      let str = ''
      for (let i = 0; i < cleanHex.length; i += 2) {
        const charCode = parseInt(cleanHex.substr(i, 2), 16)
        if (charCode > 0) {
          str += String.fromCharCode(charCode)
        }
      }
      return str.trim() || 'UNKNOWN'
    } catch {
      return 'UNKNOWN'
    }
  }

  // Direct RPC transaction scanning without Routescan
  async getTransactionHistory(address: string, limit = 20): Promise<Transaction[]> {
    try {
      console.log(`Fetching transaction history for ${address}, limit: ${limit}`);
      
      // Use RPC directly with increased block range to 1000 blocks
      console.log('Using RPC for transaction scanning');
      const rpcTxs = await this.getTransactionsFromRPC(address, limit, 1000);
      console.log(`RPC scan returned ${rpcTxs.length} transactions`);
      return rpcTxs;
    } catch (error) {
      console.error('Transaction history error:', error);
      // Return empty array instead of throwing
      return [];
    }
  }

  // MAJOR PERFORMANCE FIX: Allow configurable block scanning range
  private async getTransactionsFromRPC(address: string, limit: number, blocksToScan: number = 50): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    const lowerAddress = address.toLowerCase()
    
    try {
      console.log(`RPC Scan: Scanning ${blocksToScan} blocks for address ${address}`);
      const latestBlock = await this.makeRPCCall('eth_blockNumber', [])
      const latestBlockNumber = parseInt(latestBlock, 16)
      
      // Use configurable block scan range
      const actualBlocksToScan = Math.min(blocksToScan, latestBlockNumber);
      console.log(`RPC Scan: Latest block is ${latestBlockNumber}, scanning ${actualBlocksToScan} blocks`);
      
      const blockPromises: Promise<any>[] = []

      // Batch block requests
      for (let i = 0; i < blocksToScan && i < latestBlockNumber; i++) {
        const blockNumber = latestBlockNumber - i
        const blockNumberHex = `0x${blockNumber.toString(16)}`
        blockPromises.push(
          this.makeRPCCall('eth_getBlockByNumber', [blockNumberHex, true])
            .catch(() => null)
        )
      }

      const blocks = await Promise.allSettled(blockPromises)
      
      for (const blockResult of blocks) {
        if (blockResult.status === 'fulfilled' && blockResult.value) {
          const block = blockResult.value
          if (block && block.transactions) {
            const relevantTxs = block.transactions
              .filter((tx: any) => 
                tx.from?.toLowerCase() === lowerAddress || 
                tx.to?.toLowerCase() === lowerAddress
              )
              .slice(0, limit - transactions.length)

            for (const tx of relevantTxs) {
              transactions.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to || '',
                value: tx.value,
                valueFormatted: parseInt(tx.value || '0', 16) / 1e18,
                gasPrice: tx.gasPrice,
                blockNumber: parseInt(block.number, 16),
                timestamp: parseInt(block.timestamp, 16),
                type: tx.from.toLowerCase() === lowerAddress ? 'sent' : 'received'
              })

              if (transactions.length >= limit) break
            }
          }
        }
        if (transactions.length >= limit) break
      }
    } catch (error) {
      console.error('RPC transaction scan error:', error)
    }
    
    return transactions
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, limit)
  }

  // PERFORMANCE FIX: Set aggressive timeouts and use Promise.allSettled
  async getPortfolioData(address: string): Promise<PortfolioData> {
    try {
      console.log(`Fetching portfolio data for address: ${address}`)
      
      // Direct calls without timeouts
      const balancePromise = this.getBalance(address)
      const tokensPromise = this.getTokenBalances(address)
      const transactionsPromise = this.getTransactionHistory(address, 10) // Reduced from 50 to 10

      // Use Promise.allSettled with explicit generic expectations
      const [balanceResult, tokensResult, transactionsResult] = await Promise.allSettled([
        balancePromise,
        tokensPromise,
        transactionsPromise
      ])

      // Handle results with fallbacks (explicit typing)
      const balanceData: { balance: number; balanceWei: string; balanceUSD: number } =
        balanceResult.status === 'fulfilled'
          ? balanceResult.value
          : { balance: 0, balanceWei: '0x0', balanceUSD: 0 }
      
      const tokenData: TokenBalance[] =
        tokensResult.status === 'fulfilled'
          ? tokensResult.value
          : []
      
      const transactionData: Transaction[] =
        transactionsResult.status === 'fulfilled'
          ? transactionsResult.value
          : []

      // Log errors but don't fail
      if (balanceResult.status === 'rejected') {
        console.error('Balance fetch failed:', balanceResult.reason)
      }
      if (tokensResult.status === 'rejected') {
        console.error('Tokens fetch failed:', tokensResult.reason)
      }
      if (transactionsResult.status === 'rejected') {
        console.error('Transactions fetch failed:', transactionsResult.reason)
      }

      const totalTokenValue = tokenData.reduce<number>((sum, token) => sum + (token.balanceUSD || 0), 0)
      const totalValue = balanceData.balanceUSD + totalTokenValue

      const result: PortfolioData = {
        address,
        balance: balanceData.balance,
        balanceUSD: balanceData.balanceUSD,
        transactions: transactionData,
        tokens: tokenData,
        totalValue,
        transactionCount: transactionData.length
      }

      console.log(`Successfully fetched portfolio for ${address}:`, {
        balance: result.balance,
        balanceUSD: result.balanceUSD,
        tokens: result.tokens.length,
        transactions: result.transactions.length
      })

      return result
    } catch (error) {
      console.error('Portfolio data fetch error:', error)
      throw new Error('Failed to fetch portfolio data')
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; latestBlock: number; chainId?: string }> {
    try {
      const [blockNumber, chainId] = await Promise.all([
        this.makeRPCCall('eth_blockNumber', []),
        this.makeRPCCall('eth_chainId', [])
      ])

      return {
        isHealthy: true,
        latestBlock: parseInt(blockNumber, 16),
        chainId: chainId
      }
    } catch (error) {
      return {
        isHealthy: false,
        latestBlock: 0
      }
    }
  }
}