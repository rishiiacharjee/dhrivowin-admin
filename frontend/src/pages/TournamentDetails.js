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
  ChevronLeft, Coins, AlertCircle, Check, Copy, Loader2, Crosshair, Timer
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
  const [joinData, setJoinData] = useState({ game_uid: '', game_name: '', slot_number: 1 });
  const [hasJoined, setHasJoined] = useState(false);
  const [showJoinAnimation, setShowJoinAnimation] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [takenSlots, setTakenSlots] = useState([]);

  useEffect(() => {
    fetchTournament();
  }, [id]);

  useEffect(() => {
    if (tournament?.match_date && tournament?.match_time) {
      const timer = setInterval(() => {
        const matchDateTime = new Date(`${tournament.match_date}T${tournament.match_time}`);
        const now = new Date();
        const diff = matchDateTime - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdown({ days, hours, minutes, seconds });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [tournament]);

  const fetchTournament = async () => {
    try {
      const [tournamentRes, participantsRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/participants`)
      ]);
      setTournament(tournamentRes.data);
      setParticipants(participantsRes.data);
      
      const userJoined = participantsRes.data.some(p => p.user_id === user?.id);
      setHasJoined(userJoined);
      
      const taken = participantsRes.data.map(p => p.slot_number).filter(Boolean);
      setTakenSlots(taken);
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
        game_name: joinData.game_name,
        slot_number: joinData.slot_number
      });
      
      toast.success('Successfully joined the tournament!');
      setJoinDialogOpen(false);
      setHasJoined(true);
      setShowJoinAnimation(true);
      
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

  const availableSlots = Array.from({ length: tournament?.max_participants || 10 }, (_, i) => i + 1)
    .filter(slot => !takenSlots.includes(slot));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center">
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
    <div className="min-h-screen bg-[#0a1628] pb-20 md:pb-8">
      <Navbar />
      <JoinAnimation show={showJoinAnimation} onComplete={() => setShowJoinAnimation(false)} />
      
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 rounded-lg overflow-hidden mb-6"
        >
          {/* Banner */}
          <div className="relative h-48 sm:h-56">
            {tournament.poster_url ? (
              <img src={tournament.poster_url} alt={tournament.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-zinc-900 flex items-center justify-center">
                <Trophy className="w-20 h-20 text-yellow-400/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />
            
            <div className={`absolute top-4 right-4 px-3 py-1.5 text-sm font-bold uppercase rounded
              ${tournament.status === 'UPCOMING' ? 'bg-blue-500' : 
                tournament.status === 'ONGOING' ? 'bg-green-500' : 
                tournament.status === 'CANCELLED' ? 'bg-red-500' : 'bg-zinc-500'}`}
            >
              {tournament.status}
            </div>

            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-3 py-1.5 text-sm font-bold rounded">
              {tournament.game_type}
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch'] mb-4">
              {tournament.title}
            </h1>

            {/* Countdown Timer */}
            {tournament.status === 'UPCOMING' && (
              <div className="bg-zinc-800/50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-zinc-400">Match Starts In</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-zinc-900 rounded p-2">
                    <div className="text-2xl font-bold text-yellow-400">{countdown.days}</div>
                    <div className="text-xs text-zinc-500">DAYS</div>
                  </div>
                  <div className="bg-zinc-900 rounded p-2">
                    <div className="text-2xl font-bold text-yellow-400">{countdown.hours}</div>
                    <div className="text-xs text-zinc-500">HOURS</div>
                  </div>
                  <div className="bg-zinc-900 rounded p-2">
                    <div className="text-2xl font-bold text-yellow-400">{countdown.minutes}</div>
                    <div className="text-xs text-zinc-500">MINS</div>
                  </div>
                  <div className="bg-zinc-900 rounded p-2">
                    <div className="text-2xl font-bold text-yellow-400">{countdown.seconds}</div>
                    <div className="text-xs text-zinc-500">SECS</div>
                  </div>
                </div>
              </div>
            )}

            {/* Mode & Team */}
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 text-sm font-bold flex items-center gap-2 rounded">
                <Gamepad2 className="w-4 h-4" />
                {tournament.mode} - {tournament.team_type}
              </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-zinc-800/50 p-3 text-center rounded">
                <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-yellow-400">{tournament.entry_fee}</div>
                <div className="text-xs text-zinc-500">ENTRY</div>
              </div>
              <div className="bg-zinc-800/50 p-3 text-center rounded">
                <Trophy className="w-5 h-5 text-green-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-green-400">{tournament.prize_pool}</div>
                <div className="text-xs text-zinc-500">PRIZE</div>
              </div>
              <div className="bg-zinc-800/50 p-3 text-center rounded">
                <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                <div className="text-xl font-bold">{tournament.current_participants}/{tournament.max_participants}</div>
                <div className="text-xs text-zinc-500">SLOTS</div>
              </div>
            </div>

            {/* Per Kill */}
            {tournament.per_kill_reward > 0 && (
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/50 p-4 mb-6 rounded-lg">
                <div className="flex items-center justify-center gap-4">
                  <Crosshair className="w-6 h-6 text-red-400" />
                  <div className="text-center">
                    <p className="text-xs text-red-400 uppercase font-bold">Per Kill</p>
                    <p className="text-2xl font-bold text-white">{tournament.per_kill_reward} DR</p>
                  </div>
                  <Crosshair className="w-6 h-6 text-red-400" />
                </div>
              </div>
            )}

            {/* Date Time */}
            <div className="flex items-center gap-4 text-zinc-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{tournament.match_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{tournament.match_time}</span>
              </div>
            </div>

            {/* Description */}
            {tournament.description && (
              <div className="mb-6 p-4 bg-zinc-800/30 rounded">
                <h3 className="font-bold mb-2">Description</h3>
                <p className="text-zinc-400 text-sm">{tournament.description}</p>
              </div>
            )}

            {/* Room Details */}
            {hasJoined && tournament.room_id && (
              <div className="bg-green-900/20 border border-green-500/30 p-4 mb-6 rounded-lg">
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
              <div className="bg-green-900/20 border border-green-500/30 p-4 flex items-center gap-3 rounded-lg">
                <Check className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-bold">You have joined this tournament!</span>
              </div>
            ) : canJoin ? (
              <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6 text-lg rounded-lg"
                    disabled={insufficientBalance}
                    data-testid="join-tournament-btn"
                  >
                    {insufficientBalance ? (
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Insufficient Balance
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5" />
                        JOIN NOW - {tournament.entry_fee} DR
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="font-['Chakra_Petch']">JOIN TOURNAMENT</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {/* Slot Selection */}
                    <div className="space-y-2">
                      <Label>Select Slot *</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: tournament.max_participants }, (_, i) => i + 1).map(slot => (
                          <button
                            key={slot}
                            onClick={() => !takenSlots.includes(slot) && setJoinData({ ...joinData, slot_number: slot })}
                            disabled={takenSlots.includes(slot)}
                            className={`p-2 rounded text-sm font-bold transition-all
                              ${takenSlots.includes(slot) 
                                ? 'bg-red-500/20 text-red-400 cursor-not-allowed' 
                                : joinData.slot_number === slot 
                                  ? 'bg-yellow-400 text-black' 
                                  : 'bg-zinc-800 hover:bg-zinc-700'}`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-zinc-500">Red = Taken, Yellow = Selected</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Game UID *</Label>
                      <Input
                        placeholder="Enter your in-game UID"
                        value={joinData.game_uid}
                        onChange={(e) => setJoinData({ ...joinData, game_uid: e.target.value })}
                        className="bg-zinc-800/50 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Game Name *</Label>
                      <Input
                        placeholder="Enter your in-game name"
                        value={joinData.game_name}
                        onChange={(e) => setJoinData({ ...joinData, game_name: e.target.value })}
                        className="bg-zinc-800/50 border-white/10"
                      />
                    </div>
                    <div className="bg-yellow-400/10 border border-yellow-400/30 p-3 text-sm rounded">
                      <p className="text-yellow-400">Entry Fee: {tournament.entry_fee} DR</p>
                      <p className="text-zinc-400">Your Balance: {user?.wallet_balance} DR</p>
                    </div>
                    <Button
                      onClick={handleJoin}
                      disabled={joining}
                      className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold"
                    >
                      {joining ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRM JOIN'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            ) : tournament.status === 'CANCELLED' ? (
              <div className="bg-red-900/20 border border-red-500/30 p-4 text-center text-red-400 rounded-lg">
                Tournament Cancelled - Entry fees refunded
              </div>
            ) : null}
          </div>
        </motion.div>

        {/* Participants List */}
        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-lg">
          <h2 className="text-lg font-bold font-['Chakra_Petch'] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-400" />
            PARTICIPANTS ({participants.length})
          </h2>
          
          {participants.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {participants.sort((a, b) => (a.slot_number || 0) - (b.slot_number || 0)).map((p) => (
                <div 
                  key={p.id}
                  className="flex items-center justify-between bg-zinc-800/50 p-3 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-yellow-400/20 text-yellow-400 flex items-center justify-center font-bold text-sm rounded">
                      #{p.slot_number || '?'}
                    </span>
                    <div>
                      <p className="font-semibold">{p.game_name}</p>
                      <p className="text-xs text-zinc-500">UID: {p.game_uid} | @{p.username}</p>
                    </div>
                  </div>
                  {p.user_id === user?.id && (
                    <span className="text-xs bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded">YOU</span>
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
