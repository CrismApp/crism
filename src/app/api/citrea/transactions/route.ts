import { NextRequest, NextResponse } from 'next/server'
import { CitreaAPI } from '@/lib/citrea-api'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('address')
  const limit = parseInt(searchParams.get('limit') || '50')

  try {
    const citreaAPI = new CitreaAPI()
    const transactions = await citreaAPI.getTransactionHistory(walletAddress!, limit)
    
    return NextResponse.json({ transactions }, {
      headers: { 'Cache-Control': 'public, s-maxage=60' }
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}