import { Link } from 'react-router-dom';
import { Users, Trophy, Clock, Calendar, Gamepad2 } from 'lucide-react';
import { motion } from 'framer-motion';

const TournamentCard = ({ tournament }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-500';
      case 'ONGOING': return 'bg-green-500';
      case 'COMPLETED': return 'bg-zinc-500';
      default: return 'bg-zinc-500';
    }
  };

  const getModeIcon = (mode) => {
    return <Gamepad2 className="w-4 h-4" />;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/tournaments/${tournament.id}`}
        data-testid={`tournament-card-${tournament.id}`}
        className="block bg-zinc-900/50 border border-white/10 hover:border-yellow-400/50 transition-all overflow-hidden group"
      >
        {/* Header Image */}
        <div className="relative h-32 overflow-hidden">
          {tournament.poster_url ? (
            <img 
              src={tournament.poster_url} 
              alt={tournament.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-yellow-400/20 to-zinc-900 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-yellow-400/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
          
          {/* Status Badge */}
          <div className={`absolute top-3 right-3 ${getStatusColor(tournament.status)} px-2 py-1 text-xs font-bold uppercase`}>
            {tournament.status}
          </div>
          
          {/* Game Type Badge */}
          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur px-2 py-1 text-xs font-bold">
            {tournament.game_type}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-bold text-white truncate font-['Chakra_Petch'] text-lg">
            {tournament.title}
          </h3>

          {/* Mode Info */}
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            {getModeIcon(tournament.mode)}
            <span>{tournament.mode}</span>
            <span className="text-zinc-600">•</span>
            <span>{tournament.team_type}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-800/50 p-2 text-center">
              <div className="text-yellow-400 font-bold text-lg">{tournament.entry_fee}</div>
              <div className="text-xs text-zinc-500 uppercase">Entry (DR)</div>
            </div>
            <div className="bg-zinc-800/50 p-2 text-center">
              <div className="text-green-400 font-bold text-lg">{tournament.prize_pool}</div>
              <div className="text-xs text-zinc-500 uppercase">Prize (DR)</div>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-zinc-400">
              <Users className="w-4 h-4" />
              <span>{tournament.current_participants}/{tournament.max_participants}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>{tournament.match_date}</span>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{tournament.match_time}</span>
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-400 transition-all"
              style={{ width: `${(tournament.current_participants / tournament.max_participants) * 100}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TournamentCard;
