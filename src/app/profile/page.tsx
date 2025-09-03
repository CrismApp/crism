"use client"

import { ProfilePage } from "@/components/profile-page"
import { useWallet } from "@/context/WalletContext"
import { useRouter } from "next/navigation"

export default function Page() {
  const { walletAddress, connectWallet, disconnectWallet } = useWallet()
  const router = useRouter()

  const handleWalletConnect = async (address: string) => {
    await connectWallet(address)
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  const handleNavigate = () => {
    // This can be used for mobile menu navigation if needed
  }

  return (
    <ProfilePage 
      walletAddress={walletAddress || undefined}
      onDisconnect={handleDisconnect}
      onWalletConnect={handleWalletConnect}
      onNavigate={handleNavigate}
      onBack={() => router.push('/dashboard')}
    />
  )
}
