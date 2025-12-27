import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Users, Gamepad2, Download, 
  Zap, Shield, Coins, Star, Smartphone
} from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const LandingPage = () => {
  const [stats, setStats] = useState({ total_players: 0, total_tournaments: 0, total_matches_played: 0 });
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    fetchStats();
    
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/public/stats');
      setStats(response.data);
    } catch (error) {}
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      // Show instructions modal instead of alert
      setShowInstructions(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="mb-8">
              <img src="/logo.png" alt="DHRIVO WON" className="w-32 h-32 mx-auto object-contain" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Chakra_Petch'] mb-4">
              DHRIVO <span className="text-yellow-400">WON</span>
              <span className="text-yellow-400 text-xl align-top">©</span>
            </h1>
            
            <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-8">
              India's Premier Gaming Tournament Platform. 
              Free Fire & BGMI tournaments. Win Real Money!
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10">
              <motion.div 
                className="bg-zinc-800/50 border border-white/10 p-3 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Users className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-xl font-bold">{stats.total_players}+</div>
                <div className="text-xs text-zinc-500">Players</div>
              </motion.div>

              <motion.div 
                className="bg-zinc-800/50 border border-white/10 p-3 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-xl font-bold">{stats.total_tournaments}+</div>
                <div className="text-xs text-zinc-500">Tournaments</div>
              </motion.div>

              <motion.div 
                className="bg-zinc-800/50 border border-white/10 p-3 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Gamepad2 className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-xl font-bold">{stats.total_matches_played}+</div>
                <div className="text-xs text-zinc-500">Matches</div>
              </motion.div>
            </div>

            {/* Download Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 max-w-md mx-auto"
            >
              <Smartphone className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Download the App</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Registration only available through the app. Website registration is not allowed.
              </p>

              <Button 
                onClick={handleInstall}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 text-lg rounded-lg mb-4"
              >
                <Download className="w-6 h-6 mr-2" />
                DOWNLOAD APP
              </Button>

              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-zinc-400">Click Menu (⋮)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-zinc-400">Select "Install App"</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-yellow-400 text-black rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-zinc-400">Open from Home Screen</span>
                </div>
              </div>
            </motion.div>

            <p className="text-xs text-zinc-600 mt-6">
              Works on: Chrome, Safari, Edge, Firefox (Android, iOS, Windows, Mac)
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8 font-['Chakra_Petch']">
            WHY <span className="text-yellow-400">DHRIVO WON</span>?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'Instant Payouts', desc: '5-10 min withdrawal' },
              { icon: Shield, title: 'Fair Play', desc: 'Anti-cheat system' },
              { icon: Coins, title: 'Real Money', desc: 'Win cash prizes' },
              { icon: Star, title: 'Daily Rewards', desc: 'Lucky draws & more' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-800/50 border border-white/10 p-4 rounded-lg text-center"
              >
                <feature.icon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-zinc-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="DW" className="w-6 h-6 object-contain" />
          <span className="text-sm text-zinc-400">© 2024 DHRIVO WON</span>
        </div>
        <p className="text-xs text-zinc-600">Powered by DHRIVO</p>
      </footer>
    </div>
  );
};

export default LandingPage;
