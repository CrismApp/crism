"use client"

import { WalletProvider } from "@/context/WalletContext"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      {children}
    </WalletProvider>
  )
}
