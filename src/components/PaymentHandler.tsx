import React, { useState } from 'react';
import { CreditCard, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import Web3 from 'web3';
import { cropAdvisorABI, cropAdvisorAddress } from '../contracts/contractConfig';

interface PaymentHandlerProps {
  web3: Web3;
  account: string;
  selectedImage: File;
  onPaymentSuccess: (analysisId: string) => void;
}

export const PaymentHandler: React.FC<PaymentHandlerProps> = ({
  web3,
  account,
  selectedImage,
  onPaymentSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Function to convert file to hash (you can use different hashing methods)
  const generateImageHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
    setTransactionHash(null);

    try {
      // Validate inputs first
      if (!web3 || !account || !selectedImage) {
        throw new Error('Missing required parameters');
      }

      // Check if account is a valid Ethereum address
      if (!web3.utils.isAddress(account)) {
        throw new Error('Invalid Ethereum address');
      }

      // Generate image hash
      const imageHash = await generateImageHash(selectedImage);
      console.log('Generated image hash:', imageHash);

      const contract = new web3.eth.Contract(cropAdvisorABI, cropAdvisorAddress);

      // Get analysis price
      const analysisPrice = await contract.methods.analysisPrice().call();
      console.log('Analysis price:', analysisPrice);

      // Send transaction
      const transaction = await contract.methods.requestAnalysis(imageHash).send({
        from: account,
        value: analysisPrice.toString(),
        gas: '300000'
      });

      console.log('Transaction result:', transaction);
      setTransactionHash(transaction.transactionHash);
      
      // Get the analysis ID from the event
      const events = transaction.events;
      console.log('Transaction events:', events);
      
      const paymentEvent = events?.PaymentReceived;
      
      if (paymentEvent && paymentEvent.returnValues) {
        const analysisId = paymentEvent.returnValues.analysisId;
        console.log('Analysis ID:', analysisId);
        
        // Convert to string since Web3 events can return various types
        const analysisIdString = String(analysisId);
        onPaymentSuccess(analysisIdString);
      } else {
        // If no event found, you might need to check other events or use a different approach
        console.warn('PaymentReceived event not found in transaction events');
        // You could try to get the analysis ID from other events or call a contract method
        throw new Error('Could not retrieve analysis ID from transaction');
      }
      
    } catch (err: any) {
      console.error('Payment failed:', err);
      
      // More specific error messages
      let errorMessage = 'Payment failed. Please try again.';
      
      if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient ETH balance for transaction';
      } else if (err.message.includes('User denied')) {
        errorMessage = 'Transaction was cancelled by user';
      } else if (err.message.includes('Invalid Ethereum address')) {
        errorMessage = 'Please connect a valid Ethereum wallet';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-lg border border-white border-opacity-30 rounded-2xl p-6 shadow-xl">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Payment for AI Analysis
      </h3>
      
      <div className="space-y-4">
        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-4">
          <div className="flex justify-between items-center text-white">
            <span>AI Crop Analysis</span>
            <span className="font-bold">0.001 ETH</span>
          </div>
          <p className="text-gray-300 text-sm mt-1">
            ~$2.50 USD • Instant AI diagnosis
          </p>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {transactionHash && (
          <div className="bg-green-500 bg-opacity-20 border border-green-400 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Payment successful!</span>
            </div>
            <p className="text-xs text-green-300 mt-1 break-all">
              TX: {transactionHash}
            </p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isProcessing || !selectedImage || !account || !web3}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              Processing Payment...
            </div>
          ) : (
            'Pay & Get AI Analysis'
          )}
        </button>

        {/* Debug info (remove in production) */}
        <div className="text-xs text-gray-400">
          <p>Account: {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : 'Not connected'}</p>
          <p>Image: {selectedImage ? selectedImage.name : 'No image selected'}</p>
        </div>
      </div>
    </div>
  );
};