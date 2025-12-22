import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy, Users, Gamepad2, Download, ChevronRight, 
  Zap, Shield, Coins, Star, Play, Smartphone, Chrome
} from 'lucide-react';
import { Button } from '../components/ui/button';
import api from '../lib/api';

const LandingPage = () => {
  const [stats, setStats] = useState({ total_players: 0, total_tournaments: 0, total_matches_played: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/public/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] grid-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.pexels.com/photos/9072202/pexels-photo-9072202.jpeg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090B]/80 to-[#09090B]" />
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-4">
                <div className="w-20 h-20 bg-yellow-400 flex items-center justify-center transform -skew-x-12">
                  <span className="font-bold text-black text-3xl font-['Chakra_Petch'] transform skew-x-12">DW</span>
                </div>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold font-['Chakra_Petch'] mb-4">
              DHRIVO <span className="text-yellow-400 neon-glow">WON</span>
              <span className="text-yellow-400 text-2xl align-top">©</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 font-['Rajdhani']">
              India's Premier Gaming Tournament Platform. 
              Compete in Free Fire & BGMI tournaments. Win Real Money!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/register">
                <Button 
                  className="turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-6 text-lg font-bold"
                  data-testid="get-started-btn"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    GET STARTED
                  </span>
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="turbo-btn border-white/20 hover:border-yellow-400 px-8 py-6 text-lg"
                  data-testid="login-btn"
                >
                  <span>LOGIN</span>
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <motion.div 
                className="bg-zinc-900/50 border border-white/10 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white font-['Chakra_Petch']">
                  {stats.total_players}+
                </div>
                <div className="text-sm text-zinc-500 uppercase">Players</div>
              </motion.div>

              <motion.div 
                className="bg-zinc-900/50 border border-white/10 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white font-['Chakra_Petch']">
                  {stats.total_tournaments}+
                </div>
                <div className="text-sm text-zinc-500 uppercase">Tournaments</div>
              </motion.div>

              <motion.div 
                className="bg-zinc-900/50 border border-white/10 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Gamepad2 className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white font-['Chakra_Petch']">
                  {stats.total_matches_played}+
                </div>
                <div className="text-sm text-zinc-500 uppercase">Matches</div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronRight className="w-8 h-8 text-yellow-400 rotate-90" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 font-['Chakra_Petch']">
            WHY <span className="text-yellow-400">DHRIVO WON</span>?
          </h2>
          <p className="text-zinc-400 text-center mb-12 max-w-xl mx-auto">
            The ultimate gaming experience with real rewards
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'Instant Payouts', desc: 'Withdraw your winnings in minutes via UPI or Bank' },
              { icon: Shield, title: 'Fair Play', desc: 'Anti-cheat systems ensure fair competition' },
              { icon: Coins, title: 'Real Money', desc: 'Win real cash prizes in every tournament' },
              { icon: Star, title: 'Daily Rewards', desc: 'Lucky draws and giveaways every day' },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-white/10 p-6 hover:border-yellow-400/50 transition-colors group"
              >
                <feature.icon className="w-10 h-10 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-bold text-lg mb-2 font-['Chakra_Petch']">{feature.title}</h3>
                <p className="text-sm text-zinc-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 font-['Chakra_Petch']">
            SUPPORTED <span className="text-yellow-400">GAMES</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Fire */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-64 overflow-hidden border border-white/10 group"
            >
              <img 
                src="https://images.pexels.com/photos/3526022/pexels-photo-3526022.jpeg"
                alt="Free Fire"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold font-['Chakra_Petch'] mb-2">FREE FIRE</h3>
                <div className="flex gap-2">
                  <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 text-xs font-bold">BR</span>
                  <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 text-xs font-bold">CS</span>
                  <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 text-xs font-bold">LW</span>
                </div>
              </div>
            </motion.div>

            {/* BGMI */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative h-64 overflow-hidden border border-white/10 group"
            >
              <img 
                src="https://images.pexels.com/photos/8183683/pexels-photo-8183683.jpeg"
                alt="BGMI"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold font-['Chakra_Petch'] mb-2">BGMI</h3>
                <div className="flex gap-2">
                  <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 text-xs font-bold">SOLO</span>
                  <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 text-xs font-bold">DUO</span>
                  <span className="bg-yellow-400/20 text-yellow-400 px-2 py-1 text-xs font-bold">SQUAD</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Download CTA */}
      <section className="py-20 px-4 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-yellow-400 flex items-center justify-center transform -skew-x-12">
                  <Smartphone className="w-12 h-12 text-black transform skew-x-12" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 font-['Chakra_Petch']">
                  DOWNLOAD <span className="text-yellow-400">APP</span>
                </h2>
                <p className="text-zinc-400 mb-6">
                  Install DHRIVO WON on your device for the best gaming experience. 
                  Get instant notifications for new tournaments!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Button 
                    onClick={() => {
                      if ('BeforeInstallPromptEvent' in window || window.deferredPrompt) {
                        window.deferredPrompt?.prompt();
                      } else {
                        alert('Open this site in Chrome and click "Add to Home Screen" from the menu!');
                      }
                    }}
                    className="turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-5 font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <Chrome className="w-5 h-5" />
                      INSTALL FROM CHROME
                    </span>
                  </Button>
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-zinc-500">Works on</p>
                    <p className="text-sm text-zinc-300">Android, iOS, Windows, Mac</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Install Steps */}
            <div className="mt-8 pt-8 border-t border-yellow-500/20">
              <h3 className="text-sm font-bold text-yellow-400 mb-4">HOW TO INSTALL:</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-yellow-400 text-black flex items-center justify-center font-bold flex-shrink-0">1</span>
                  <p className="text-zinc-400">Open this website in <span className="text-white">Chrome browser</span></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-yellow-400 text-black flex items-center justify-center font-bold flex-shrink-0">2</span>
                  <p className="text-zinc-400">Click the <span className="text-white">menu (⋮)</span> button</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-yellow-400 text-black flex items-center justify-center font-bold flex-shrink-0">3</span>
                  <p className="text-zinc-400">Select <span className="text-white">"Install App"</span> or <span className="text-white">"Add to Home Screen"</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Compete */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-['Chakra_Petch']">
            READY TO <span className="text-yellow-400">COMPETE</span>?
          </h2>
          <p className="text-zinc-400 mb-8">
            Join thousands of players winning real money every day
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button className="turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-6 text-lg font-bold">
                <span className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  REGISTER NOW
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-400 flex items-center justify-center">
              <span className="font-bold text-black text-sm font-['Chakra_Petch']">DW</span>
            </div>
            <span className="text-sm text-zinc-400">
              © 2024 DHRIVO WON. All rights reserved.
            </span>
          </div>
          <div className="text-sm text-zinc-500">
            Powered by <span className="text-yellow-400">DHRIVO</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
