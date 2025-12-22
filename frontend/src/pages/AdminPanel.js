import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Shield, Plus, Users, Trophy, Wallet, Newspaper, Gift, Ticket, Loader2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const AdminPanel = () => {
  const [stats, setStats] = useState({});
  const [tournaments, setTournaments] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [news, setNews] = useState([]);
  const [giveaways, setGiveaways] = useState([]);
  const [luckyDraws, setLuckyDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentForm, setTournamentForm] = useState({ title: '', game_type: 'FREE_FIRE', mode: 'BR', team_type: 'SOLO', entry_fee: 10, prize_pool: 100, per_kill_reward: 0, max_participants: 50, match_time: '', match_date: '', description: '', room_id: '', room_password: '' });
  const [newsForm, setNewsForm] = useState({ title: '', content: '' });
  const [giveawayForm, setGiveawayForm] = useState({ title: '', description: '', prize: '', end_date: '', image_url: '', external_link: '' });
  const [luckyDrawForm, setLuckyDrawForm] = useState({ title: '', entry_cost: 10, prize_amount: 100, max_entries: 50, end_date: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [statsRes, tournamentsRes, usersRes, withdrawalsRes, newsRes, giveawaysRes, luckyDrawsRes] = await Promise.all([
        api.get('/admin/stats'), api.get('/tournaments'), api.get('/admin/users'), api.get('/admin/withdrawals'),
        api.get('/news'), api.get('/giveaways'), api.get('/lucky-draws')
      ]);
      setStats(statsRes.data); setTournaments(tournamentsRes.data); setUsers(usersRes.data);
      setWithdrawals(withdrawalsRes.data); setNews(newsRes.data); setGiveaways(giveawaysRes.data); setLuckyDraws(luckyDrawsRes.data);
    } catch (error) { console.error('Failed to fetch data'); } finally { setLoading(false); }
  };

  const createTournament = async () => {
    try {
      await api.post('/tournaments', tournamentForm);
      toast.success('Tournament created!'); fetchAll();
      setTournamentForm({ title: '', game_type: 'FREE_FIRE', mode: 'BR', team_type: 'SOLO', entry_fee: 10, prize_pool: 100, per_kill_reward: 0, max_participants: 50, match_time: '', match_date: '', description: '', room_id: '', room_password: '' });
    } catch (error) { toast.error('Failed to create tournament'); }
  };

  const createNews = async () => {
    try { await api.post('/news', newsForm); toast.success('News added!'); fetchAll(); setNewsForm({ title: '', content: '' }); }
    catch (error) { toast.error('Failed to add news'); }
  };

  const createGiveaway = async () => {
    try { await api.post('/giveaways', giveawayForm); toast.success('Giveaway created!'); fetchAll(); }
    catch (error) { toast.error('Failed to create giveaway'); }
  };

  const createLuckyDraw = async () => {
    try { await api.post('/lucky-draws', luckyDrawForm); toast.success('Lucky draw created!'); fetchAll(); }
    catch (error) { toast.error('Failed to create lucky draw'); }
  };

  const handleWithdrawal = async (id, action) => {
    try { await api.post(`/admin/withdrawals/${id}/${action}`); toast.success(`Withdrawal ${action}d`); fetchAll(); }
    catch (error) { toast.error('Action failed'); }
  };

  const updateTournamentStatus = async (id, status) => {
    try { await api.put(`/tournaments/${id}`, { status }); toast.success('Status updated'); fetchAll(); }
    catch (error) { toast.error('Update failed'); }
  };

  const deleteTournament = async (id) => {
    try { await api.delete(`/tournaments/${id}`); toast.success('Deleted'); fetchAll(); }
    catch (error) { toast.error('Delete failed'); }
  };

  if (loading) return <div className="min-h-screen bg-[#09090B] flex items-center justify-center"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 pt-20">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            <Shield className="inline-block w-8 h-8 text-yellow-400 mr-2" />ADMIN <span className="text-yellow-400">PANEL</span>
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-zinc-900/50 border border-white/10 p-4"><Users className="w-6 h-6 text-blue-400 mb-2" /><p className="text-2xl font-bold">{stats.total_users}</p><p className="text-xs text-zinc-500">Users</p></div>
          <div className="bg-zinc-900/50 border border-white/10 p-4"><Trophy className="w-6 h-6 text-yellow-400 mb-2" /><p className="text-2xl font-bold">{stats.total_tournaments}</p><p className="text-xs text-zinc-500">Tournaments</p></div>
          <div className="bg-zinc-900/50 border border-white/10 p-4"><Trophy className="w-6 h-6 text-green-400 mb-2" /><p className="text-2xl font-bold">{stats.active_tournaments}</p><p className="text-xs text-zinc-500">Active</p></div>
          <div className="bg-zinc-900/50 border border-white/10 p-4"><Wallet className="w-6 h-6 text-purple-400 mb-2" /><p className="text-2xl font-bold">{stats.total_transactions}</p><p className="text-xs text-zinc-500">Transactions</p></div>
        </div>

        <Tabs defaultValue="tournaments">
          <TabsList className="bg-zinc-900/50 border border-white/10 p-1 mb-6 overflow-x-auto">
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">Tournaments</TabsTrigger>
            <TabsTrigger value="withdrawals" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">Withdrawals</TabsTrigger>
            <TabsTrigger value="news" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">News</TabsTrigger>
            <TabsTrigger value="giveaways" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">Giveaways</TabsTrigger>
            <TabsTrigger value="lucky" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">Lucky Draw</TabsTrigger>
          </TabsList>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments">
            <div className="bg-zinc-900/50 border border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Manage Tournaments</h2>
                <Dialog>
                  <DialogTrigger asChild><Button className="bg-yellow-400 hover:bg-yellow-300 text-black"><Plus className="w-4 h-4 mr-2" />Add Tournament</Button></DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Create Tournament</DialogTitle></DialogHeader>
                    <div className="grid gap-4 mt-4">
                      <Input placeholder="Title" value={tournamentForm.title} onChange={(e) => setTournamentForm({...tournamentForm, title: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <div className="grid grid-cols-3 gap-4">
                        <Select value={tournamentForm.game_type} onValueChange={(v) => setTournamentForm({...tournamentForm, game_type: v})}>
                          <SelectTrigger className="bg-zinc-800/50 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="FREE_FIRE">Free Fire</SelectItem><SelectItem value="BGMI">BGMI</SelectItem></SelectContent>
                        </Select>
                        <Select value={tournamentForm.mode} onValueChange={(v) => setTournamentForm({...tournamentForm, mode: v})}>
                          <SelectTrigger className="bg-zinc-800/50 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="BR">Battle Royale</SelectItem><SelectItem value="CS">Clash Squad</SelectItem><SelectItem value="LW">Lone Wolf</SelectItem></SelectContent>
                        </Select>
                        <Select value={tournamentForm.team_type} onValueChange={(v) => setTournamentForm({...tournamentForm, team_type: v})}>
                          <SelectTrigger className="bg-zinc-800/50 border-white/10"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="SOLO">Solo</SelectItem><SelectItem value="DUO">Duo</SelectItem><SelectItem value="SQUAD">Squad</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <Input type="number" placeholder="Entry Fee" value={tournamentForm.entry_fee} onChange={(e) => setTournamentForm({...tournamentForm, entry_fee: parseInt(e.target.value)})} className="bg-zinc-800/50 border-white/10" />
                        <Input type="number" placeholder="Prize Pool" value={tournamentForm.prize_pool} onChange={(e) => setTournamentForm({...tournamentForm, prize_pool: parseInt(e.target.value)})} className="bg-zinc-800/50 border-white/10" />
                        <Input type="number" placeholder="Max Players" value={tournamentForm.max_participants} onChange={(e) => setTournamentForm({...tournamentForm, max_participants: parseInt(e.target.value)})} className="bg-zinc-800/50 border-white/10" />
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 p-3">
                        <Label className="text-red-400 font-bold text-sm mb-2 block">💀 PER KILL REWARD (DR)</Label>
                        <Input type="number" placeholder="Per Kill Money (0 = disabled)" value={tournamentForm.per_kill_reward} onChange={(e) => setTournamentForm({...tournamentForm, per_kill_reward: parseInt(e.target.value) || 0})} className="bg-zinc-800/50 border-red-500/30" />
                        <p className="text-xs text-zinc-500 mt-1">Set 0 to disable per kill rewards</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="date" value={tournamentForm.match_date} onChange={(e) => setTournamentForm({...tournamentForm, match_date: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                        <Input type="time" value={tournamentForm.match_time} onChange={(e) => setTournamentForm({...tournamentForm, match_time: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Room ID" value={tournamentForm.room_id} onChange={(e) => setTournamentForm({...tournamentForm, room_id: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                        <Input placeholder="Room Password" value={tournamentForm.room_password} onChange={(e) => setTournamentForm({...tournamentForm, room_password: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      </div>
                      <Textarea placeholder="Description" value={tournamentForm.description} onChange={(e) => setTournamentForm({...tournamentForm, description: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <Button onClick={createTournament} className="bg-yellow-400 hover:bg-yellow-300 text-black">Create Tournament</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tournaments.map((t) => (
                  <div key={t.id} className="flex items-center justify-between bg-zinc-800/50 p-3">
                    <div>
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-xs text-zinc-500">{t.game_type} • {t.mode} • {t.team_type} • {t.current_participants}/{t.max_participants}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={t.status} onValueChange={(v) => updateTournamentStatus(t.id, v)}>
                        <SelectTrigger className="w-32 bg-zinc-700 border-white/10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="UPCOMING">Upcoming</SelectItem><SelectItem value="ONGOING">Ongoing</SelectItem><SelectItem value="COMPLETED">Completed</SelectItem></SelectContent>
                      </Select>
                      <Button size="sm" variant="destructive" onClick={() => deleteTournament(t.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            <div className="bg-zinc-900/50 border border-white/10 p-6">
              <h2 className="font-bold mb-4">Pending Withdrawals</h2>
              {withdrawals.length > 0 ? (
                <div className="space-y-2">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between bg-zinc-800/50 p-3">
                      <div>
                        <p className="font-semibold">{w.amount} DR</p>
                        <p className="text-xs text-zinc-500">{w.upi_id || `${w.bank_account} (${w.ifsc_code})`}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleWithdrawal(w.id, 'approve')} className="bg-green-500 hover:bg-green-400"><CheckCircle className="w-4 h-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleWithdrawal(w.id, 'reject')}><XCircle className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-zinc-500 text-center py-8">No pending withdrawals</p>}
            </div>
          </TabsContent>

          {/* News Tab */}
          <TabsContent value="news">
            <div className="bg-zinc-900/50 border border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">News Ticker</h2>
                <Dialog>
                  <DialogTrigger asChild><Button className="bg-yellow-400 hover:bg-yellow-300 text-black"><Plus className="w-4 h-4 mr-2" />Add News</Button></DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader><DialogTitle>Add News</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input placeholder="Title" value={newsForm.title} onChange={(e) => setNewsForm({...newsForm, title: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <Textarea placeholder="Content" value={newsForm.content} onChange={(e) => setNewsForm({...newsForm, content: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <Button onClick={createNews} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black">Add News</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {news.map((n) => (
                  <div key={n.id} className="flex items-center justify-between bg-zinc-800/50 p-3">
                    <p>{n.title}</p>
                    <Button size="sm" variant="destructive" onClick={async () => { await api.delete(`/news/${n.id}`); fetchAll(); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Giveaways Tab */}
          <TabsContent value="giveaways">
            <div className="bg-zinc-900/50 border border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Giveaways</h2>
                <Dialog>
                  <DialogTrigger asChild><Button className="bg-yellow-400 hover:bg-yellow-300 text-black"><Plus className="w-4 h-4 mr-2" />Add Giveaway</Button></DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader><DialogTitle>Create Giveaway</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input placeholder="Title" value={giveawayForm.title} onChange={(e) => setGiveawayForm({...giveawayForm, title: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <Input placeholder="Prize" value={giveawayForm.prize} onChange={(e) => setGiveawayForm({...giveawayForm, prize: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <Input type="date" value={giveawayForm.end_date} onChange={(e) => setGiveawayForm({...giveawayForm, end_date: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <Textarea placeholder="Description" value={giveawayForm.description} onChange={(e) => setGiveawayForm({...giveawayForm, description: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <Button onClick={createGiveaway} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black">Create Giveaway</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {giveaways.map((g) => (
                  <div key={g.id} className="flex items-center justify-between bg-zinc-800/50 p-3">
                    <div><p className="font-semibold">{g.title}</p><p className="text-xs text-zinc-500">{g.prize} • {g.participants?.length || 0} participants</p></div>
                    <Button size="sm" variant="destructive" onClick={async () => { await api.delete(`/giveaways/${g.id}`); fetchAll(); }}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Lucky Draw Tab */}
          <TabsContent value="lucky">
            <div className="bg-zinc-900/50 border border-white/10 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold">Lucky Draws</h2>
                <Dialog>
                  <DialogTrigger asChild><Button className="bg-yellow-400 hover:bg-yellow-300 text-black"><Plus className="w-4 h-4 mr-2" />Add Lucky Draw</Button></DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-white/10">
                    <DialogHeader><DialogTitle>Create Lucky Draw</DialogTitle></DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input placeholder="Title" value={luckyDrawForm.title} onChange={(e) => setLuckyDrawForm({...luckyDrawForm, title: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" placeholder="Entry Cost" value={luckyDrawForm.entry_cost} onChange={(e) => setLuckyDrawForm({...luckyDrawForm, entry_cost: parseInt(e.target.value)})} className="bg-zinc-800/50 border-white/10" />
                        <Input type="number" placeholder="Prize Amount" value={luckyDrawForm.prize_amount} onChange={(e) => setLuckyDrawForm({...luckyDrawForm, prize_amount: parseInt(e.target.value)})} className="bg-zinc-800/50 border-white/10" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" placeholder="Max Entries" value={luckyDrawForm.max_entries} onChange={(e) => setLuckyDrawForm({...luckyDrawForm, max_entries: parseInt(e.target.value)})} className="bg-zinc-800/50 border-white/10" />
                        <Input type="date" value={luckyDrawForm.end_date} onChange={(e) => setLuckyDrawForm({...luckyDrawForm, end_date: e.target.value})} className="bg-zinc-800/50 border-white/10" />
                      </div>
                      <Button onClick={createLuckyDraw} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black">Create Lucky Draw</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {luckyDraws.map((d) => (
                  <div key={d.id} className="flex items-center justify-between bg-zinc-800/50 p-3">
                    <div><p className="font-semibold">{d.title}</p><p className="text-xs text-zinc-500">{d.entry_cost} DR entry • {d.prize_amount} DR prize • {d.current_entries}/{d.max_entries}</p></div>
                    <div className="flex gap-2">
                      {d.status === 'ACTIVE' && <Button size="sm" onClick={async () => { await api.post(`/lucky-draws/${d.id}/pick-winner`); fetchAll(); toast.success('Winner picked!'); }} className="bg-purple-500 hover:bg-purple-400">Pick Winner</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
