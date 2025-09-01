import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownLeft, Repeat, ExternalLink, Loader2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { useState, useEffect, useMemo } from "react"


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


interface ProcessedTransaction {
  hash: string
  type: string
  amount: string
  amountUSD: string
  addressOrProtocol: string
  status: string
  time: string
  fee: string
  block: string
  isSent: boolean
}

interface TransactionHistoryProps {
  walletAddress: string
  transactions: Transaction[]
  isLoading?: boolean
}

const TRANSACTIONS_PER_PAGE = 5

export function TransactionHistory({ walletAddress, transactions, isLoading }: TransactionHistoryProps) {
  const [processedTransactions, setProcessedTransactions] = useState<ProcessedTransaction[]>([])
  const [transactionStats, setTransactionStats] = useState({
    totalSent: 0,
    totalReceived: 0,
    totalFees: 0,
    totalCount: 0
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Utility functions defined before useMemo
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
    
    window.open(`https://explorer.testnet.citrea.xyz/tx/${hash}`, '_blank')
  }

  // Memoize processed transactions to prevent unnecessary recalculations
  const memoizedProcessedData = useMemo(() => {
    console.log('TransactionHistory processing transactions:', { walletAddress, transactionsCount: transactions?.length, isLoading })
    
    if (!transactions || transactions.length === 0) {
      console.log('No transactions to process')
      return {
        processed: [],
        stats: {
          totalSent: 0,
          totalReceived: 0,
          totalFees: 0,
          totalCount: 0
        }
      }
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

      // Debug: Log the actual status value
      console.log('Transaction status debug:', { hash: tx.hash, status: tx.status, type: typeof tx.status })

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
        status: (
          tx.status === 'success' || 
          tx.status === 'completed' || 
          tx.status === 'confirmed' || 
          !tx.status ||
          (tx.hash && tx.blockNumber) // If transaction has hash and block number, it's confirmed
        ) ? 'Confirmed' : 'Failed',
        time: tx.timestamp ? formatTimeAgo(tx.timestamp * 1000) : 'Unknown',
        fee: `${fee.toFixed(6)} BTC`,
        block: tx.blockNumber.toString(),
        isSent
      }
    })

    return {
      processed,
      stats: {
        totalSent,
        totalReceived,
        totalFees,
        totalCount: transactions.length
      }
    }
  }, [transactions, walletAddress, isLoading])

  // Update state when memoized data changes
  useEffect(() => {
    setProcessedTransactions(memoizedProcessedData.processed)
    setTransactionStats(memoizedProcessedData.stats)
    setCurrentPage(1) // Reset to first page when data changes
  }, [memoizedProcessedData])

  // Calculate pagination
  const totalPages = Math.ceil(processedTransactions.length / TRANSACTIONS_PER_PAGE)
  const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE
  const endIndex = startIndex + TRANSACTIONS_PER_PAGE
  const currentTransactions = processedTransactions.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  const toggleExpandedRow = (hash: string, index: number) => {
    const uniqueKey = `${hash || 'unknown'}-${index}`
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(uniqueKey)) {
      newExpanded.delete(uniqueKey)
    } else {
      newExpanded.add(uniqueKey)
    }
    setExpandedRows(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
          <span className="text-gray-400">Loading transaction history....</span>
          <span className="text-sm text-gray-500 mt-2">Scanning blockchain for your transactions</span>
          <span className="text-sm text-orange-500 mt-1">This may take some time to complete</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Transaction Statistics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="p-3 sm:p-4 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
            <span className="text-sm sm:text-base text-gray-400">Total Sent</span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {transactionStats.totalSent.toFixed(4)} BTC
          </div>
          <div className="text-sm sm:text-base text-red-400">
            -${(transactionStats.totalSent * 60000).toFixed(0)}
          </div>
        </Card>

        <Card className="p-3 sm:p-4  border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="h-4 w-4 text-orange-500" />
            <span className="text-sm sm:text-base text-gray-400">Total Received</span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {transactionStats.totalReceived.toFixed(4)} BTC
          </div>
          <div className="text-sm sm:text-base text-green-400">
            +${(transactionStats.totalReceived * 60000).toFixed(0)}
          </div>
        </Card>

        <Card className="p-3 sm:p-4 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Repeat className="h-4 w-4 text-orange-500" />
            <span className="text-sm sm:text-base text-gray-400">Total Fees</span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            {transactionStats.totalFees.toFixed(6)} BTC
          </div>
          <div className="text-sm sm:text-base text-gray-400">
            ${(transactionStats.totalFees * 60000).toFixed(2)}
          </div>
        </Card>

        <Card className="p-3 sm:p-4  border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="h-4 w-4 text-orange-500" />
            <span className="text-sm sm:text-base text-gray-400">Transactions</span>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{transactionStats.totalCount}</div>
          <div className="text-xs sm:text-sm text-gray-400">All time</div>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className=" border-orange-500/20">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <h3 className="text-lg font-semibold mb-2 sm:mb-0">Recent Transactions</h3>
            {processedTransactions.length > 0 && (
              <div className="text-sm text-gray-400">
                Showing {Math.min(startIndex + 1, processedTransactions.length)} - {Math.min(endIndex, processedTransactions.length)} of {processedTransactions.length}
              </div>
            )}
          </div>
          
          {processedTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2 text-base">No transactions found</div>
              <div className="text-sm text-gray-500">
                Transactions will appear here once you start using your wallet on the Citrea network
              </div>
              <div className="text-sm text-orange-500 mt-4">
                Note: We&apos;re scanning the last 1000 blocks on the Citrea network
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-orange-500/20">
                      <TableHead className="text-sm">Hash</TableHead>
                      <TableHead className="text-sm">Type</TableHead>
                      <TableHead className="text-sm">Amount</TableHead>
                      <TableHead className="text-sm">Address</TableHead>
                      <TableHead className="text-sm">Status</TableHead>
                      <TableHead className="text-sm">Time</TableHead>
                      <TableHead className="text-sm">Fee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTransactions.map((tx, index) => (
                      <TableRow key={`table-${tx.hash || 'unknown'}-${index}`} className="border-orange-500/10">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-orange-500">
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
                            {getTypeIcon(tx.type || 'Unknown')}
                            <Badge className={getTypeColor(tx.type || 'Unknown')}>{tx.type || 'Unknown'}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className={`font-medium text-sm ${tx.isSent ? "text-red-400" : "text-green-400"}`}>
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

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {currentTransactions.map((tx, index) => (
                  <div key={`mobile-${tx.hash || 'unknown'}-${index}`} className="p-4  rounded-lg border border-orange-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type || 'Unknown')}
                        <Badge className={getTypeColor(tx.type || 'Unknown')}>{tx.type || 'Unknown'}</Badge>
                      </div>
                      <Badge 
                        className={
                          tx.status === 'Confirmed' 
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Amount</span>
                        <div className="text-right">
                          <div className={`font-medium text-sm ${tx.isSent ? "text-red-400" : "text-green-400"}`}>
                            {tx.amount}
                          </div>
                          <div className="text-xs text-gray-400">{tx.amountUSD}</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Hash</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-orange-500">
                            {formatAddress(tx.hash)}
                          </span>
                          <ExternalLink 
                            className="h-3 w-3 text-gray-400 cursor-pointer hover:text-orange-500 transition-colors" 
                            onClick={() => openExplorer(tx.hash)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Address</span>
                        <span className="font-mono text-sm">{formatAddress(tx.addressOrProtocol)}</span>
                      </div>
                      
                      <button
                        onClick={() => toggleExpandedRow(tx.hash, index)}
                        className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 transition-colors"
                      >
                        {expandedRows.has(`${tx.hash || 'unknown'}-${index}`) ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            Hide details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            Show details
                          </>
                        )}
                      </button>
                      
                      {expandedRows.has(`${tx.hash || 'unknown'}-${index}`) && (
                        <div className="pt-2 border-t border-orange-500/10 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Time</span>
                            <span className="text-sm">{tx.time}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Fee</span>
                            <span className="text-sm">{tx.fee}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-400">Block</span>
                            <span className="text-sm">{tx.block}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-orange-500/10">
                  <div className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  )
}