import { NextRequest, NextResponse } from 'next/server'
import { CitreaAPI } from '@/lib/citrea-api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('address')
  
  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }

  try {
    const citreaAPI = new CitreaAPI()
    const balance = await citreaAPI.getBalance(walletAddress)
    
    return NextResponse.json(balance, {
      headers: { 
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=60',
        'CDN-Cache-Control': 'public, s-maxage=15',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=15'
      }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }
}