"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { LandingPage } from "@/components/LandingPage"
import { WalletConnect } from "@/components/wallet-connect"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"

type AppState = "loading" | "landing" | "wallet-connect" | "dashboard"

export default function Page() {
  const router = useRouter()
  const [appState, setAppState] = useState<AppState>("loading")
  const [walletAddress, setWalletAddress] = useState<string>("")

  const handleLoadingComplete = () => {
    setAppState("landing")
  }

  const handleGetStarted = () => {
    setAppState("wallet-connect")
  }

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address)
    router.push("dashboard")
  }

  const handleDisconnect = () => {
    setWalletAddress("")
    router.push("/")
  }

  return (
    <>
      {appState === "loading" && <LoadingScreen onComplete={handleLoadingComplete} />}

      {appState === "landing" && <LandingPage onGetStarted={handleGetStarted} />}

      {appState === "wallet-connect" && <WalletConnect onConnect={handleWalletConnect} />}

      {/* Dashboard is now its own route; keep conditional for safety if user navigates back with state */}
      {appState === "dashboard" && (
        <PortfolioDashboard walletAddress={walletAddress} onDisconnect={handleDisconnect} />
      )}
    </>
  )
}
