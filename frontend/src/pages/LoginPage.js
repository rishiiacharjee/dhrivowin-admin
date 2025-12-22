import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await login(mobile, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-yellow-400 flex items-center justify-center transform -skew-x-12">
              <span className="font-bold text-black text-xl font-['Chakra_Petch'] transform skew-x-12">DW</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4 font-['Chakra_Petch']">
            WELCOME <span className="text-yellow-400">BACK</span>
          </h1>
          <p className="text-zinc-400 mt-2">Login to your account</p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900/50 border border-white/10 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="pl-10 bg-zinc-800/50 border-white/10 focus:border-yellow-400"
                  data-testid="login-mobile-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-zinc-800/50 border-white/10 focus:border-yellow-400"
                  data-testid="login-password-input"
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

            <div className="flex items-center justify-between text-sm">
              <Link to="/reset-password" className="text-yellow-400 hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-6"
              data-testid="login-submit-btn"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                LOGIN
              </span>
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-400 hover:underline font-semibold">
              Register Now
            </Link>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-zinc-800/30 border border-white/5 text-sm text-zinc-500">
          <p className="font-semibold text-zinc-400 mb-1">Demo Admin:</p>
          <p>Mobile: 9999999999 | Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
