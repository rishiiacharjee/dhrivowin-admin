import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { 
  User, Phone, Gamepad2, Wallet, Copy, Check, 
  Edit2, Save, X, Key, CreditCard, Building
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, refreshUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    game_uid: user?.game_uid || '',
    game_name: user?.game_name || '',
    upi_id: user?.upi_id || '',
    bank_account: user?.bank_account || '',
    ifsc_code: user?.ifsc_code || ''
  });
  const [copied, setCopied] = useState({ referral: false, backup: false });
  const [saving, setSaving] = useState(false);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    toast.success('Copied to clipboard!');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', formData);
      toast.success('Profile updated successfully!');
      await refreshUser();
      setEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 py-6 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            <User className="inline-block w-8 h-8 text-yellow-400 mr-2" />
            MY <span className="text-yellow-400">PROFILE</span>
          </h1>
        </div>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-white/10 p-6 mb-6"
        >
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
            <div className="w-20 h-20 bg-yellow-400 flex items-center justify-center">
              <span className="text-3xl font-bold text-black font-['Chakra_Petch']">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              <p className="text-zinc-400 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {user?.mobile}
              </p>
              {user?.is_admin && (
                <span className="inline-block bg-yellow-400/20 text-yellow-400 text-xs px-2 py-1 mt-2 font-bold">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          {/* Balance */}
          <div className="bg-zinc-800/50 p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-zinc-400">Wallet Balance</p>
                <p className="text-2xl font-bold text-yellow-400">{user?.wallet_balance} DR</p>
              </div>
            </div>
          </div>

          {/* Referral & Backup Codes */}
          <div className="space-y-4 mb-6">
            <div className="bg-zinc-800/50 p-4">
              <p className="text-sm text-zinc-400 mb-2">Your Referral Code</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-yellow-400 font-mono text-lg">{user?.referral_code}</span>
                <button 
                  onClick={() => copyToClipboard(user?.referral_code, 'referral')}
                  className="text-zinc-400 hover:text-white"
                >
                  {copied.referral ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-zinc-500 mt-2">Share this code to earn 20 DR for each referral!</p>
            </div>

            <div className="bg-red-900/20 border border-red-500/30 p-4">
              <p className="text-sm text-red-400 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" />
                Backup Code (Keep Safe!)
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">{user?.backup_code}</span>
                <button 
                  onClick={() => copyToClipboard(user?.backup_code, 'backup')}
                  className="text-zinc-400 hover:text-white"
                >
                  {copied.backup ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-red-400/70 mt-2">Use this to recover your password</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-['Chakra_Petch']">PROFILE DETAILS</h3>
              {!editing ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditing(true)}
                  className="border-white/20"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-yellow-400 hover:bg-yellow-300 text-black"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditing(false)}
                    className="border-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                  className="bg-zinc-800/50 border-white/10 disabled:opacity-70"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Game UID
                  </Label>
                  <Input
                    value={formData.game_uid}
                    onChange={(e) => setFormData({ ...formData, game_uid: e.target.value })}
                    disabled={!editing}
                    placeholder="Your in-game UID"
                    className="bg-zinc-800/50 border-white/10 disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4" />
                    Game Name
                  </Label>
                  <Input
                    value={formData.game_name}
                    onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
                    disabled={!editing}
                    placeholder="Your in-game name"
                    className="bg-zinc-800/50 border-white/10 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  UPI ID
                </Label>
                <Input
                  value={formData.upi_id}
                  onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                  disabled={!editing}
                  placeholder="yourname@upi"
                  className="bg-zinc-800/50 border-white/10 disabled:opacity-70"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Bank Account
                  </Label>
                  <Input
                    value={formData.bank_account}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                    disabled={!editing}
                    placeholder="Account number"
                    className="bg-zinc-800/50 border-white/10 disabled:opacity-70"
                  />
                </div>
                <div className="space-y-2">
                  <Label>IFSC Code</Label>
                  <Input
                    value={formData.ifsc_code}
                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                    disabled={!editing}
                    placeholder="IFSC code"
                    className="bg-zinc-800/50 border-white/10 disabled:opacity-70"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <div className="bg-zinc-900/50 border border-white/10 p-6">
          <h3 className="font-bold font-['Chakra_Petch'] mb-4">ACCOUNT INFO</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Member Since</span>
              <span>{new Date(user?.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Account Type</span>
              <span className={user?.is_admin ? 'text-yellow-400' : ''}>
                {user?.is_admin ? 'Administrator' : 'Player'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
