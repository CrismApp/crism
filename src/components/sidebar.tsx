"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { WalletConnect} from "@/components/wallet-connect-button"
import { User } from "@/context/UserContext"
import { 
  TrendingUp, 
  User as UserIcon,
  LogOut,
  Award,
  ShoppingBag,
  Book,
  Settings
} from "lucide-react"
import { GoldDisplay } from "@/components/gold-display"
import { WalletCard } from "@/components/wallet-card"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  walletAddress?: string;
  user: User;
  onDisconnect: () => void;
  onShowProfile: () => void;
  onWalletConnect: (address: string) => void;
  onNavigate?: () => void; // For mobile menu close
}

export function Sidebar({ walletAddress, user, onDisconnect, onShowProfile, onWalletConnect, onNavigate }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleWalletDisconnect = () => {
    onDisconnect()
  }

  const handleNavClick = () => {
    onNavigate?.() // Close mobile menu
  }

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

  return (
    <div className="flex flex-col h-full bg-black border-r border-orange-500/20 lg:border-r-0">
      {/* Logo */}
      <div className="p-6 border-b border-orange-500/20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-xl font-bold text-orange-500">Crism</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-orange-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12 border-2 border-orange-500/30">
            <AvatarImage src={user?.image || undefined} alt={user?.name || "User"} />
            <AvatarFallback className="bg-orange-500 text-white font-bold">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.name || "Anonymous"}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {user?.email}
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Gold</span>
            <GoldDisplay 
              amount={user?.goldAccumulated || 0}
              variant="compact"
              showLabel={false}
              className="text-orange-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Rank</span>
            <Badge className={`${getRankColor(user?.rank || 'Bronze')} text-xs px-2 py-1`}>
              <Award className="h-3 w-3 mr-1" />
              {user?.rank || 'Bronze'}
            </Badge>
          </div>
        </div>

        {/* Wallet Connection */}
        <div className="space-y-2">
          <div className="text-xs text-gray-400 mb-2">Wallet Connection</div>
          <WalletConnect
            onConnect={onWalletConnect}
            walletAddress={walletAddress}
            onDisconnect={handleWalletDisconnect}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start text-left ${
            pathname.startsWith("/dashboard")
              ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
              : "text-gray-400 hover:bg-orange-500/20 hover:text-orange-500"
          }`}
        >
          <Link href="/dashboard" onClick={handleNavClick}>
            <TrendingUp className="mr-3 h-4 w-4" />
            Portfolio
          </Link>
        </Button>
        
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start text-left ${
            pathname.startsWith("/marketplace")
              ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
              : "text-gray-400 hover:bg-orange-500/20 hover:text-orange-500"
          }`}
        >
          <Link href="/marketplace" onClick={handleNavClick}>
            <ShoppingBag className="mr-3 h-4 w-4" />
            Dapps
          </Link>
        </Button>
        
        <Button
          asChild
          variant="ghost"
          className={`w-full justify-start text-left ${
            pathname.startsWith("/learn")
              ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
              : "text-gray-400 hover:bg-orange-500/20 hover:text-orange-500"
          }`}
        >
          <Link href="/learn" onClick={handleNavClick}>
            <Book className="mr-3 h-4 w-4" />
            Learn
          </Link>
        </Button>

      
      
        
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-orange-500/20 space-y-2">
        <Button
          onClick={() => {
            onShowProfile();
            handleNavClick();
          }}
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:bg-orange-500/20 hover:text-orange-500"
        >
          <UserIcon className="mr-3 h-4 w-4" />
          View Profile
        </Button>
        <Button
          onClick={handleSignOut}
          disabled={isSigningOut}
          variant="ghost"
          className="w-full justify-start text-red-400 hover:bg-red-500/20 hover:text-red-500"
        >
          {isSigningOut ? (
            <>
              <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin mr-3"></div>
              Signing Out...
            </>
          ) : (
            <>
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </>
          )}
        </Button>
      </div>
    </div>
  )
}