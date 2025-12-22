import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TournamentCard from '../components/TournamentCard';
import api from '../lib/api';
import { Trophy, Search, Filter, Gamepad2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    gameType: 'all',
    mode: 'all',
    search: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tournaments, filters]);

  const fetchTournaments = async () => {
    try {
      const response = await api.get('/tournaments');
      setTournaments(response.data);
    } catch (error) {
      console.error('Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tournaments];

    if (filters.status !== 'all') {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.gameType !== 'all') {
      filtered = filtered.filter(t => t.game_type === filters.gameType);
    }

    if (filters.mode !== 'all') {
      filtered = filtered.filter(t => t.mode === filters.mode);
    }

    if (filters.search) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredTournaments(filtered);
  };

  const gameTypes = ['FREE_FIRE', 'BGMI'];
  const modes = ['BR', 'CS', 'LW'];

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            <Trophy className="inline-block w-8 h-8 text-yellow-400 mr-2" />
            ALL <span className="text-yellow-400">MATCHES</span>
          </h1>
          <p className="text-zinc-400 mt-1">Find and join tournaments</p>
        </div>

        {/* Filters */}
        <div className="bg-zinc-900/50 border border-white/10 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search tournaments..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9 bg-zinc-800/50 border-white/10"
                data-testid="tournament-search-input"
              />
            </div>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
              <SelectTrigger className="bg-zinc-800/50 border-white/10" data-testid="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Game Type Filter */}
            <Select value={filters.gameType} onValueChange={(v) => setFilters({ ...filters, gameType: v })}>
              <SelectTrigger className="bg-zinc-800/50 border-white/10" data-testid="game-type-filter">
                <SelectValue placeholder="Game" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Games</SelectItem>
                {gameTypes.map(g => (
                  <SelectItem key={g} value={g}>{g.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mode Filter */}
            <Select value={filters.mode} onValueChange={(v) => setFilters({ ...filters, mode: v })}>
              <SelectTrigger className="bg-zinc-800/50 border-white/10" data-testid="mode-filter">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                {modes.map(m => (
                  <SelectItem key={m} value={m}>
                    {m === 'BR' ? 'Battle Royale' : m === 'CS' ? 'Clash Squad' : 'Lone Wolf'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Results Count */}
            <div className="flex items-center text-zinc-400">
              <Filter className="w-4 h-4 mr-2" />
              <span>{filteredTournaments.length} matches found</span>
            </div>
          </div>
        </div>

        {/* Mode Tabs */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="bg-zinc-900/50 border border-white/10 p-1 overflow-x-auto">
            <TabsTrigger 
              value="all"
              onClick={() => setFilters({ ...filters, mode: 'all' })}
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
            >
              All Modes
            </TabsTrigger>
            <TabsTrigger 
              value="BR"
              onClick={() => setFilters({ ...filters, mode: 'BR' })}
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
            >
              Battle Royale
            </TabsTrigger>
            <TabsTrigger 
              value="CS"
              onClick={() => setFilters({ ...filters, mode: 'CS' })}
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
            >
              Clash Squad
            </TabsTrigger>
            <TabsTrigger 
              value="LW"
              onClick={() => setFilters({ ...filters, mode: 'LW' })}
              className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black font-semibold"
            >
              Lone Wolf
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tournament Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 border border-white/10 h-64 animate-pulse" />
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTournaments.map((tournament) => (
              <TournamentCard key={tournament.id} tournament={tournament} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500">
            <Gamepad2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No tournaments found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tournaments;
