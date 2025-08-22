import { BigInt, Address, log } from "@graphprotocol/graph-ts"
import { Transfer } from "../generated/WETH/ERC20"
import { Transaction, Wallet } from "../generated/schema"
import { ERC20 } from "../generated/WETH/ERC20"
import { ERC20Token } from "../generated/templates"

// Set to track discovered contracts to avoid duplicate template creation
const discoveredContracts = new Set<string>()

export function handleTransfer(event: Transfer): void {
  // Skip zero transfers
  if (event.params.value.equals(BigInt.zero())) {
    return
  }

  // Create template for this contract if not already done
  const contractAddress = event.address.toHexString()
  if (!discoveredContracts.has(contractAddress)) {
    ERC20Token.create(event.address)
    discoveredContracts.add(contractAddress)
    log.info("Created ERC20 template for: {}", [contractAddress])
  }

  // Auto-discover new tokens by examining transaction logs
  // Look for other contracts that might be tokens in this transaction
  const receipt = event.receipt
  if (receipt) {
    for (let i = 0; i < receipt.logs.length; i++) {
      const logEntry = receipt.logs[i]
      
      // Check if this log is from a different contract
      if (!logEntry.address.equals(event.address)) {
        const otherContractAddress = logEntry.address.toHexString()
        
        // Try to create template for potential ERC20 contracts
        if (!discoveredContracts.has(otherContractAddress)) {
          const contract = ERC20.bind(logEntry.address)
          const symbolResult = contract.try_symbol()
          
          if (!symbolResult.reverted) {
            ERC20Token.create(logEntry.address)
            discoveredContracts.add(otherContractAddress)
            log.info("Auto-discovered ERC20 contract: {}", [otherContractAddress])
          }
        }
      }
    }
  }

  // Create or load wallets
  const fromWallet = loadOrCreateWallet(event.params.from)
  const toWallet = loadOrCreateWallet(event.params.to)

  // Get token info
  const contract = ERC20.bind(event.address)
  const symbol = contract.try_symbol()
  const name = contract.try_name()
  const decimals = contract.try_decimals()

  // Create transaction record
  const transactionId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  const transaction = new Transaction(transactionId)
  
  transaction.hash = event.transaction.hash
  transaction.from = fromWallet.id
  transaction.to = toWallet.id
  transaction.value = event.params.value
  transaction.tokenAddress = event.address
  transaction.tokenSymbol = symbol.reverted ? "UNKNOWN" : symbol.value
  transaction.tokenName = name.reverted ? "Unknown Token" : name.value
  transaction.tokenDecimals = decimals.reverted ? 18 : decimals.value
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp

  // Update wallet counters
  fromWallet.totalTransactions = fromWallet.totalTransactions.plus(BigInt.fromI32(1))
  fromWallet.lastUpdated = event.block.timestamp

  toWallet.lastUpdated = event.block.timestamp

  // Save everything
  fromWallet.save()
  toWallet.save()
  transaction.save()

  log.info("Processed transfer: {} {} from {} to {}", [
    event.params.value.toString(),
    transaction.tokenSymbol,
    event.params.from.toHexString(),
    event.params.to.toHexString()
  ])
}

function loadOrCreateWallet(address: Address): Wallet {
  let wallet = Wallet.load(address.toHexString())
  
  if (!wallet) {
    wallet = new Wallet(address.toHexString())
    wallet.address = address
    wallet.totalTransactions = BigInt.zero()
    wallet.lastUpdated = BigInt.zero()
    wallet.save()
  }
  
  return wallet
}