"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CITREA_TOKENS, type TokenConfig } from "@/lib/token-config"

interface AddTokenProps {
  onTokenAdded?: (token: TokenConfig) => void
}

export function AddTokenComponent({ onTokenAdded }: AddTokenProps) {
  const [isAddingToken, setIsAddingToken] = useState(false)
  const [tokenAddress, setTokenAddress] = useState("")
  const [customTokens, setCustomTokens] = useState<TokenConfig[]>([])
  const [loading, setLoading] = useState(false)

  const handleAddToken = async () => {
    if (!tokenAddress.trim()) return

    setLoading(true)
    try {
      // Basic validation
      if (!tokenAddress.startsWith('0x') || tokenAddress.length !== 42) {
        alert('Please enter a valid token contract address')
        return
      }

      // Check if token already exists
      const exists = [...CITREA_TOKENS, ...customTokens].some(
        t => t.address.toLowerCase() === tokenAddress.toLowerCase()
      )

      if (exists) {
        alert('Token already exists in the list')
        return
      }

      // Here you would typically fetch token info from the blockchain
      // For now, we'll create a basic token config
      const newToken: TokenConfig = {
        address: tokenAddress,
        symbol: `TOKEN${customTokens.length + 1}`, // Placeholder
        name: `Custom Token ${customTokens.length + 1}`, // Placeholder
        decimals: 18, // Default
      }

      setCustomTokens(prev => [...prev, newToken])
      onTokenAdded?.(newToken)
      setTokenAddress("")
      setIsAddingToken(false)

      // You could save to localStorage here:
      // localStorage.setItem('customTokens', JSON.stringify([...customTokens, newToken]))

    } catch (error) {
      console.error('Error adding token:', error)
      alert('Failed to add token. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const removeCustomToken = (address: string) => {
    setCustomTokens(prev => prev.filter(t => t.address !== address))
  }

  return (
    <Card className="p-6 bg-gray-900/50 border-orange-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Token Management</h3>
        <Button
          onClick={() => setIsAddingToken(!isAddingToken)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isAddingToken ? 'Cancel' : 'Add Token'}
        </Button>
      </div>

      {isAddingToken && (
        <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Token Contract Address
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={handleAddToken}
                disabled={loading || !tokenAddress.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Adding...' : 'Add Token'}
              </Button>
              <Button
                onClick={() => {
                  setIsAddingToken(false)
                  setTokenAddress("")
                }}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Default Tokens */}
      <div className="mb-6">
        <h4 className="text-lg font-medium mb-3">Supported Tokens</h4>
        <div className="flex flex-wrap gap-2">
          {CITREA_TOKENS.slice(0, 6).map((token) => (
            <Badge
              key={token.address}
              className="bg-blue-600/20 text-blue-300 border-blue-500/30"
            >
              {token.symbol} - {token.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Custom Tokens */}
      {customTokens.length > 0 && (
        <div>
          <h4 className="text-lg font-medium mb-3">Custom Tokens</h4>
          <div className="space-y-2">
            {customTokens.map((token) => (
              <div
                key={token.address}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
              >
                <div>
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.name}</div>
                  <div className="text-xs text-gray-500">
                    {token.address.slice(0, 10)}...{token.address.slice(-8)}
                  </div>
                </div>
                <Button
                  onClick={() => removeCustomToken(token.address)}
                  size="sm"
                  className="bg-red-600/20 hover:bg-red-600/40 text-red-300"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h5 className="font-medium text-blue-300 mb-2">How to add tokens:</h5>
        <ul className="text-sm text-blue-200 space-y-1">
          <li>• Find the token contract address on Citrea testnet</li>
          <li>• Paste the address (must start with 0x)</li>
          <li>• The token will be automatically detected in your wallet</li>
          <li>• Make sure the token exists on Citrea testnet</li>
        </ul>
      </div>
    </Card>
  )
}
