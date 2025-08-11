"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TrendingUp, Wallet, ShoppingBag } from "lucide-react"

interface SidebarProps {
  walletAddress?: string
  onDisconnect?: () => void
  onNavigate?: () => void // Callback to close mobile menu on navigation
}

export function Sidebar({ walletAddress, onDisconnect, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleNavClick = () => {
    onNavigate?.()
  }

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b border-orange-500/20 px-6">
        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg"></div>
        <span className="font-bold text-lg">Prism</span>
      </div>

      {/* Wallet Info - Only show if wallet is connected */}
      {walletAddress && (
        <div className="p-4">
          <div className="flex items-center gap-2 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Wallet className="h-5 w-5 lg:h-4 lg:w-4 text-orange-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm lg:text-xs text-gray-400">Connected Wallet</p>
              <p className="text-base lg:text-sm font-mono text-orange-500 truncate">{formatAddress(walletAddress)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="space-y-2 px-2 flex-1 mt-4">
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start gap-2 text-base lg:text-sm h-12 lg:h-10 ${
            pathname.startsWith("/dashboard")
              ? "text-orange-500 bg-orange-500/10"
              : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/10"
          }`}
        >
          <Link href="/dashboard" className="flex items-center gap-2 w-full" onClick={handleNavClick}>
            <TrendingUp className="h-5 w-5 lg:h-4 lg:w-4" />
            Portfolio
          </Link>
        </Button>
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start gap-2 text-base lg:text-sm h-12 lg:h-10 ${
            pathname.startsWith("/marketplace")
              ? "text-orange-500 bg-orange-500/10"
              : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/10"
          }`}
        >
          <Link href="/marketplace" className="flex items-center gap-2 w-full" onClick={handleNavClick}>
            <ShoppingBag className="h-5 w-5 lg:h-4 lg:w-4" />
            Marketplace
          </Link>
        </Button>
      </nav>

      {/* Disconnect Button - Only show if wallet is connected and onDisconnect is provided */}
      {walletAddress && onDisconnect && (
        <div className="p-4">
          <Button
            onClick={onDisconnect}
            variant="outline"
            className="w-full border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent text-base lg:text-sm h-12 lg:h-10"
          >
            Disconnect
          </Button>
        </div>
      )}
    </>
  )
}
