export interface TokenConfig {
  address: string
  symbol: string
  name: string
  decimals: number
  logoUrl?: string
  coingeckoId?: string
  isNative?: boolean
}

// Citrea Testnet Token Registry
export const CITREA_TOKENS: TokenConfig[] = [
    {
        address: '0xb669dC8cC6D044307Ba45366C0c836eC3c7e31AA',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6
    },
    {
        address: '0x2252998B8281ba168Ab11b620b562035dC34EAE0',
        symbol: 'UNI-V2',
        name: 'Uniswap V2',
        decimals: 18
    },
    {
        address: '0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93',
        symbol: 'WCBTC',
        name: 'Wrapped Citrea Bitcoin',
        decimals: 8
    },
    {
        address: '0xdE4251dd68e1aD5865b14Dd527E54018767Af58a',
        symbol: 'SUMA',
        name: 'SUMA',
        decimals: 18
    },
    {
        address: '0x36c16eaC6B0Ba6c50f494914ff015fCa95B7835F',
        symbol: 'USDC',
        name: 'USDC',
        decimals: 6
    },
    {
        address: '0x9B28B690550522608890C3C7e63c0b4A7eBab9AA',
        symbol: 'NUSD',
        name: 'Nectra USD',
        decimals: 18
    },
    {
        address: '0x9FEE47Bf6A2Bf54A9cE38caFF94bb50adCa4710e',
        symbol: 'USD',
        name: 'USD',
        decimals: 18
    },
    {
        address: '0xcfb6737893A18D10936bc622BCe04fc7f50776a0',
        symbol: 'NTP',
        name: 'Nectra Position',
        decimals: 18
    },
    {
        address: '0x4126E0f88008610d6E6C3059d93e9814c20139cB',
        symbol: 'WETH',
        name: 'WETH',
        decimals: 18
    },
    {
        address: '0x69D57B9D705eaD73a5d2f2476C30c55bD755cc2F',
        symbol: 'ALGB-POS',
        name: 'Algebra Positions NFT-V2',
        decimals: 0
    }
]

// Get token config by address
export function getTokenConfig(address: string): TokenConfig | undefined {
  return CITREA_TOKENS.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  )
}

// Get all token addresses
export function getAllTokenAddresses(): string[] {
  return CITREA_TOKENS.map(token => token.address)
}

// Get priority tokens (first N tokens)
export function getPriorityTokens(count: number = 10): string[] {
  return CITREA_TOKENS.slice(0, count).map(token => token.address)
}
