import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Wallet, Headphones, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const gameCategories = [
  { id: 'fullmap', name: 'FULL MAP', subtitle: 'Full Map FF', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', mode: 'BR', team: 'SQUAD', color: 'from-red-600 to-orange-600' },
  { id: 'survival', name: 'SURVIVAL', subtitle: 'Survival', image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=300', mode: 'BR', team: 'SOLO', color: 'from-cyan-500 to-blue-600' },
  { id: 'cs1v1', name: 'CLASH SQUAD', subtitle: 'CS 1v1', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=300', mode: 'CS', team: 'SOLO', badge: '1VS1', color: 'from-purple-600 to-pink-600' },
  { id: 'cs2v2', name: 'CLASH SQUAD', subtitle: 'CS 2v2', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=300', mode: 'CS', team: 'DUO', badge: '2VS2', color: 'from-orange-500 to-red-600' },
  { id: 'cs4v4', name: 'CLASH SQUAD', subtitle: 'CS 4v4', image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b0e?w=300', mode: 'CS', team: 'SQUAD', badge: '4VS4', color: 'from-blue-500 to-purple-600' },
  { id: 'lw1v1', name: 'LONE WOLF', subtitle: 'LW 1v1', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=300', mode: 'LW', team: 'SOLO', badge: '1VS1', color: 'from-yellow-500 to-orange-600' },
  { id: 'lw2v2', name: 'LONE WOLF', subtitle: 'LW 2v2', image: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=300', mode: 'LW', team: 'DUO', badge: '2VS2', color: 'from-green-500 to-teal-600' },
  { id: 'bgmi', name: 'BGMI', subtitle: 'BGMI', image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f0cf9?w=300', game: 'BGMI', color: 'from-amber-500 to-yellow-600' },
  { id: 'giveaway', name: 'MEGA GIVEAWAY', subtitle: 'Giveaways', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=300', isGiveaway: true, color: 'from-pink-500 to-rose-600' },
  { id: 'free', name: 'FREE MATCHES', subtitle: 'Free Entry', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300', isFree: true, color: 'from-emerald-500 to-green-600' },
  { id: 'luckydraw', name: 'LUCKY DRAW', subtitle: 'Win Big', image: 'https://images.unsplash.com/photo-1518893494013-4e7ab1c0a2db?w=300', isLuckyDraw: true, color: 'from-violet-500 to-purple-600' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tournaments: 0, players: 0 });

  useEffect(() => {
    fetchStats();
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
    if (cat.isFree) return '/tournaments?fee=0';
    if (cat.game) return `/tournaments?game=${cat.game}`;
    return `/tournaments?mode=${cat.mode}&team=${cat.team}`;
  };

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-3 py-4 pt-20 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xl font-bold text-black">DW</span>
            </div>
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm">Welcome Back,</p>
            <p className="text-white font-bold text-lg">{user?.username || 'Player'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/wallet" className="flex items-center gap-2 bg-zinc-800/80 px-3 py-2 rounded-full">
              <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <span className="text-black text-xs font-bold">₹</span>
              </div>
              <span className="text-yellow-400 font-bold">{user?.wallet_balance || 0}</span>
            </Link>
          </div>
        </div>

        {/* Game Categories Grid */}
        <div className="grid grid-cols-3 gap-3">
          {gameCategories.map((cat, index) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={getCategoryLink(cat)}
                className="block relative overflow-hidden rounded-lg aspect-square group"
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-70`} />
                
                {/* Badge */}
                {cat.badge && (
                  <div className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded text-xs font-bold">
                    {cat.badge}
                  </div>
                )}

                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-2 text-center">
                  <h3 className="text-white font-bold text-sm leading-tight drop-shadow-lg">
                    {cat.name}
                  </h3>
                </div>

                {/* Hover Effect */}
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
