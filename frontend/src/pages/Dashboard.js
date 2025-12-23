import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Wallet, ChevronRight, Download, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';

const gameCategories = [
  { id: 'br-solo', name: 'BR SOLO', subtitle: 'Battle Royale Solo', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', mode: 'BR', team: 'SOLO', color: 'from-red-600 to-orange-600' },
  { id: 'br-duo', name: 'BR DUO', subtitle: 'Battle Royale Duo', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300', mode: 'BR', team: 'DUO', color: 'from-cyan-500 to-blue-600' },
  { id: 'br-squad', name: 'BR SQUAD', subtitle: 'Battle Royale Squad', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=300', mode: 'BR', team: 'SQUAD', color: 'from-purple-600 to-pink-600' },
  { id: 'cs-1v1', name: 'CS 1V1', subtitle: 'Clash Squad 1v1', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=300', mode: 'CS', team: 'SOLO', badge: '1V1', color: 'from-orange-500 to-red-600' },
  { id: 'cs-2v2', name: 'CS 2V2', subtitle: 'Clash Squad 2v2', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=300', mode: 'CS', team: 'DUO', badge: '2V2', color: 'from-blue-500 to-purple-600' },
  { id: 'cs-4v4', name: 'CS 4V4', subtitle: 'Clash Squad 4v4', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=300', mode: 'CS', team: 'SQUAD', badge: '4V4', color: 'from-green-500 to-teal-600' },
  { id: 'lw-1v1', name: 'LW 1V1', subtitle: 'Lone Wolf 1v1', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=300', mode: 'LW', team: 'SOLO', badge: '1V1', color: 'from-yellow-500 to-orange-600' },
  { id: 'lw-2v2', name: 'LW 2V2', subtitle: 'Lone Wolf 2v2', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=300', mode: 'LW', team: 'DUO', badge: '2V2', color: 'from-pink-500 to-rose-600' },
  { id: 'bgmi', name: 'BGMI', subtitle: 'BGMI Matches', image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f0cf9?w=300', game: 'BGMI', color: 'from-amber-500 to-yellow-600' },
  { id: 'giveaway', name: 'GIVEAWAY', subtitle: 'Free Prizes', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300', isGiveaway: true, color: 'from-pink-500 to-rose-600' },
  { id: 'luckydraw', name: 'LUCKY DRAW', subtitle: 'Win Big', image: 'https://images.unsplash.com/photo-1518893494013-4e7ab1c0a2db?w=300', isLuckyDraw: true, color: 'from-violet-500 to-purple-600' },
  { id: 'results', name: 'RESULTS', subtitle: 'Match Results', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300', isResults: true, color: 'from-emerald-500 to-green-600' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_tournaments: 0, total_players: 0 });
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    fetchStats();
    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    setIsPWA(isStandalone);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/public/stats');
      setStats(res.data);
    } catch (e) {}
  };

  const getCategoryLink = (cat) => {
    if (cat.isGiveaway) return '/giveaways';
    if (cat.isLuckyDraw) return '/lucky-draw';
    if (cat.isResults) return '/results';
    if (cat.game) return `/tournaments?game=${cat.game}`;
    return `/tournaments?mode=${cat.mode}&team=${cat.team}`;
  };

  // If not PWA, show download prompt
  if (!isPWA) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <img src="/logo.png" alt="DHRIVO WON" className="w-32 h-32 mx-auto mb-6 object-contain" />
          <h1 className="text-3xl font-bold font-['Chakra_Petch'] mb-2">
            DHRIVO <span className="text-yellow-400">WON</span>©
          </h1>
          <p className="text-zinc-400 mb-8">App download karein gaming tournaments join karne ke liye!</p>
          
          <div className="bg-zinc-800/50 border border-yellow-500/30 rounded-lg p-6 mb-6">
            <Smartphone className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="font-bold text-lg mb-4">App Install Karein</h2>
            
            <div className="text-left space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">1</span>
                <p className="text-sm text-zinc-300">Browser menu (⋮) open karein</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">2</span>
                <p className="text-sm text-zinc-300">"Install App" ya "Add to Home Screen" click karein</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">3</span>
                <p className="text-sm text-zinc-300">Home screen se app open karein</p>
              </div>
            </div>

            <Button 
              onClick={() => {
                if (window.deferredPrompt) {
                  window.deferredPrompt.prompt();
                } else {
                  alert('Browser menu se "Add to Home Screen" select karein!');
                }
              }}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-4"
            >
              <Download className="w-5 h-5 mr-2" />
              DOWNLOAD APP
            </Button>
          </div>

          <p className="text-xs text-zinc-500">
            Works on: Chrome, Safari, Edge, Firefox
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-3 py-4 pt-20 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="DW" className="w-12 h-12 object-contain" />
          </div>
          <div className="text-right">
            <p className="text-zinc-400 text-sm">Welcome Back,</p>
            <p className="text-white font-bold text-lg">{user?.username || 'Player'}</p>
          </div>
          <Link to="/wallet" className="flex items-center gap-2 bg-zinc-800/80 px-3 py-2 rounded-full">
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black text-xs font-bold">₹</span>
            </div>
            <span className="text-yellow-400 font-bold">{user?.wallet_balance || 0}</span>
          </Link>
        </div>

        {/* Game Categories Grid */}
        <div className="grid grid-cols-3 gap-3">
          {gameCategories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Link
                to={getCategoryLink(cat)}
                className="block relative overflow-hidden rounded-lg aspect-square group"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70`} />
                
                {cat.badge && (
                  <div className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded text-xs font-bold">
                    {cat.badge}
                  </div>
                )}

                <div className="absolute inset-0 flex flex-col items-center justify-end p-2 text-center">
                  <h3 className="text-white font-bold text-xs sm:text-sm leading-tight drop-shadow-lg">
                    {cat.name}
                  </h3>
                </div>

                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-center text-zinc-400 text-xs mt-1 truncate">{cat.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.total_tournaments || 0}</p>
            <p className="text-xs text-zinc-400">Total Matches</p>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.total_players || 0}</p>
            <p className="text-xs text-zinc-400">Total Players</p>
          </div>
        </div>

        {/* Admin Quick Access */}
        {user?.is_admin && (
          <Link to="/admin" className="mt-4 block bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-black">Admin Panel</p>
                <p className="text-black/70 text-sm">Manage tournaments & users</p>
              </div>
              <ChevronRight className="w-6 h-6 text-black" />
            </div>
          </Link>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
