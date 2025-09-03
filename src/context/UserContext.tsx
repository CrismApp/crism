"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from '@/lib/auth-client'

interface User {
  id: string
  email: string
  name: string
  image?: string | null
  rank?: string
  goldAccumulated?: number
  totalPoints?: number
  walletAddress?: string
  portfolioValue?: number
  transactionCount?: number
  completedQuizzes?: string[]
  createdAt?: Date
  updatedAt?: Date
}

export type { User }

interface UserContextType {
  user: User | null
  refreshUser: () => Promise<void>
  isLoading: boolean
  error: string | null
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    if (!session?.user) return

    console.log('🔄 Refreshing user data...')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/me')
      if (response.ok) {
        const userData = await response.json()
        console.log('✅ User data updated:', userData)
        setUser(userData)
      } else if (response.status === 404) {
       
        console.log('🔄 User not found, attempting to sync...')
        const syncResponse = await fetch('/api/user/sync', { method: 'POST' })
        if (syncResponse.ok) {
          const syncData = await syncResponse.json()
          console.log('✅ User synced successfully:', syncData.user)
          setUser(syncData.user)
        } else {
          const errorData = await syncResponse.json()
          console.error('❌ Failed to sync user:', errorData)
          setError(errorData.error || 'Failed to sync user data')
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Failed to fetch user data:', errorData)
        setError(errorData.error || 'Failed to fetch user data')
      }
    } catch (err) {
      console.error('❌ Error fetching user data:', err)
      setError('Failed to fetch user data')
    } finally {
      setIsLoading(false)
    }
  }, [session?.user])

  // Initial load when session changes
  useEffect(() => {
    if (session?.user) {
      refreshUser()
    } else {
      setUser(null)
    }
  }, [session?.user, refreshUser])

  return (
    <UserContext.Provider value={{ user, refreshUser, isLoading, error }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
