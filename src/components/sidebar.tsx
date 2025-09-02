// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { TrendingUp, Wallet, ShoppingBag, LogOut, Copy, Check, Book, PersonStanding } from "lucide-react"
// import { useState } from "react"
// import { Avatar } from "@radix-ui/react-avatar"

// interface SidebarProps {
//   walletAddress?: string
//   onDisconnect?: () => void
//   onNavigate?: () => void // Callback to close mobile menu on navigation
// }

// export function Sidebar({ walletAddress, onDisconnect, onNavigate }: SidebarProps) {
//   const pathname = usePathname()
//   const [copied, setCopied] = useState(false)

  
//  const formatAddress = (address: string): string => {
//   if (!address) return 'Unknown'
//   return `${address.slice(0, 6)}...${address.slice(-4)}`
// }


//   const handleNavClick = () => {
//     onNavigate?.()
//   }

//   const handleCopyAddress = async () => {
//     if (!walletAddress) return
    
//     try {
//       await navigator.clipboard.writeText(walletAddress)
//       setCopied(true)
//       setTimeout(() => setCopied(false), 2000)
//     } catch (err) {
//       console.error('Failed to copy address:', err)
//     }
//   }

//   return (
//     <>
//       {/* Header */}
//       <div className="flex h-16 items-center gap-2 border-b border-orange-500/20 px-6">
//         <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
//           <span className="text-white font-bold text-sm">C</span>
//         </div>
//         <span className="text-xl font-bold text-orange-500">Crism</span>
//       </div>

//       {/* Wallet Info - Enhanced with copy and disconnect icons */}
//       {walletAddress && (
//         <div className="p-4">
//           <div className="flex items-center gap-2 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
//             <Wallet className="h-5 w-5 text-orange-500 flex-shrink-0" />
//             <div className="flex-1 min-w-0">
//               <p className="text-sm text-gray-400 mb-1">Connected Wallet</p>
//               <div className="flex items-center gap-3">
//                 <p className="text-base font-mono text-orange-500">{formatAddress(walletAddress)}</p>
//                 <button
//                   onClick={handleCopyAddress}
//                   className="p-1 hover:bg-orange-500/20 rounded transition-colors -ml-2"
//                   title="Copy address"
//                 >
//                   {copied ? (
//                     <Check className="h-4 w-4 text-green-500" />
//                   ) : (
//                     <Copy className="h-4 w-4 text-gray-400 hover:text-orange-500" />
//                   )}
//                 </button>
//                 {onDisconnect && (
//                     <button
//                     onClick={onDisconnect}
//                     className="p-1 hover:bg-red-500/20 rounded transition-colors -ml-2 flex-shrink-0"
//                     title="Disconnect wallet"
//                     >
//                     <LogOut className="h-4 w-4 text-gray-400 hover:text-red-500" />
//                     </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="space-y-1 px-3 flex-1 mt-4">
//         <Button
//           asChild
//           variant="ghost"
//           className={`w-full justify-start gap-3 text-base h-12 px-3 ${
//         pathname.startsWith("/dashboard")
//           ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
//           : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/5"
//           }`}
//         >
//           <Link href="/dashboard" className="flex items-center gap-3 w-full" onClick={handleNavClick}>
//         <TrendingUp className="h-4 w-4" />
//         Portfolio
//           </Link>
//         </Button>
//         <Button
//           asChild
//           variant="ghost"
//           className={`w-full justify-start gap-3 text-base h-12 px-3 ${
//         pathname.startsWith("/marketplace")
//           ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
//           : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/5"
//           }`}
//         >
//           <Link href="/marketplace" className="flex items-center gap-3 w-full" onClick={handleNavClick}>
//         <ShoppingBag className="h-4 w-4" />
//         Dapps
//           </Link>
//         </Button>

//         <Button
//           asChild
//           variant="ghost"
//           className={`w-full justify-start gap-3 text-base h-12 px-3 ${
//         pathname.startsWith("/profile")
//           ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
//           : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/5"
//           }`}
//         >
//           <Link href="/learn" className="flex items-center gap-3 w-full" onClick={handleNavClick}>
//         <Book className="h-4 w-4" />
//            learn
//           </Link>
//         </Button>

//           <Button
//           asChild
//           variant="ghost"
//           className={`w-full justify-start gap-3 text-base h-12 px-3 ${
//         pathname.startsWith("/profile")
//           ? "text-orange-500 bg-orange-500/10 border-l-2 border-orange-500"
//           : "text-gray-300 hover:text-orange-500 hover:bg-orange-500/5"
//           }`}
//         >
//           <Link href="/profile" className="flex items-center gap-3 w-full" onClick={handleNavClick}>
//         <PersonStanding className="h-4 w-4" />
//            profile
//           </Link>
//         </Button>
//       </nav>

//       {/* Footer with app version */}
//       <div className="p-4 border-t border-orange-500/10">
//         <p className="text-sm text-gray-500 text-center">CRISM v1.0.0</p>
//       </div>
//     </>
//   )
// }

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { WalletConnect} from "@/components/wallet-connect-button"
import { 
  TrendingUp, 
  User,
  LogOut,
  Award,
  ShoppingBag,
  Book
} from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface User {
  id: string
  email: string
  name: string
  image?: string | null
  rank?: string
  goldAccumulated?: number
  [key: string]: unknown
}

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
            <span className="text-xs text-gray-400">Gold Accumulated</span>
            <span className="text-sm font-semibold text-orange-500">
              {user?.goldAccumulated?.toLocaleString() || "0"}
            </span>
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
          <User className="mr-3 h-4 w-4" />
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