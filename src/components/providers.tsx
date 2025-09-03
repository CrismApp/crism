"use client"

import { WalletProvider } from "@/context/WalletContext"
import { UserProvider } from "@/context/UserContext"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      <UserProvider>
        {children}
      </UserProvider>
    </WalletProvider>
  )
}
