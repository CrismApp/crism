"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { HamburgerMenu } from "@/components/ui/hamburger-menu"
import { Sidebar } from "@/components/sidebar"
import { Mail, Award, Coins, Trophy, LogOut, Edit, Wallet } from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { useUser } from "@/context/UserContext"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GoldCounter, GoldBadge } from "@/components/gold-display"

// Extended user type with custom fields
interface ExtendedUser {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
  // Custom CRISM fields
  rank?: string;
  goldAccumulated?: number;
  walletAddress?: string;
  totalPoints?: number;
  portfolioValue?: number;
  transactionCount?: number;
}

interface ProfilePageProps {
  onBack?: () => void
  walletAddress?: string
  onDisconnect: () => void
  onWalletConnect: (address: string) => void
  onNavigate?: () => void
}

export function ProfilePage({ onBack, walletAddress, onDisconnect, onWalletConnect, onNavigate }: ProfilePageProps) {
  const { data: session, isPending: sessionLoading } = useSession()
  const { user, isLoading: userLoading } = useUser()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Use user from context, fallback to session user for compatibility
  const displayUser = user || session?.user as ExtendedUser | undefined
  
  // Show loading state if we're still loading session or user data
  const isLoading = sessionLoading || userLoading || (!user && !session?.user)

  console.log('👤 Profile Page - Current user from context:', user)
  console.log('👤 Profile Page - Session user:', session?.user)
  console.log('👤 Profile Page - Display user:', displayUser)
  console.log('🔄 Profile Page - Loading states:', { sessionLoading, userLoading, isLoading })

  // Provide fallback user data for sidebar only when we're sure we have session but no user data
  const userWithFallback = user || (session?.user ? {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || session.user.email || 'User',
    goldAccumulated: 0,
    rank: 'Bronze'
  } : {
    id: '',
    email: '',
    name: 'Loading...',
    goldAccumulated: 0,
    rank: 'Bronze'
  })

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

  const getRankIcon = (rank: string) => {
    switch (rank?.toLowerCase()) {
      case 'bronze':
      case 'silver':
      case 'gold':
        return <Award className="h-4 w-4" />
      case 'platinum':
      case 'diamond':
        return <Trophy className="h-4 w-4" />
      default:
        return <Award className="h-4 w-4" />
    }
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-500">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="lg:grid lg:grid-cols-[280px_1fr]">
        
        <HamburgerMenu>
          <Sidebar 
            walletAddress={walletAddress} 
            user={userWithFallback}
            onDisconnect={onDisconnect}
            onShowProfile={() => {}} // Already on profile page
            onWalletConnect={onWalletConnect}
            onNavigate={onNavigate}
          />
        </HamburgerMenu>

        {/* Main Content */}
        <main className="p-4 lg:p-6 pt-20 lg:pt-6">
          <div className="max-w-2xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold">Profile</h1>
              <div className="flex items-center gap-2">
                {onBack && (
                  <Button
                    onClick={onBack}
                    variant="outline"
                    className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black"
                  >
                    Back to Dashboard
                  </Button>
                )}
                <Button
                  onClick={handleSignOut}
              disabled={isSigningOut}
              variant="outline"
              className="border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
            >
              {isSigningOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                  Signing Out...
                </div>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="p-8 border-orange-500/20 bg-black/50 backdrop-blur-xl mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-orange-500/30">
                <AvatarImage src={displayUser.image || undefined} alt={displayUser.name || "User"} />
                <AvatarFallback className="bg-orange-500 text-white text-2xl font-bold">
                  {displayUser.name?.charAt(0) || displayUser.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              {/* Rank Badge */}
              <div className="absolute -bottom-2 -right-2">
                <Badge className={`${getRankColor(displayUser.rank || 'Bronze')} px-2 py-1`}>
                  <div className="flex items-center gap-1">
                    {getRankIcon(displayUser.rank || 'Bronze')}
                    <span className="text-xs font-semibold">{displayUser.rank || 'Bronze'}</span>
                  </div>
                </Badge>
              </div>

              {/* Gold Badge */}
              <div className="absolute -top-2 -left-2">
                <GoldBadge 
                  amount={displayUser.goldAccumulated || 0}
                  className="shadow-lg"
                />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">
                {isLoading ? "Loading..." : (displayUser?.name || "Anonymous")}
              </h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                <Mail className="h-4 w-4" />
                <span>{displayUser?.email || "Loading..."}</span>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Coins className="h-5 w-5" />
                    <span className="text-lg font-semibold">Gold Accumulated</span>
                  </div>
                  <GoldCounter 
                    amount={displayUser.goldAccumulated || 0}
                    animated={true}
                    className="justify-center md:justify-start"
                  />
                  <div className="text-sm text-gray-400 mt-1">Total earned</div>
                </div>

                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Trophy className="h-5 w-5" />
                    <span className="text-lg font-semibold">Current Rank</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400 capitalize">
                    {displayUser.rank || "Bronze"}
                  </div>
                  <div className="text-sm text-gray-400">Keep earning to rank up!</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Details */}
        <Card className="p-6 border-orange-500/20 bg-black/50 backdrop-blur-xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Account Details</h3>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Full Name</span>
              <span className="text-white">{displayUser.name || "Not set"}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Email Address</span>
              <span className="text-white">{displayUser.email}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Account Created</span>
              <span className="text-white">
                {displayUser.createdAt ? new Date(displayUser.createdAt).toLocaleDateString() : "Recently"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Wallet Connected</span>
              <span className="text-white">
                {displayUser.walletAddress ? (
                  <span className="font-mono text-sm">
                    {displayUser.walletAddress.slice(0, 6)}...{displayUser.walletAddress.slice(-4)}
                  </span>
                ) : (
                  "Not connected"
                )}
              </span>
            </div>
          </div>
        </Card>

        {/* Achievement Progress */}
        <Card className="p-6 border-orange-500/20 bg-black/50 backdrop-blur-xl">
          <h3 className="text-xl font-semibold mb-4">Achievement Progress</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-semibold">Rank Up</div>
                  <div className="text-sm text-gray-400">Reach Silver rank</div>
                </div>
              </div>
              <Badge className={`${(displayUser.rank !== 'Bronze') ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {(displayUser.rank !== 'Bronze') ? 'Completed' : 'In Progress'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Coins className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-semibold">First Gold Earned</div>
                  <div className="text-sm text-gray-400">Earn your first gold coins</div>
                </div>
              </div>
              <Badge className={`${(displayUser?.goldAccumulated || 0) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {(displayUser?.goldAccumulated || 0) > 0 ? 'Completed' : 'Pending'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="font-semibold">Wallet Connected</div>
                  <div className="text-sm text-gray-400">Connect your first wallet</div>
                </div>
              </div>
              <Badge className={`${displayUser.walletAddress ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {displayUser.walletAddress ? 'Completed' : 'Pending'}
              </Badge>
            </div>
          </div>
        </Card>
          </div>
        </main>
      </div>
    </div>
  )
}