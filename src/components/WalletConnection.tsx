import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import detectEthereumProvider from '@metamask/detect-provider';

import Web3 from 'web3';

interface WalletConnectionProps {
  onWalletConnected: (account: string, web3: Web3) => void;
  account: string | null;
}

export const WalletConnection: React.FC<WalletConnectionProps> = ({ 
  onWalletConnected, 
  account 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const provider = await detectEthereumProvider();
      
      if (!provider) {
        throw new Error('Please install MetaMask to use this application');
      }

      const web3Instance = new Web3(provider as any);
      setWeb3(web3Instance);

      const accounts = await web3Instance.eth.requestAccounts();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask');
      }

      onWalletConnected(accounts[0], web3Instance);
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (account) {
    return (
      <div className="bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <p className="text-white font-medium">Wallet Connected</p>
            <p className="text-green-200 text-sm">{shortenAddress(account)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-2xl p-6 shadow-xl">
      <div className="text-center">
        <Wallet className="w-12 h-12 text-white mx-auto mb-4" />
        <h3 className="text-white text-lg font-semibold mb-2">Connect Your Wallet</h3>
        <p className="text-gray-200 mb-4 text-sm">
          Connect your MetaMask wallet to start getting AI-powered crop advice
        </p>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting...
            </div>
          ) : (
            'Connect MetaMask'
          )}
        </button>
      </div>
    </div>
  );
};