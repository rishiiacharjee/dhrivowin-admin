import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home, Trophy, Wallet, User, Gift, Ticket, 
  LogOut, Menu, X, Shield, Award 
} from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/tournaments', icon: Trophy, label: 'Matches' },
    { to: '/wallet', icon: Wallet, label: 'Wallet' },
    { to: '/lucky-draw', icon: Ticket, label: 'Lucky Draw' },
    { to: '/giveaways', icon: Gift, label: 'Giveaways' },
    { to: '/results', icon: Award, label: 'Results' },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 flex items-center justify-center">
                <span className="font-bold text-black text-lg font-['Chakra_Petch']">DW</span>
              </div>
              <span className="font-bold text-lg font-['Chakra_Petch'] hidden sm:block">
                DHRIVO <span className="text-yellow-400">WON</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-4 py-2 text-zinc-400 hover:text-yellow-400 transition-colors text-sm font-medium"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
              {user?.is_admin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </div>

            {/* User Section */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 bg-zinc-800/50 px-3 py-1.5 rounded">
                <Wallet className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-bold">{user?.wallet_balance || 0} DR</span>
              </div>
              
              <Link to="/profile" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <User className="w-5 h-5" />
                <span className="hidden sm:block text-sm">{user?.username}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                data-testid="logout-btn"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-zinc-400"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#09090B]">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800/50 rounded transition-colors"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {user?.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-yellow-400 hover:bg-zinc-800/50 rounded transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/10">
        <div className="flex items-center justify-around py-2">
          <Link to="/dashboard" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-yellow-400">
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link to="/tournaments" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-yellow-400">
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Matches</span>
          </Link>
          <Link to="/wallet" className="flex flex-col items-center gap-1 p-2 text-yellow-400">
            <div className="w-12 h-12 -mt-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-black" />
            </div>
            <span className="text-xs">Wallet</span>
          </Link>
          <Link to="/lucky-draw" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-yellow-400">
            <Ticket className="w-5 h-5" />
            <span className="text-xs">Lucky</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-yellow-400">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
