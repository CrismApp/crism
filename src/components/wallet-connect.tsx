import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, AlertCircle } from "lucide-react";

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

export function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-orange-500/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2">Connect to Citrea Testnet</h2>
          <p className="text-lg text-gray-300 mb-8">
            Connect your wallet to Citrea Testnet to start tracking your Bitcoin L2 portfolio
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-400 text-base text-left">{error}</span>
            </div>
          )}

          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Connecting to Citrea...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Connect to Citrea Testnet
              </div>
            )}
          </Button>

          <div className="mt-6 space-y-2 text-base text-gray-400">
            <p>Network: Citrea Testnet (Chain ID: 5115)</p>
            <p>Currency: cBTC</p>
            <p>Supported wallets: MetaMask, WalletConnect, Coinbase Wallet</p>
          </div>

          {/* <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-orange-400 text-xs">
              This will automatically add Citrea Testnet to your wallet and switch to it
            </p>
          </div> */}
        </div>
      </Card>
    </div>
  );
}