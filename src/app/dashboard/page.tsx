
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { useWallet } from "@/context/WalletContext"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"
import { Auth } from "@/components/auth"

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const { walletAddress, connectWallet, disconnectWallet } = useWallet()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/")
    }
  }, [session, isPending, router])

  const handleWalletConnect = async (address: string) => {
    await connectWallet(address)
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return <Auth onAuthSuccess={() => router.push("/dashboard")} />
  }

  return (
    <PortfolioDashboard 
      walletAddress={walletAddress || undefined} 
      onDisconnect={handleDisconnect}
      onWalletConnect={handleWalletConnect}
    />
  )
}