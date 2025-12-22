import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import JoinAnimation from '../components/JoinAnimation';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { 
  Trophy, Users, Calendar, Clock, Gamepad2, 
  ChevronLeft, Coins, AlertCircle, Check, Copy, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [joinData, setJoinData] = useState({ game_uid: '', game_name: '' });
  const [hasJoined, setHasJoined] = useState(false);
  const [showJoinAnimation, setShowJoinAnimation] = useState(false);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const [tournamentRes, participantsRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/participants`)
      ]);
      setTournament(tournamentRes.data);
      setParticipants(participantsRes.data);
      
      // Check if user has already joined
      const userJoined = participantsRes.data.some(p => p.user_id === user?.id);
      setHasJoined(userJoined);
    } catch (error) {
      toast.error('Tournament not found');
      navigate('/tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!joinData.game_uid || !joinData.game_name) {
      toast.error('Please fill in your game details');
      return;
    }

    setJoining(true);
    try {
      const response = await api.post(`/tournaments/${id}/join`, {
        tournament_id: id,
        game_uid: joinData.game_uid,
        game_name: joinData.game_name
      });
      
      toast.success('Successfully joined the tournament!');
      setJoinDialogOpen(false);
      setHasJoined(true);
      
      // Show room details if available
      if (response.data.room_id) {
        toast.info(`Room ID: ${response.data.room_id}\nPassword: ${response.data.room_password}`);
      }
      
      await refreshUser();
      fetchTournament();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to join tournament');
    } finally {
      setJoining(false);
    }
  };

  const copyRoomDetails = () => {
    if (tournament?.room_id) {
      navigator.clipboard.writeText(`Room ID: ${tournament.room_id}\nPassword: ${tournament.room_password}`);
      toast.success('Room details copied!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
      </div>
    );
  }

  if (!tournament) return null;

  const canJoin = tournament.status === 'UPCOMING' && 
                  tournament.current_participants < tournament.max_participants &&
                  !hasJoined;

  const insufficientBalance = user?.wallet_balance < tournament.entry_fee;

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Tournaments
        </button>

        {/* Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 overflow-hidden mb-6"
        >
          {/* Banner */}
          <div className="relative h-48 sm:h-64">
            {tournament.poster_url ? (
              <img 
                src={tournament.poster_url} 
                alt={tournament.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-zinc-900 flex items-center justify-center">
                <Trophy className="w-20 h-20 text-yellow-400/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
            
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 px-3 py-1.5 text-sm font-bold uppercase
              ${tournament.status === 'UPCOMING' ? 'bg-blue-500' : 
                tournament.status === 'ONGOING' ? 'bg-green-500' : 'bg-zinc-500'}`}
            >
              {tournament.status}
            </div>

            {/* Game Type */}
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1.5 text-sm font-bold">
              {tournament.game_type}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch'] mb-4">
              {tournament.title}
            </h1>

            {/* Mode & Team Type */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 text-sm font-bold flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                {tournament.mode === 'BR' ? 'Battle Royale' : 
                 tournament.mode === 'CS' ? 'Clash Squad' : 'Lone Wolf'}
              </span>
              <span className="bg-zinc-800 text-white px-3 py-1 text-sm font-bold">
                {tournament.team_type}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-zinc-800/50 p-4 text-center">
                <Coins className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-400">{tournament.entry_fee}</div>
                <div className="text-xs text-zinc-500 uppercase">Entry Fee (DR)</div>
              </div>
              <div className="bg-zinc-800/50 p-4 text-center">
                <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{tournament.prize_pool}</div>
                <div className="text-xs text-zinc-500 uppercase">Prize Pool (DR)</div>
              </div>
              <div className="bg-zinc-800/50 p-4 text-center">
                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">
                  {tournament.current_participants}/{tournament.max_participants}
                </div>
                <div className="text-xs text-zinc-500 uppercase">Participants</div>
              </div>
              <div className="bg-zinc-800/50 p-4 text-center">
                <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{tournament.match_date}</div>
                <div className="text-sm text-zinc-400">{tournament.match_time}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Slots Filled</span>
                <span className="text-yellow-400">
                  {Math.round((tournament.current_participants / tournament.max_participants) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 transition-all"
                  style={{ width: `${(tournament.current_participants / tournament.max_participants) * 100}%` }}
                />
              </div>
            </div>

            {/* Description */}
            {tournament.description && (
              <div className="mb-6">
                <h3 className="font-bold mb-2 font-['Chakra_Petch']">DESCRIPTION</h3>
                <p className="text-zinc-400">{tournament.description}</p>
              </div>
            )}

            {/* Room Details (if joined) */}
            {hasJoined && tournament.room_id && (
              <div className="bg-green-900/20 border border-green-500/30 p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-green-400">ROOM DETAILS</h3>
                  <button onClick={copyRoomDetails} className="text-green-400 hover:text-green-300">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-white">Room ID: <span className="font-mono font-bold">{tournament.room_id}</span></p>
                <p className="text-white">Password: <span className="font-mono font-bold">{tournament.room_password}</span></p>
              </div>
            )}

            {/* Join Button */}
            {hasJoined ? (
              <div className="bg-green-900/20 border border-green-500/30 p-4 flex items-center gap-3">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-bold">You have joined this tournament!</span>
              </div>
            ) : canJoin ? (
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 text-lg"
                    disabled={insufficientBalance}
                    data-testid="join-tournament-btn"
                  >
                    <span className="flex items-center gap-2">
                      {insufficientBalance ? (
                        <>
                          <AlertCircle className="w-5 h-5" />
                          Insufficient Balance
                        </>
                      ) : (
                        <>
                          <Gamepad2 className="w-5 h-5" />
                          JOIN NOW - {tournament.entry_fee} DR
                        </>
                      )}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="font-['Chakra_Petch']">JOIN TOURNAMENT</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Game UID *</Label>
                      <Input
                        placeholder="Enter your in-game UID"
                        value={joinData.game_uid}
                        onChange={(e) => setJoinData({ ...joinData, game_uid: e.target.value })}
                        className="bg-zinc-800/50 border-white/10"
                        data-testid="game-uid-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Game Name *</Label>
                      <Input
                        placeholder="Enter your in-game name"
                        value={joinData.game_name}
                        onChange={(e) => setJoinData({ ...joinData, game_name: e.target.value })}
                        className="bg-zinc-800/50 border-white/10"
                        data-testid="game-name-input"
                      />
                    </div>
                    <div className="bg-yellow-400/10 border border-yellow-400/30 p-3 text-sm">
                      <p className="text-yellow-400">Entry Fee: {tournament.entry_fee} DR</p>
                      <p className="text-zinc-400">Your Balance: {user?.wallet_balance} DR</p>
                    </div>
                    <Button
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold"
                      data-testid="confirm-join-btn"
                    >
                      {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRM JOIN'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : tournament.status !== 'UPCOMING' ? (
              <div className="bg-zinc-800/50 p-4 text-center text-zinc-400">
                Tournament is no longer accepting participants
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-500/30 p-4 text-center text-red-400">
                Tournament is full
              </div>
            )}
          </div>
        </motion.div>

        {/* Participants List */}
        <div className="bg-zinc-900/50 border border-white/10 p-6">
          <h2 className="text-lg font-bold font-['Chakra_Petch'] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            PARTICIPANTS ({participants.length})
          </h2>
          
          {participants.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.map((p, index) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between bg-zinc-800/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{p.game_name}</p>
                      <p className="text-xs text-zinc-500">UID: {p.game_uid}</p>
                    </div>
                  </div>
                  {p.user_id === user?.id && (
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1">YOU</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-8">No participants yet. Be the first to join!</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default TournamentDetails;
