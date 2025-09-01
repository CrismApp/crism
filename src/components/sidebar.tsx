"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TrendingUp, Wallet, ShoppingBag, LogOut, Copy, Check } from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  walletAddress?: string
  onDisconnect?: () => void
  onNavigate?: () => void // Callback to close mobile menu on navigation
}

export function Sidebar({ walletAddress, onDisconnect, onNavigate }: SidebarProps) {
  const pathname = usePathname()
  const [copied, setCopied] = useState(false)

  
  const formatAddress = (address: string): string => {
    if (!address) return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleNavClick = () => {
    onNavigate?.()
  }

  const handleCopyAddress = async () => {
    if (!walletAddress) return
    
    try {
      await navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b border-orange-500/20 px-6">
        <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <span className="text-xl font-bold text-orange-500">Crism</span>
      </div>

      {/* Wallet Info - Enhanced with copy and disconnect icons */}
      {walletAddress && (
        <div className="p-4">
          <div className="flex items-center gap-2 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Wallet className="h-5 w-5 text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <p className="text-base font-mono text-orange-500 truncate">{formatAddress(walletAddress)}</p>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-orange-500/20 rounded transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400 hover:text-orange-500" />
                  )}
                </button>
                {onDisconnect && (
                  <button
                    onClick={onDisconnect}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Disconnect wallet"
                  >
                    <LogOut className="h-4 w-4 text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-1 px-3 flex-1 mt-4">
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start gap-3 text-base h-12 px-3 ${
            pathname.startsWith("/dashboard")
              ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
              : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/5"
          }`}
        >
          <Link href="/dashboard" className="flex items-center gap-3 w-full" onClick={handleNavClick}>
            <TrendingUp className="h-4 w-4" />
            Portfolio
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start gap-3 text-base h-12 px-3 ${
            pathname.startsWith("/marketplace")
              ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
              : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/5"
          }`}
        >
          <Link href="/marketplace" className="flex items-center gap-3 w-full" onClick={handleNavClick}>
            <ShoppingBag className="h-4 w-4" />
            Dapps
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start gap-3 text-base h-12 px-3 ${
            pathname.startsWith("/profile")
              ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
              : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/5"
          }`}
        >
          <Link href="/profile" className="flex items-center gap-3 w-full" onClick={handleNavClick}>
            <ShoppingBag className="h-4 w-4" />
           profile
          </Link>
        </Button>
      </nav>

      {/* Footer with app version */}
      <div className="p-4 border-t border-orange-500/10">
        <p className="text-sm text-gray-500 text-center">CRISM v1.0.0</p>
      </div>
    </>
  )
}
