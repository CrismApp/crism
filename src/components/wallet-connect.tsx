import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, AlertCircle, TrendingUp, DollarSign, RefreshCw, Copy, ExternalLink } from "lucide-react";

// Mock data for demo
const mockPortfolioData = {
  totalBalance: 2.45,
  totalBalanceUSD: 74892,
  totalDeposits: 54892,
  accruedYield: 20892,
  dailyChange: -2.1,
  positions: 12,
  activeYields: 5,
};

const mockTransactions = [
  { id: '1', type: 'Deposit', amount: '0.5 cBTC', value: '$15,250', status: 'Confirmed', time: '2 hours ago' },
  { id: '2', type: 'Yield', amount: '0.02 cBTC', value: '$610', status: 'Confirmed', time: '1 day ago' },
  { id: '3', type: 'Swap', amount: '0.1 cBTC', value: '$3,050', status: 'Pending', time: '2 days ago' },
];

export function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

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
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [citreaTestnetConfig]
      });
    } catch (addError) {
      if (addError.code === 4902) {
        throw new Error('Failed to add Citrea Testnet. Please add it manually.');
      } else {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: citreaTestnetConfig.chainId }]
          });
        } catch (switchError) {
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
      });

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
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-gray-900/50 border-orange-500/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">Connect to Citrea Testnet</h2>
          <p className="text-gray-300 mb-8">
            Connect your wallet to Citrea Testnet to start tracking your Bitcoin L2 portfolio
          </p>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span className="text-red-400 text-sm text-left">{error}</span>
            </div>
          )}

          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
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

          <div className="mt-6 space-y-2 text-s text-gray-400">
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