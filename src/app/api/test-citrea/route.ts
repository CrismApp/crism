import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://rpc.testnet.citrea.xyz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      })
    })
    
    const data = await response.json()
    return NextResponse.json({ 
      success: true, 
      latestBlock: parseInt(data.result, 16),
      raw: data 
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}