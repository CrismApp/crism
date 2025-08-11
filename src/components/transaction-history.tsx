import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowUpRight, ArrowDownLeft, Repeat, ExternalLink, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

// Import your transaction interface
interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  valueFormatted: number
  gasPrice: string
  gasUsed?: string
  blockNumber: number
  timestamp?: number
  status?: string
  type?: 'sent' | 'received'
}

interface TransactionHistoryProps {
  walletAddress: string
  transactions: Transaction[]
  isLoading?: boolean
}

export function TransactionHistory({ walletAddress, transactions, isLoading }: TransactionHistoryProps) {
  const [processedTransactions, setProcessedTransactions] = useState<any[]>([])
  const [transactionStats, setTransactionStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    totalFees: 0,
    totalCount: 0
  })

  // Process raw transaction data into display format
  useEffect(() => {
    console.log('TransactionHistory received props:', { walletAddress, transactions, isLoading })
    console.log('Number of transactions:', transactions?.length)
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions to process')
      setProcessedTransactions([])
      setTransactionStats({
        totalSent: 0,
        totalReceived: 0,
        totalFees: 0,
        totalCount: 0
      })
      return
    }

    let totalSent = 0
    let totalReceived = 0
    let totalFees = 0

    const processed = transactions.map(tx => {
      const isSent = tx.type === 'sent' || tx.from.toLowerCase() === walletAddress.toLowerCase()
      const amount = tx.valueFormatted || 0
      const gasUsed = tx.gasUsed ? parseInt(tx.gasUsed, 16) : 0
      const gasPrice = tx.gasPrice ? parseInt(tx.gasPrice, 16) : 0
      const fee = (gasUsed * gasPrice) / 1e18

      // Update totals
      if (isSent) {
        totalSent += amount
      } else {
        totalReceived += amount
      }
      totalFees += fee

      return {
        hash: tx.hash,
        type: isSent ? 'Send' : 'Receive',
        amount: isSent ? `-${amount.toFixed(6)} BTC` : `+${amount.toFixed(6)} BTC`,
        amountUSD: isSent ? `-$${(amount * 60000).toFixed(2)}` : `+$${(amount * 60000).toFixed(2)}`, // Using approximate BTC price
        addressOrProtocol: isSent ? tx.to : tx.from,
        status: tx.status === 'success' || !tx.status ? 'Confirmed' : 'Failed',
        time: tx.timestamp ? formatTimeAgo(tx.timestamp * 1000) : 'Unknown',
        fee: `${fee.toFixed(6)} BTC`,
        block: tx.blockNumber.toString(),
        isSent
      }
    })

    setProcessedTransactions(processed)
    setTransactionStats({
      totalSent,
      totalReceived,
      totalFees,
      totalCount: transactions.length
    })
  }, [transactions, walletAddress])

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    return `${days} days ago`
  }

  const formatAddress = (address: string): string => {
    if (!address) return 'Unknown'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Send":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case "Receive":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case "Swap":
      case "Stake":
        return <Repeat className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Send":
        return "bg-red-500/10 text-red-500"
      case "Receive":
        return "bg-green-500/10 text-green-500"
      case "Swap":
      case "Stake":
        return "bg-orange-500/10 text-orange-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  const openExplorer = (hash: string) => {
    // Open Citrea testnet explorer
    window.open(`https://explorer.testnet.citrea.xyz/tx/${hash}`, '_blank')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
          <span className="text-gray-400">Loading transaction history...</span>
          <span className="text-xs text-gray-500 mt-2">Scanning blockchain for your transactions</span>
          <span className="text-xs text-orange-500 mt-1">This may take some time to complete</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Transaction Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Total Sent</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {transactionStats.totalSent.toFixed(6)} BTC
          </div>
          <div className="text-sm text-red-400">
            -${(transactionStats.totalSent * 60000).toFixed(2)}
          </div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Total Received</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {transactionStats.totalReceived.toFixed(6)} BTC
          </div>
          <div className="text-sm text-green-400">
            +${(transactionStats.totalReceived * 60000).toFixed(2)}
          </div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Total Fees</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {transactionStats.totalFees.toFixed(6)} BTC
          </div>
          <div className="text-sm text-gray-400">
            ${(transactionStats.totalFees * 60000).toFixed(2)}
          </div>
        </Card>

        <Card className="p-4 bg-gray-900/50 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Transactions</span>
          </div>
          <div className="text-2xl font-bold text-white">{transactionStats.totalCount}</div>
          <div className="text-sm text-gray-400">All time</div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="bg-gray-900/50 border-orange-500/20">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          
          {processedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">No transactions found</div>
              <div className="text-sm text-gray-500">
                Transactions will appear here once you start using your wallet on the Citrea network
              </div>
              <div className="text-sm text-orange-500 mt-4">
                Note: We're scanning the last 1000 blocks on the Citrea network
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-orange-500/20">
                    <TableHead>Hash</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedTransactions.map((tx, index) => (
                    <TableRow key={tx.hash || index} className="border-orange-500/10">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {formatAddress(tx.hash)}
                          </span>
                          <ExternalLink 
                            className="h-3 w-3 text-gray-400 cursor-pointer hover:text-orange-500 transition-colors" 
                            onClick={() => openExplorer(tx.hash)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <Badge className={getTypeColor(tx.type)}>{tx.type}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div
                            className={`font-medium ${
                              tx.isSent ? "text-red-400" : "text-green-400"
                            }`}
                          >
                            {tx.amount}
                          </div>
                          <div className="text-xs text-gray-400">{tx.amountUSD}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatAddress(tx.addressOrProtocol)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            tx.status === 'Confirmed' 
                              ? "bg-green-500/10 text-green-500"
                              : "bg-red-500/10 text-red-500"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">{tx.time}</TableCell>
                      <TableCell className="text-sm">{tx.fee}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}