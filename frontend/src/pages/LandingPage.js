import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const LandingPage = () => {
  const [stats, setStats] = useState({ total_players: 0, total_tournaments: 0 });
  const [canInstall, setCanInstall] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    fetchStats();
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    // Listen for install prompt
    const handler = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setCanInstall(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/public/stats');
      setStats(response.data);
    } catch (error) {}
  };

  const handleInstall = async () => {
    const prompt = window.deferredPrompt;
    if (prompt) {
      prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === 'accepted') {
        setInstalled(true);
      }
      window.deferredPrompt = null;
      setCanInstall(false);
    }
  };

  // If installed, redirect to dashboard
  if (installed) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col">
      {/* Splash Header */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          {/* Logo */}
          <motion.img 
            src="/logo.png" 
            alt="DHRIVO WON" 
            className="w-36 h-36 mx-auto mb-6 object-contain"
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          />

          <h1 className="text-4xl font-bold font-['Chakra_Petch'] mb-2">
            DHRIVO <span className="text-yellow-400">WON</span>
            <span className="text-yellow-400 text-lg">©</span>
          </h1>
          
          <p className="text-zinc-400 mb-8">
            India's #1 Gaming Tournament Platform
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.total_players || 0}+</p>
              <p className="text-xs text-zinc-500">Players</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.total_tournaments || 0}+</p>
              <p className="text-xs text-zinc-500">Tournaments</p>
            </div>
          </div>

          {/* Download Section */}
          <div className="bg-zinc-900/50 border border-yellow-500/30 rounded-2xl p-6">
            <Smartphone className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            
            {canInstall ? (
              <>
                <h2 className="font-bold text-lg mb-3">Ready to Install!</h2>
                <Button 
                  onClick={handleInstall}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 text-lg rounded-xl"
                >
                  <Download className="w-6 h-6 mr-2" />
                  INSTALL APP
                </Button>
              </>
            ) : (
              <>
                <h2 className="font-bold text-lg mb-3">Download App</h2>
                <p className="text-sm text-zinc-400 mb-4">
                  Install from browser menu to play tournaments
                </p>
                
                <div className="bg-zinc-800/50 rounded-xl p-4 text-left space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">1</div>
                    <p className="text-sm">Tap browser menu <span className="bg-zinc-700 px-2 py-0.5 rounded">⋮</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">2</div>
                    <p className="text-sm">Select <span className="text-yellow-400">"Install App"</span> or <span className="text-yellow-400">"Add to Home"</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm">3</div>
                    <p className="text-sm">Open from home screen</p>
                  </div>
                </div>

                <Button 
                  onClick={() => alert('Tap the browser menu (⋮) and select "Install App" or "Add to Home Screen"')}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5 rounded-xl"
                >
                  <Download className="w-5 h-5 mr-2" />
                  HOW TO DOWNLOAD
                </Button>
              </>
            )}
          </div>

          {/* Features */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-800/30 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-zinc-400">Real Money</p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-zinc-400">Instant Payout</p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-zinc-400">Free Fire & BGMI</p>
            </div>
            <div className="bg-zinc-800/30 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-zinc-400">Daily Tournaments</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-zinc-600">
        <p>© 2024 DHRIVO WON. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
