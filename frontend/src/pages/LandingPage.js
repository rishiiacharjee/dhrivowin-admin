import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, CheckCircle, Chrome, Share, PlusSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const LandingPage = () => {
  const [stats, setStats] = useState({ total_players: 0, total_tournaments: 0 });
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    fetchStats();
    
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      window.location.href = '/login';
    }

    // Listen for install prompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/public/stats');
      setStats(response.data);
    } catch (error) {}
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Chrome install prompt available
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Show manual instructions
      setShowInstructions(true);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm w-full"
        >
          {/* Logo */}
          <motion.img 
            src="/logo.png" 
            alt="DHRIVO WON" 
            className="w-28 h-28 mx-auto mb-4 object-contain"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          />

          <h1 className="text-3xl font-bold font-['Chakra_Petch'] mb-1">
            DHRIVO <span className="text-yellow-400">WON</span>
            <span className="text-yellow-400 text-sm">©</span>
          </h1>
          
          <p className="text-zinc-400 text-sm mb-6">
            India's #1 Gaming Tournament Platform
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-400">{stats.total_players || 0}+</p>
              <p className="text-xs text-zinc-500">Players</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">{stats.total_tournaments || 0}+</p>
              <p className="text-xs text-zinc-500">Tournaments</p>
            </div>
          </div>

          {/* Install Card */}
          <div className="bg-gradient-to-b from-zinc-800/50 to-zinc-900/50 border border-yellow-500/20 rounded-2xl p-5 mb-4">
            <div className="w-14 h-14 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-7 h-7 text-yellow-400" />
            </div>
            
            <h2 className="font-bold text-lg mb-2">Install App to Play</h2>
            <p className="text-xs text-zinc-400 mb-4">
              Download our app for the best gaming experience
            </p>

            {deferredPrompt ? (
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5 rounded-xl text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                INSTALL NOW
              </Button>
            ) : (
              <Button 
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5 rounded-xl text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                DOWNLOAD APP
              </Button>
            )}
          </div>

          {/* Instructions Panel */}
          {showInstructions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-4 text-left"
            >
              <h3 className="font-bold text-sm mb-3 text-yellow-400">How to Install:</h3>
              
              {isIOS ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                    <p className="text-sm text-zinc-300">Tap the <Share className="w-4 h-4 inline text-blue-400" /> Share button</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                    <p className="text-sm text-zinc-300">Scroll and tap <span className="text-yellow-400">"Add to Home Screen"</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                    <p className="text-sm text-zinc-300">Tap <span className="text-yellow-400">"Add"</span> to install</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                    <p className="text-sm text-zinc-300">Tap <span className="bg-zinc-700 px-1.5 py-0.5 rounded text-white">⋮</span> menu (top right)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                    <p className="text-sm text-zinc-300">Tap <span className="text-yellow-400">"Install app"</span> or <span className="text-yellow-400">"Add to Home screen"</span></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                    <p className="text-sm text-zinc-300">Tap <span className="text-yellow-400">"Install"</span> to confirm</p>
                  </div>
                </div>
              )}
              
              <button 
                onClick={() => setShowInstructions(false)}
                className="w-full mt-4 text-sm text-zinc-500 hover:text-white"
              >
                Close
              </button>
            </motion.div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-800/30 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-zinc-400">Real Money</p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-zinc-400">Instant Payout</p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-zinc-400">Free Fire & BGMI</p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <p className="text-zinc-400">24/7 Support</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-3 text-center text-xs text-zinc-600">
        <p>© 2024 DHRIVO WON. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
