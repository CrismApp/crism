import { BigInt, Address, log, ethereum } from "@graphprotocol/graph-ts"
import { Wallet } from "../generated/schema"
import { ERC20Token } from "../generated/templates"
import { ERC20 } from "../generated/templates/ERC20Token/ERC20"

// Handle entire blocks to capture all transactions
export function handleBlock(block: ethereum.Block): void {
  log.info("Processing block: {}", [block.number.toString()])
  
}

// Helper function to create wallets
export function loadOrCreateWallet(address: Address): Wallet {
  let wallet = Wallet.load(address.toHexString())
  
  if (!wallet) {
    wallet = new Wallet(address.toHexString())
    wallet.address = address
    wallet.totalTransactions = BigInt.zero()
    wallet.lastUpdated = BigInt.zero()
    wallet.save()
    
    log.info("Created new wallet: {}", [address.toHexString()])
  }
  
  return wallet
}

// This function can be called to create ERC20 templates for discovered contracts
export function createERC20Template(contractAddress: Address): void {
  // Check if it's an ERC20 contract by trying to call token methods
  const contract = ERC20.bind(contractAddress)
  const symbolResult = contract.try_symbol()
  
  if (!symbolResult.reverted) {
    // This is likely an ERC20 contract, create template for it
    log.info("Creating ERC20 template for address: {}", [contractAddress.toHexString()])
    ERC20Token.create(contractAddress)
  }
}