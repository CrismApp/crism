"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, Award, Coins, Trophy, LogOut, Edit, Wallet } from "lucide-react"
import { useSession, signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const user = session?.user as ExtendedUser | undefined

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

  if (!user) {
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
    <div className="min-h-screen bg-black text-white p-4">
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
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="bg-orange-500 text-white text-2xl font-bold">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2">
                <Badge className={`${getRankColor(user.rank || 'Bronze')} px-2 py-1`}>
                  <div className="flex items-center gap-1">
                    {getRankIcon(user.rank || 'Bronze')}
                    <span className="text-xs font-semibold">{user.rank || 'Bronze'}</span>
                  </div>
                </Badge>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold mb-2">{user.name || "Anonymous"}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-400 mb-4">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Coins className="h-5 w-5" />
                    <span className="text-lg font-semibold">Gold Accumulated</span>
                  </div>
                  <div className="text-3xl font-bold text-orange-400">
                    {user.goldAccumulated?.toLocaleString() || "0"}
                  </div>
                  <div className="text-sm text-gray-400">Total earned</div>
                </div>

                <div className="text-center md:text-left">
                  <div className="flex items-center gap-2 text-orange-500 mb-1">
                    <Trophy className="h-5 w-5" />
                    <span className="text-lg font-semibold">Current Rank</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-400 capitalize">
                    {user.rank || "Bronze"}
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
              <span className="text-white">{user.name || "Not set"}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Email Address</span>
              <span className="text-white">{user.email}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Account Created</span>
              <span className="text-white">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Wallet Connected</span>
              <span className="text-white">
                {user.walletAddress ? (
                  <span className="font-mono text-sm">
                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
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
              <Badge className={`${(user.rank !== 'Bronze') ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {(user.rank !== 'Bronze') ? 'Completed' : 'In Progress'}
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
              <Badge className={`${(user?.goldAccumulated || 0) > 0 ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {(user?.goldAccumulated || 0) > 0 ? 'Completed' : 'Pending'}
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
              <Badge className={`${user.walletAddress ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {user.walletAddress ? 'Completed' : 'Pending'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}