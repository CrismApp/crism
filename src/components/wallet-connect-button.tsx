import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Copy, Check, LogOut } from "lucide-react";

// Ethereum window interface
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface WalletConnectProps {
  onConnect: (address: string) => void;
  walletAddress?: string;
  onDisconnect?: () => void;
}

export function WalletConnect({ onConnect, walletAddress, onDisconnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const citreaTestnetConfig = {
    chainId: '0x13fb', // 5115 in hex
    chainName: 'Citrea Testnet',
    nativeCurrency: {
      name: 'cBTC',
      symbol: 'cBTC',
      decimals: 18
    },
    rpcUrls: ['https://rpc.testnet.citrea.xyz'],
    blockExplorerUrls: ['https://explorer.testnet.citrea.xyz']
  };

  const formatAddress = (address: string): string => {
    if (!address) return 'Unknown';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    if (!walletAddress) return;
    
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const addCitreaTestnet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [citreaTestnetConfig]
      });
    } catch (addError: unknown) {
      if (typeof addError === 'object' && addError !== null && 'code' in addError && (addError as { code: number }).code === 4902) {
        throw new Error('Failed to add Citrea Testnet. Please add it manually.');
      } else {
        try {
          if (!window.ethereum) {
            throw new Error('MetaMask not found');
          }
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: citreaTestnetConfig.chainId }]
          });
        } catch {
          throw new Error('Failed to switch to Citrea Testnet');
        }
      }
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if Web3 is available
      if (typeof window === 'undefined' || typeof window.ethereum === "undefined") {
        // For demo purposes, simulate wallet connection
        await new Promise((resolve) => setTimeout(resolve, 1500));
        onConnect('0x742d35cc6634c0532925a3b8d4021d21cb5d5bf8');
        return;
      }

      // Request account access first
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      }) as string[];

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Add and switch to Citrea Testnet
      await addCitreaTestnet();

      // Verify we're on the correct network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== citreaTestnetConfig.chainId) {
        throw new Error("Please switch to Citrea Testnet manually");
      }

      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onConnect(accounts[0]);
    } catch (err: unknown) {
      console.error('Wallet connection error:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  // If wallet is connected, show the connected wallet card
  if (walletAddress) {
    return (
      <div className="space-y-2">
        <Card className="p-3 border-orange-500/20 bg-orange-500/10">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-orange-500">{formatAddress(walletAddress)}</p>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-orange-500/20 rounded transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3 text-gray-400 hover:text-orange-500" />
                  )}
                </button>
                {onDisconnect && (
                  <button
                    onClick={onDisconnect}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Disconnect wallet"
                  >
                    <LogOut className="h-3 w-3 text-gray-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
        {error && (
          <div className="text-xs text-red-400 mt-1">{error}</div>
        )}
      </div>
    );
  }

  // If wallet is not connected, show small connect button
  return (
    <div className="space-y-2">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        variant="outline"
        size="sm"
        className="w-full border-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-black bg-transparent text-xs h-8"
      >
        {isConnecting ? (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
            Connecting...
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <Wallet className="h-3 w-3" />
            Connect Wallet
          </div>
        )}
      </Button>

      {error && (
        <div className="text-xs text-red-400 mt-1">{error}</div>
      )}
    </div>
  );
}