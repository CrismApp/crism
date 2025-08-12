import React from 'react'

// Fast loading optimization utilities
export class FastLoadingOptimizer {
  private static cache: { [key: string]: { data: unknown; timestamp: number } } = {}
  
  // Instant cache for repeated requests
  static getCached<T>(key: string, maxAge = 30000): T | null {
    const cached = this.cache[key]
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.data as T
    }
    return null
  }
  
  static setCached<T>(key: string, data: T): void {
    this.cache[key] = { data, timestamp: Date.now() }
  }
  
  // Preload common data
  static async preloadWalletData(address: string) {
    const cacheKey = `wallet_${address}`
    if (!this.getCached(cacheKey)) {
      try {
        const { CitreaAPI } = await import('./citrea-api')
        const api = new CitreaAPI()
        const data = await api.getBalance(address)
        this.setCached(cacheKey, data)
      } catch (error) {
        console.error('Preload failed:', error)
      }
    }
  }
}

// React hook for instant loading
export function useInstantData<T>(
  key: string, 
  fetcher: () => Promise<T>,
  fallback?: T
): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = React.useState<T | null>(
    FastLoadingOptimizer.getCached<T>(key) || fallback || null
  )
  const [loading, setLoading] = React.useState(!data)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    
    const loadData = async () => {
      try {
        const result = await fetcher()
        if (!cancelled) {
          setData(result)
          FastLoadingOptimizer.setCached(key, result)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Loading failed')
          setLoading(false)
        }
      }
    }

    if (!data) {
      loadData()
    }

    return () => { cancelled = true }
  }, [key, data, fetcher])

  return { data, loading, error }
}
