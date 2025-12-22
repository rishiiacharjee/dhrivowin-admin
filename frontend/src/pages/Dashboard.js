import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import NewsTicker from '../components/NewsTicker';
import TournamentCard from '../components/TournamentCard';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { 
  Trophy, ChevronRight, Wallet, Gift, Ticket, 
  Award, Gamepad2, Clock, TrendingUp
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState({ upcoming: [], ongoing: [], completed: [] });
  const [myMatches, setMyMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [upcomingRes, ongoingRes, completedRes, myMatchesRes] = await Promise.all([
        api.get('/tournaments?status=UPCOMING'),
        api.get('/tournaments?status=ONGOING'),
        api.get('/tournaments?status=COMPLETED'),
        api.get('/my-matches')
      ]);
      
      setTournaments({
        upcoming: upcomingRes.data.slice(0, 6),
        ongoing: ongoingRes.data.slice(0, 6),
        completed: completedRes.data.slice(0, 6)
      });
      setMyMatches(myMatchesRes.data.slice(0, 4));
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { to: '/tournaments', icon: Trophy, label: 'All Matches', color: 'text-yellow-400' },
    { to: '/wallet', icon: Wallet, label: 'Recharge', color: 'text-green-400' },
    { to: '/lucky-draw', icon: Ticket, label: 'Lucky Draw', color: 'text-purple-400' },
    { to: '/giveaways', icon: Gift, label: 'Giveaways', color: 'text-pink-400' },
    { to: '/results', icon: Award, label: 'Results', color: 'text-blue-400' },
  ];

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      
      {/* News Ticker */}
      <div className="pt-16">
        <NewsTicker />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            Welcome, <span className="text-yellow-400">{user?.name}</span>!
          </h1>
          <p className="text-zinc-400 mt-1">Ready to compete and win?</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{user?.wallet_balance || 0}</p>
                <p className="text-xs text-zinc-500 uppercase">DR Balance</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-900/50 border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-400/20 flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{myMatches.length}</p>
                <p className="text-xs text-zinc-500 uppercase">My Matches</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900/50 border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tournaments.upcoming.length}</p>
                <p className="text-xs text-zinc-500 uppercase">Upcoming</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900/50 border border-white/10 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-400/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{tournaments.ongoing.length}</p>
                <p className="text-xs text-zinc-500 uppercase">Live</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-bold font-['Chakra_Petch'] mb-4">QUICK ACTIONS</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex-shrink-0 bg-zinc-900/50 border border-white/10 hover:border-yellow-400/50 p-4 min-w-[120px] text-center transition-colors"
              >
                <action.icon className={`w-8 h-8 ${action.color} mx-auto mb-2`} />
                <p className="text-sm font-medium">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Tournaments Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-['Chakra_Petch']">TOURNAMENTS</h2>
            <Link to="/tournaments" className="text-yellow-400 text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="bg-zinc-900/50 border border-white/10 p-1 w-full justify-start overflow-x-auto">
              <TabsTrigger 
                value="upcoming" 
                className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
              >
                Upcoming ({tournaments.upcoming.length})
              </TabsTrigger>
              <TabsTrigger 
                value="ongoing"
                className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold"
              >
                Ongoing ({tournaments.ongoing.length})
              </TabsTrigger>
              <TabsTrigger 
                value="completed"
                className="data-[state=active]:bg-zinc-500 data-[state=active]:text-white font-semibold"
              >
                Completed ({tournaments.completed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4">
              {tournaments.upcoming.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournaments.upcoming.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming tournaments</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="ongoing" className="mt-4">
              {tournaments.ongoing.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournaments.ongoing.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <Gamepad2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No ongoing tournaments</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {tournaments.completed.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tournaments.completed.map((t) => (
                    <TournamentCard key={t.id} tournament={t} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed tournaments yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* My Matches */}
        {myMatches.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-['Chakra_Petch']">MY MATCHES</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {myMatches.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
