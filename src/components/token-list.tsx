"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getTokenConfig } from "@/lib/token-config"
import { Plus } from "lucide-react"
import Image from "next/image"

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

interface TokenListProps {
  tokens: Token[]
  nativeBalance?: number
  totalBalanceUSD?: number
  onAddTokenClick?: () => void
}

export function TokenList({ tokens, nativeBalance = 0, totalBalanceUSD = 0, onAddTokenClick }: TokenListProps) {
  // native token
  const nativeToken = nativeBalance > 0 ? {
    symbol: 'CBTC',
    balanceFormatted: nativeBalance,
    balanceUSD: totalBalanceUSD,
    address: 'native',
    decimals: 8,
    valueUSD: totalBalanceUSD,
    formattedBalance: `${nativeBalance.toFixed(6)} CBTC`,
    percentage: totalBalanceUSD > 0 ? (totalBalanceUSD / (totalBalanceUSD + tokens.reduce((sum, t) => sum + (t.valueUSD || 0), 0))) * 100 : 100
  } : null

  // Combine native token with other tokens
  const allTokens = nativeToken ? [nativeToken, ...tokens] : tokens

  // Sort tokens by USD value (highest first)
  const sortedTokens = allTokens.sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0))

  if (sortedTokens.length === 0) {
    return (
      <Card className="p-6 bg-gray-900/50 border-orange-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Token Holdings</h3>
          {onAddTokenClick && (
            <Button
              onClick={onAddTokenClick}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Add Token
            </Button>
          )}
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No tokens found</div>
          <div className="text-sm text-gray-500 mb-4">
            Your wallet doesn&apos;t contain any tokens yet
          </div>
          {onAddTokenClick && (
            <Button
              onClick={onAddTokenClick}
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 mx-auto"
            >
              <Plus size={16} />
              Add Your First Token
            </Button>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-gray-900/50 border-orange-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Token Holdings</h3>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            {sortedTokens.length} token{sortedTokens.length !== 1 ? 's' : ''}
          </div>
          {onAddTokenClick && (
            <Button
              onClick={onAddTokenClick}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
            >
              <Plus size={16} />
              Add Token
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-3">
        {sortedTokens.map((token, index) => (
          <div 
            key={token.address || token.symbol || index}
            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-orange-500/30 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Token Icon */}
              {(() => {
                const tokenConfig = getTokenConfig(token.address || '')
                if (tokenConfig?.logoUrl && token.address !== 'native') {
                  return (
                    <div className="w-10 h-10 relative">
                      <Image
                        src={tokenConfig.logoUrl}
                        alt={token.symbol}
                        width={40}
                        height={40}
                        className="rounded-full"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLElement
                          target.style.display = 'none'
                          if (target.nextElementSibling) {
                            (target.nextElementSibling as HTMLElement).style.display = 'flex'
                          }
                        }}
                      />
                      {/* Fallback placeholder */}
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center" style={{display: 'none'}}>
                        <span className="text-white font-bold text-sm">
                          {token.symbol.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )
                } else {
                  // Default placeholder for native token or tokens without logo
                  return (
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {token.symbol.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )
                }
              })()}
              
              <div>
                <div className="font-medium text-white">{token.symbol}</div>
                <div className="text-sm text-gray-400">
                  {token.address === 'native' ? 'Native Token' : 
                   (() => {
                     const tokenConfig = getTokenConfig(token.address || '')
                     return tokenConfig?.name || `${token.address?.slice(0, 6)}...${token.address?.slice(-4)}` || 'Unknown Address'
                   })()}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-medium text-white">
                {token.balanceFormatted.toFixed(6)} {token.symbol}
              </div>
              <div className="text-sm text-gray-400">
                ${token.valueUSD?.toLocaleString() || '0.00'}
              </div>
              {token.percentage > 0 && (
                <div className="text-xs text-orange-500">
                  {token.percentage.toFixed(1)}% of portfolio
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Portfolio Value</span>
          <span className="text-white font-medium">
            ${(nativeToken?.valueUSD || 0 + tokens.reduce((sum, t) => sum + (t.valueUSD || 0), 0)).toLocaleString()}
          </span>
        </div>
      </div>
    </Card>
  )
}
