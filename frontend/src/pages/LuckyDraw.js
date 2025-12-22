import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Ticket, Clock, Users, Trophy, Coins, Loader2, Crown } from 'lucide-react';
import { motion } from 'framer-motion';

const LuckyDraw = () => {
  const { user, refreshUser } = useAuth();
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(null);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const response = await api.get('/lucky-draws');
      setDraws(response.data);
    } catch (error) {
      console.error('Failed to fetch lucky draws');
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = async (drawId, entryCost) => {
    if (user?.wallet_balance < entryCost) {
      toast.error('Insufficient balance');
      return;
    }

    setEntering(drawId);
    try {
      await api.post(`/lucky-draws/${drawId}/enter`);
      toast.success('Successfully entered the lucky draw!');
      await refreshUser();
      fetchDraws();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to enter');
    } finally {
      setEntering(null);
    }
  };

  const hasEntered = (draw) => {
    return draw.entries?.includes(user?.id);
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            <Ticket className="inline-block w-8 h-8 text-purple-400 mr-2" />
            LUCKY <span className="text-purple-400">DRAW</span>
          </h1>
          <p className="text-zinc-400 mt-1">Try your luck and win big prizes!</p>
        </div>

        {/* Draws Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        ) : draws.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {draws.map((draw, index) => (
              <motion.div
                key={draw.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-zinc-900/50 border p-6 ${
                  draw.status === 'COMPLETED' 
                    ? 'border-zinc-700' 
                    : 'border-purple-500/30 hover:border-purple-500/50'
                } transition-colors`}
              >
                {/* Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-bold uppercase ${
                    draw.status === 'ACTIVE' ? 'bg-purple-500' : 'bg-zinc-600'
                  }`}>
                    {draw.status}
                  </span>
                  <span className="text-zinc-400 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {draw.end_date}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold font-['Chakra_Petch'] mb-4">{draw.title}</h3>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-zinc-800/50 p-3 text-center">
                    <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-yellow-400">{draw.entry_cost}</p>
                    <p className="text-xs text-zinc-500">Entry (DR)</p>
                  </div>
                  <div className="bg-zinc-800/50 p-3 text-center">
                    <Trophy className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-400">{draw.prize_amount}</p>
                    <p className="text-xs text-zinc-500">Prize (DR)</p>
                  </div>
                  <div className="bg-zinc-800/50 p-3 text-center">
                    <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-lg font-bold">{draw.current_entries}/{draw.max_entries}</p>
                    <p className="text-xs text-zinc-500">Entries</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all"
                      style={{ width: `${(draw.current_entries / draw.max_entries) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Winner (if completed) */}
                {draw.status === 'COMPLETED' && draw.winner && (
                  <div className="bg-yellow-400/10 border border-yellow-400/30 p-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">Winner Announced!</span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {draw.status === 'ACTIVE' && (
                  hasEntered(draw) ? (
                    <div className="bg-purple-500/20 text-purple-400 p-3 text-center font-bold">
                      <Ticket className="w-5 h-5 inline-block mr-2" />
                      You're In! Good Luck!
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleEnter(draw.id, draw.entry_cost)}
                      disabled={entering === draw.id || draw.current_entries >= draw.max_entries}
                      className="w-full bg-purple-500 hover:bg-purple-400 text-white font-bold"
                      data-testid={`enter-draw-${draw.id}`}
                    >
                      {entering === draw.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : draw.current_entries >= draw.max_entries ? (
                        'DRAW FULL'
                      ) : (
                        `ENTER FOR ${draw.entry_cost} DR`
                      )}
                    </Button>
                  )
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500">
            <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No lucky draws available</p>
            <p className="text-sm">Check back later for new draws!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default LuckyDraw;
