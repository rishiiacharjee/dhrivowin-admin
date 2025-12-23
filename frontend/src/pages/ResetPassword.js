import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import api from '../lib/api';
import { Phone, Key, Lock, Loader2, MessageSquare } from 'lucide-react';

const ResetPassword = () => {
  const [backupForm, setBackupForm] = useState({ mobile: '', backup_code: '', new_password: '' });
  const [adminForm, setAdminForm] = useState({ mobile: '', reset_code: '', new_password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleBackupReset = async (e) => {
    e.preventDefault();
    if (!backupForm.mobile || !backupForm.backup_code || !backupForm.new_password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', backupForm);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReset = async (e) => {
    e.preventDefault();
    if (!adminForm.mobile || !adminForm.reset_code || !adminForm.new_password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-admin-reset', adminForm);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="DW" className="w-16 h-16 mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold mt-4 font-['Chakra_Petch']">RESET <span className="text-yellow-400">PASSWORD</span></h1>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-lg">
          <Tabs defaultValue="backup">
            <TabsList className="w-full bg-zinc-800 mb-6">
              <TabsTrigger value="backup" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                <Key className="w-4 h-4 mr-2" />
                Backup Code
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                <MessageSquare className="w-4 h-4 mr-2" />
                Admin Code
              </TabsTrigger>
            </TabsList>

            {/* Backup Code Reset */}
            <TabsContent value="backup">
              <form onSubmit={handleBackupReset} className="space-y-4">
                <p className="text-sm text-zinc-400 mb-4">
                  Registration ke time mila hua backup code use karein
                </p>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      placeholder="Enter mobile number" 
                      value={backupForm.mobile} 
                      onChange={(e) => setBackupForm({ ...backupForm, mobile: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-white/10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Backup Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      placeholder="Enter backup code" 
                      value={backupForm.backup_code} 
                      onChange={(e) => setBackupForm({ ...backupForm, backup_code: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-white/10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      type="password" 
                      placeholder="Enter new password" 
                      value={backupForm.new_password} 
                      onChange={(e) => setBackupForm({ ...backupForm, new_password: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-white/10" 
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5">
                  {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                  RESET PASSWORD
                </Button>
              </form>
            </TabsContent>

            {/* Admin Code Reset */}
            <TabsContent value="admin">
              <form onSubmit={handleAdminReset} className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded mb-4">
                  <p className="text-sm text-blue-400">
                    ⚠️ Backup code bhul gaye? Admin se WhatsApp pe code lein aur yahan enter karein.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      placeholder="Enter mobile number" 
                      value={adminForm.mobile} 
                      onChange={(e) => setAdminForm({ ...adminForm, mobile: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-white/10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Admin Reset Code</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      placeholder="Code from admin" 
                      value={adminForm.reset_code} 
                      onChange={(e) => setAdminForm({ ...adminForm, reset_code: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-white/10" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input 
                      type="password" 
                      placeholder="Enter new password" 
                      value={adminForm.new_password} 
                      onChange={(e) => setAdminForm({ ...adminForm, new_password: e.target.value })}
                      className="pl-10 bg-zinc-800/50 border-white/10" 
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-5">
                  {loading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
                  RESET PASSWORD
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Remember password? <Link to="/login" className="text-yellow-400 hover:underline font-semibold">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
