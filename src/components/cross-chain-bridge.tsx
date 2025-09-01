import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRightLeft, Clock, CheckCircle, AlertCircle } from "lucide-react"

const bridgeTransactions = [
  {
    id: "0x1a2b3c...",
    from: "Bitcoin",
    to: "Citrea",
    amount: "0.5 BTC",
    amountUSD: "$13,650",
    status: "Completed",
    time: "2 hours ago",
    fee: "0.001 BTC",
    confirmations: "6/6",
  },
  {
    id: "0x4d5e6f...",
    from: "Citrea",
    to: "Ethereum",
    amount: "2,500 USDT",
    amountUSD: "$2,500",
    status: "Pending",
    time: "15 minutes ago",
    fee: "0.0005 BTC",
    confirmations: "3/6",
  },
  {
    id: "0x7g8h9i...",
    from: "Ethereum",
    to: "Citrea",
    amount: "1.2 ETH",
    amountUSD: "$2,890",
    status: "Completed",
    time: "1 day ago",
    fee: "0.0008 BTC",
    confirmations: "6/6",
  },
  {
    id: "0xjk1l2m...",
    from: "Citrea",
    to: "Bitcoin",
    amount: "0.25 BTC",
    amountUSD: "$6,825",
    status: "Failed",
    time: "3 days ago",
    fee: "0.0003 BTC",
    confirmations: "0/6",
  },
]

export function CrossChainBridge() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pending":
        return <Clock className="h-4 w-4 text-orange-500" />
      case "Failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500"
      case "Pending":
        return "bg-orange-500/10 text-orange-500"
      case "Failed":
        return "bg-red-500/10 text-red-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRightLeft className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Total Bridged</span>
          </div>
          <div className="text-2xl font-bold text-white">$25,865</div>
          <div className="text-sm text-green-500">+$6,825 this week</div>
        </Card>

        <Card className="p-4 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Completed</span>
          </div>
          <div className="text-2xl font-bold text-white">2</div>
          <div className="text-sm text-gray-400">Transactions</div>
        </Card>

        <Card className="p-4  border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Pending</span>
          </div>
          <div className="text-2xl font-bold text-white">1</div>
          <div className="text-sm text-orange-400">In progress</div>
        </Card>

        <Card className="p-4 border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-gray-400">Failed</span>
          </div>
          <div className="text-2xl font-bold text-white">1</div>
          <div className="text-sm text-red-400">Needs attention</div>
        </Card>
      </div>

      <Card className=" border-orange-500/20">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Bridge Transaction History</h3>
          <Table>
            <TableHeader>
              <TableRow className="border-orange-500/20">
                <TableHead>Transaction ID</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Confirmations</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bridgeTransactions.map((tx, index) => (
                <TableRow key={index} className="border-orange-500/10">
                  <TableCell className="font-mono text-sm">{tx.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{tx.from}</span>
                      <ArrowRightLeft className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">{tx.to}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{tx.amount}</div>
                      <div className="text-xs text-gray-400">{tx.amountUSD}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(tx.status)}
                      <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">{tx.time}</TableCell>
                  <TableCell className="text-sm">{tx.fee}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span
                        className={
                          tx.confirmations.split("/")[0] === tx.confirmations.split("/")[1]
                            ? "text-green-500"
                            : "text-orange-500"
                        }
                      >
                        {tx.confirmations}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
