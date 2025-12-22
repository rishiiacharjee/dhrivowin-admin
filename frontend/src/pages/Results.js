import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { Award, Trophy, Medal, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Results = () => {
  const [results, setResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsRes, leaderboardRes] = await Promise.all([
        api.get('/results'),
        api.get('/leaderboard')
      ]);
      setResults(resultsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-zinc-400">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            <Award className="inline-block w-8 h-8 text-blue-400 mr-2" />
            RESULTS & <span className="text-blue-400">LEADERBOARD</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Leaderboard */}
            <div className="bg-zinc-900/50 border border-white/10 p-6">
              <h2 className="text-lg font-bold font-['Chakra_Petch'] mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" /> TOP PLAYERS
              </h2>
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <motion.div key={entry.user?.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between p-3 ${index < 3 ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-zinc-800/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 flex items-center justify-center">{getRankIcon(index + 1)}</div>
                        <span className="font-semibold">{entry.user?.name}</span>
                      </div>
                      <span className="text-yellow-400 font-bold">{entry.wins} wins</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No data yet</p>
              )}
            </div>

            {/* Recent Results */}
            <div className="bg-zinc-900/50 border border-white/10 p-6">
              <h2 className="text-lg font-bold font-['Chakra_Petch'] mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" /> RECENT RESULTS
              </h2>
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.slice(0, 10).map((result) => (
                    <div key={result.id} className="bg-zinc-800/50 p-4">
                      <h3 className="font-bold mb-2">{result.tournament_title}</h3>
                      <div className="space-y-1">
                        {result.winners?.slice(0, 3).map((w, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">{getRankIcon(w.rank)} Player</span>
                            <span className="text-green-400">+{w.prize} DR</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-500 mt-2">{new Date(result.created_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-8">No results yet</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Results;
