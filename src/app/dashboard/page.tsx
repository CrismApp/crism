"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PortfolioDashboard } from "@/components/portfolio-dashboard"

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const load = () => {
      const address = localStorage.getItem("walletAddress")
      if (!address) {
        router.push("/landing-page")
        return
      }
      setWalletAddress(address)
    }
    load()

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "walletAddress") {
        const newVal = e.newValue || ""
        if (!newVal) {
          router.push("/landing-page")
        } else {
          setWalletAddress(newVal)
        }
      }
    }

    const handleCustom = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.address) {
        setWalletAddress(detail.address)
      }
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("wallet:changed", handleCustom)
    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("wallet:changed", handleCustom)
    }
  }, [router])

  const handleDisconnect = () => {
    localStorage.removeItem("walletAddress")
    window.dispatchEvent(new CustomEvent("wallet:changed", { detail: { address: "" } }))
    router.push("/landing-page")
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-500">Loading...</p>
        </div>
      </div>
    )
  }

  return <PortfolioDashboard walletAddress={walletAddress} onDisconnect={handleDisconnect} />
}
