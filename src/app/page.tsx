"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoadingScreen } from "@/components/loading-screen"
import { LandingPage } from "@/components/LandingPage"
import { Auth } from "@/components/auth"
import { useSession } from "@/lib/auth-client"

type AppState = "loading" | "landing" | "auth" | "dashboard"

export default function Page() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [appState, setAppState] = useState<AppState>("loading")

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        router.push("/dashboard")
      } else {
        setAppState("landing")
      }
    }
  }, [session, isPending, router])

  const handleLoadingComplete = () => {
    if (!isPending) {
      if (session?.user) {
        setAppState("dashboard")
      } else {
        setAppState("landing")
      }
    }
  }

  const handleGetStarted = () => {
    setAppState("auth")
  }

  const handleAuthSuccess = async () => {
    router.push("/dashboard")
  }

  // Show loading screen during initial auth check
  if (isPending || appState === "loading") {
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <>
      {appState === "landing" && <LandingPage onGetStarted={handleGetStarted} />}

      {appState === "auth" && <Auth onAuthSuccess={handleAuthSuccess} />}
    </>
  )
}