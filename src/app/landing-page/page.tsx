"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LandingPage } from "@/components/LandingPage"
import { WalletConnect } from "@/components/wallet-connect-button"

export default function LandingPageRoute() {
  const [showWalletConnect, setShowWalletConnect] = useState(false)
  const router = useRouter()

  const handleGetStarted = () => {
    setShowWalletConnect(true)
  }

  const handleWalletConnect = (address: string) => {
    try {
      localStorage.setItem("walletAddress", address)
      // Notify other tabs/components
      window.dispatchEvent(new CustomEvent("wallet:changed", { detail: { address } }))
    } catch (e) {
      console.error("Failed to persist wallet address", e)
    }
    router.push("/dashboard")
  }

  if (showWalletConnect) {
    return <WalletConnect onConnect={handleWalletConnect} />
  }

  return <LandingPage onGetStarted={handleGetStarted} />
}
