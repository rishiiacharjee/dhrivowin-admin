import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!dismissed) {
        setShowInstall(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {showInstall && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
        >
          <div className="bg-zinc-900 border border-yellow-400/50 p-4 shadow-lg shadow-yellow-400/20">
            <button 
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold font-['Chakra_Petch'] text-sm">INSTALL APP</h3>
                <p className="text-xs text-zinc-400 mb-3">
                  Install DHRIVO WON for faster access and better experience!
                </p>
                <Button
                  onClick={handleInstall}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold text-sm py-2"
                  data-testid="install-pwa-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  INSTALL NOW
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPWA;
