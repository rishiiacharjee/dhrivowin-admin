import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import api from '../lib/api';
import { Phone, Key, Lock, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [formData, setFormData] = useState({ mobile: '', backup_code: '', new_password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.mobile || !formData.backup_code || !formData.new_password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', formData);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center transform -skew-x-12">
              <span className="font-bold text-black text-xl font-['Chakra_Petch'] transform skew-x-12">DW</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4 font-['Chakra_Petch']">RESET <span className="text-yellow-400">PASSWORD</span></h1>
          <p className="text-zinc-400 mt-2">Use your backup code to reset</p>
        </div>
        <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input placeholder="Enter mobile number" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="pl-10 bg-zinc-800/50 border-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Backup Code</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input placeholder="Enter backup code" value={formData.backup_code} onChange={(e) => setFormData({ ...formData, backup_code: e.target.value })}
                  className="pl-10 bg-zinc-800/50 border-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input type="password" placeholder="Enter new password" value={formData.new_password} onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="pl-10 bg-zinc-800/50 border-white/10" />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6">
              <span className="flex items-center justify-center gap-2">{loading && <Loader2 className="w-5 h-5 animate-spin" />}RESET PASSWORD</span>
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-zinc-400">
            Remember password? <Link to="/login" className="text-yellow-400 hover:underline font-semibold">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
