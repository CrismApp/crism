"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface WalletContextType {
  walletAddress: string | null;
  setWalletAddress: (address: string | null) => void;
  connectWallet: (address: string) => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Load wallet address from localStorage on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setWalletAddress(savedAddress);
    }
  }, []);

  const connectWallet = async (address: string) => {
    setWalletAddress(address);
    localStorage.setItem('walletAddress', address);
    
    // Update user's wallet address in the database
    try {
      await fetch('/api/user/update-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });
    } catch (error) {
      console.error('Failed to update wallet address:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('walletAddress');
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
