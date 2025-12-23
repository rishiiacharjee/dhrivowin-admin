import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Phone, Lock, Eye, EyeOff, User, Gift, Loader2, Copy, Check, Mail } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    referral_code: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [copied, setCopied] = useState({ referral: false, backup: false });
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.mobile || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userData = await register({
        username: formData.username,
        mobile: formData.mobile,
        email: formData.email || undefined,
        password: formData.password,
        referral_code: formData.referral_code || undefined
      });
      toast.success('Registration successful!');
      setRegisteredUser(userData);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => setCopied({ ...copied, [type]: false }), 2000);
    toast.success('Copied to clipboard!');
  };

  if (registeredUser) {
    return (
      <div className="min-h-screen bg-[#09090B] grid-bg flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            
            <h2 className="text-2xl font-bold font-['Chakra_Petch'] mb-2">
              WELCOME TO <span className="text-yellow-400">DHRIVO WON!</span>
            </h2>
            <p className="text-zinc-400 mb-6">Your account has been created successfully</p>

            {/* Important Codes */}
            <div className="space-y-4 mb-6">
              <div className="bg-zinc-800/50 p-4 border border-white/10">
                <p className="text-sm text-zinc-400 mb-2">Your Referral Code (Share to earn DR)</p>
                <div className="flex items-center justify-between bg-zinc-900 p-3">
                  <span className="font-bold text-yellow-400 font-mono text-lg">{registeredUser.referral_code}</span>
                  <button 
                    onClick={() => copyToClipboard(registeredUser.referral_code, 'referral')}
                    className="text-zinc-400 hover:text-white"
                  >
                    {copied.referral ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-red-900/20 p-4 border border-red-500/30">
                <p className="text-sm text-red-400 mb-2">⚠️ Backup Code (Save this! For password recovery)</p>
                <div className="flex items-center justify-between bg-zinc-900 p-3">
                  <span className="font-bold text-white font-mono">{registeredUser.backup_code}</span>
                  <button 
                    onClick={() => copyToClipboard(registeredUser.backup_code, 'backup')}
                    className="text-zinc-400 hover:text-white"
                  >
                    {copied.backup ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6"
              data-testid="continue-to-dashboard-btn"
            >
              <span>CONTINUE TO DASHBOARD</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] grid-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center transform -skew-x-12">
              <span className="font-bold text-black text-xl font-['Chakra_Petch'] transform skew-x-12">DW</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4 font-['Chakra_Petch']">
            JOIN <span className="text-yellow-400">DHRIVO WON</span>
          </h1>
          <p className="text-zinc-400 mt-2">Create your gaming account</p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-800/50 border-white/10 focus:border-yellow-400"
                  data-testid="register-name-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-800/50 border-white/10 focus:border-yellow-400"
                  data-testid="register-mobile-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-zinc-800/50 border-white/10 focus:border-yellow-400"
                  data-testid="register-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-800/50 border-white/10 focus:border-yellow-400"
                  data-testid="register-confirm-password-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral_code">Referral Code (Optional)</Label>
              <div className="relative">
                <Gift className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="referral_code"
                  name="referral_code"
                  type="text"
                  placeholder="Enter referral code"
                  value={formData.referral_code}
                  onChange={handleChange}
                  className="pl-10 bg-zinc-800/50 border-white/10 focus:border-yellow-400"
                  data-testid="register-referral-input"
                />
              </div>
              <p className="text-xs text-zinc-500">Get 10 DR bonus with valid referral code!</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6"
              data-testid="register-submit-btn"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                CREATE ACCOUNT
              </span>
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:underline font-semibold">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
