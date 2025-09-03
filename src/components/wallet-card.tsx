"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GoldDisplay, GoldBadge } from "@/components/gold-display"
import { User } from "@/context/UserContext"
import { Wallet, Award } from "lucide-react"

interface WalletCardProps {
  user: User
  walletAddress?: string
  className?: string
}

export function WalletCard({ user, walletAddress, className }: WalletCardProps) {
  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'bronze':
        return 'bg-amber-600 text-amber-100'
      case 'silver':
        return 'bg-gray-400 text-gray-900'
      case 'gold':
        return 'bg-yellow-500 text-yellow-900'
      case 'platinum':
        return 'bg-purple-500 text-purple-100'
      case 'diamond':
        return 'bg-blue-500 text-blue-100'
      default:
        return 'bg-orange-500 text-white'
    }
  }

  const formatAddress = (address: string): string => {
    if (!address) return 'Not Connected'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className={`p-4 border-orange-500/20 bg-black/50 backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-3">
        {/* Avatar with Gold Badge */}
        <div className="relative">
          <Avatar className="w-12 h-12 border-2 border-orange-500/30">
            <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
            <AvatarFallback className="bg-orange-500 text-white font-bold">
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          {/* Gold Badge on Avatar */}
          <div className="absolute -top-1 -right-1">
            <GoldBadge 
              amount={user.goldAccumulated || 0}
              className="shadow-lg text-xs"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white truncate">
              {user.name || "Anonymous"}
            </span>
            <Badge className={`${getRankColor(user.rank || 'Bronze')} text-xs px-1 py-0`}>
              <Award className="h-3 w-3 mr-1" />
              {user.rank || 'Bronze'}
            </Badge>
          </div>
          
          {/* Wallet Address */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Wallet className="h-3 w-3" />
            <span className="font-mono">
              {formatAddress(walletAddress || "")}
            </span>
          </div>
        </div>

        {/* Gold Display */}
        <div className="text-right">
          <GoldDisplay 
            amount={user.goldAccumulated || 0}
            variant="default"
            showLabel={true}
            className="justify-end"
          />
        </div>
      </div>
    </Card>
  )
}
