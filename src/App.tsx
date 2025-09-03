import React, { useState } from 'react';
import { Sprout, Shield, Sparkles } from 'lucide-react';
import { WalletConnection } from './components/WalletConnection';
import { ImageUpload } from './components/ImageUpload';
import { PaymentHandler } from './components/PaymentHandler';
import { AIAnalysis } from './components/AIAnalysis';
import { useNitrolite } from './hooks/useNitrolite';
import Web3 from 'web3';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  const nitrolite = useNitrolite();

  const handleWalletConnected = (connectedAccount: string, web3Instance: Web3) => {
    setAccount(connectedAccount);
    setWeb3(web3Instance);
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setAnalysisId(null); // Reset analysis when new image is selected
  };

  const handlePaymentSuccess = (id: string) => {
    setAnalysisId(id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-700 to-teal-600">
      {/* Header */}
      <div className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-2xl">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CropAdvisor AI</h1>
                <p className="text-green-200">Web3-Powered Crop Disease Detection</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {nitrolite.isConnected && (
                <div className="flex items-center gap-2 text-green-200">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Gasless Ready</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-yellow-200">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm">AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <WalletConnection 
              onWalletConnected={handleWalletConnected}
              account={account}
            />
            
            {account && (
              <ImageUpload
                onImageSelect={handleImageSelect}
                selectedImage={selectedImage}
                isProcessing={!!analysisId}
              />
            )}
            
            {account && selectedImage && web3 && !analysisId && (
              <PaymentHandler
                web3={web3}
                account={account}
                selectedImage={selectedImage}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}
          </div>

          {/* Right Column */}
          <div>
            {analysisId && (
              <AIAnalysis
                analysisId={analysisId}
                selectedImage={selectedImage}
              />
            )}
          </div>
        </div>

        {/* Instructions */}
        {!account && (
          <div className="mt-12 text-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-3xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                How It Works
              </h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="bg-blue-500 bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <p className="text-white font-medium">Connect Wallet</p>
                  <p className="text-gray-300 text-sm">Securely connect your MetaMask wallet</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-green-500 bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <p className="text-white font-medium">Upload & Pay</p>
                  <p className="text-gray-300 text-sm">Upload crop image and pay for analysis</p>
                </div>
                <div className="space-y-2">
                  <div className="bg-purple-500 bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <p className="text-white font-medium">Get AI Advice</p>
                  <p className="text-gray-300 text-sm">Receive instant diagnosis and treatment</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;