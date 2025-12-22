import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Gift, Clock, Users, ExternalLink, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const Giveaways = () => {
  const { user } = useAuth();
  const [giveaways, setGiveaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    fetchGiveaways();
  }, []);

  const fetchGiveaways = async () => {
    try {
      const response = await api.get('/giveaways');
      setGiveaways(response.data);
    } catch (error) {
      console.error('Failed to fetch giveaways');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (giveawayId) => {
    setJoining(giveawayId);
    try {
      await api.post(`/giveaways/${giveawayId}/join`);
      toast.success('Successfully joined the giveaway!');
      fetchGiveaways();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to join');
    } finally {
      setJoining(null);
    }
  };

  const hasJoined = (giveaway) => {
    return giveaway.participants?.includes(user?.id);
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            <Gift className="inline-block w-8 h-8 text-pink-400 mr-2" />
            FREE <span className="text-pink-400">GIVEAWAYS</span>
          </h1>
          <p className="text-zinc-400 mt-1">Join for free and win amazing prizes!</p>
        </div>

        {/* Giveaways Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
          </div>
        ) : giveaways.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {giveaways.map((giveaway, index) => (
              <motion.div
                key={giveaway.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-pink-500/30 hover:border-pink-500/50 transition-colors overflow-hidden"
              >
                {/* Image */}
                {giveaway.image_url && (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={giveaway.image_url} 
                      alt={giveaway.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Status */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 text-xs font-bold uppercase ${
                      giveaway.status === 'ACTIVE' ? 'bg-pink-500' : 'bg-zinc-600'
                    }`}>
                      {giveaway.status}
                    </span>
                    <span className="text-zinc-400 text-sm flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Ends: {giveaway.end_date}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold font-['Chakra_Petch'] mb-2">{giveaway.title}</h3>
                  <p className="text-zinc-400 text-sm mb-4">{giveaway.description}</p>

                  {/* Prize */}
                  <div className="bg-pink-500/10 border border-pink-500/30 p-3 mb-4">
                    <p className="text-sm text-zinc-400">Prize</p>
                    <p className="text-lg font-bold text-pink-400">{giveaway.prize}</p>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-2 text-zinc-400 mb-4">
                    <Users className="w-4 h-4" />
                    <span>{giveaway.participants?.length || 0} participants</span>
                  </div>

                  {/* External Link */}
                  {giveaway.external_link && (
                    <a 
                      href={giveaway.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-yellow-400 hover:underline mb-4"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Product
                    </a>
                  )}

                  {/* Action Button */}
                  {giveaway.status === 'ACTIVE' && (
                    hasJoined(giveaway) ? (
                      <div className="bg-green-500/20 text-green-400 p-3 text-center font-bold flex items-center justify-center gap-2">
                        <Check className="w-5 h-5" />
                        You've Joined!
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleJoin(giveaway.id)}
                        disabled={joining === giveaway.id}
                        className="w-full bg-pink-500 hover:bg-pink-400 text-white font-bold"
                        data-testid={`join-giveaway-${giveaway.id}`}
                      >
                        {joining === giveaway.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          'JOIN FOR FREE'
                        )}
                      </Button>
                    )
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500">
            <Gift className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No giveaways available</p>
            <p className="text-sm">Check back later for free prizes!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Giveaways;
