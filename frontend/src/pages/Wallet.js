import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { 
  Wallet, Plus, ArrowDownToLine, ArrowUpFromLine, 
  Clock, CheckCircle, XCircle, Loader2, CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';

const RAZORPAY_KEY = 'rzp_test_RugX0n4GoBXMdm';

const WalletPage = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [withdrawData, setWithdrawData] = useState({ amount: '', upi_id: '', bank_account: '', ifsc_code: '' });
  const [processing, setProcessing] = useState(false);
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const rechargeOptions = [15, 30, 40, 50, 100, 150, 200, 300, 500];
  const withdrawOptions = [30, 50, 80, 100, 150, 200];

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRecharge = async () => {
    const amount = parseInt(rechargeAmount);
    if (!amount || amount < 15) {
      toast.error('Minimum recharge amount is 15 DR');
      return;
    }

    setProcessing(true);
    try {
      // Load Razorpay
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Create order
      const orderResponse = await api.post('/wallet/create-order', { amount });
      const { order_id, amount: orderAmount, currency } = orderResponse.data;

      // Open Razorpay
      const options = {
        key: RAZORPAY_KEY,
        amount: orderAmount,
        currency,
        order_id,
        name: 'DHRIVO WON',
        description: `Recharge ${amount} DR`,
        handler: async (response) => {
          try {
            await api.post('/wallet/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            toast.success(`Successfully recharged ${amount} DR!`);
            await refreshUser();
            fetchTransactions();
            setRechargeDialogOpen(false);
            setRechargeAmount('');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          contact: user?.mobile
        },
        theme: {
          color: '#FACC15'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to process recharge');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawData.amount);
    if (!amount || amount < 30) {
      toast.error('Minimum withdrawal amount is 30 DR');
      return;
    }

    if (!withdrawData.upi_id && !(withdrawData.bank_account && withdrawData.ifsc_code)) {
      toast.error('Please provide UPI ID or Bank details');
      return;
    }

    if (amount > user?.wallet_balance) {
      toast.error('Insufficient balance');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/wallet/withdraw', {
        amount,
        upi_id: withdrawData.upi_id || undefined,
        bank_account: withdrawData.bank_account || undefined,
        ifsc_code: withdrawData.ifsc_code || undefined
      });
      toast.success('Withdrawal request submitted! Processing in 5-10 minutes.');
      await refreshUser();
      fetchTransactions();
      setWithdrawDialogOpen(false);
      setWithdrawData({ amount: '', upi_id: '', bank_account: '', ifsc_code: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] pb-20 md:pb-8">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-6 pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold font-['Chakra_Petch']">
            <Wallet className="inline-block w-8 h-8 text-yellow-400 mr-2" />
            MY <span className="text-yellow-400">WALLET</span>
          </h1>
        </div>

        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-400/20 to-zinc-900 border border-yellow-400/30 p-6 sm:p-8 mb-6"
        >
          <p className="text-zinc-400 mb-2">Available Balance</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-5xl sm:text-6xl font-bold text-yellow-400 font-['Chakra_Petch']">
              {user?.wallet_balance || 0}
            </span>
            <span className="text-xl text-zinc-400">DR</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recharge Dialog */}
            <Dialog open={rechargeDialogOpen} onOpenChange={setRechargeDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex-1 turbo-btn bg-yellow-400 hover:bg-yellow-300 text-black font-bold" data-testid="recharge-btn">
                  <span className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    RECHARGE
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-['Chakra_Petch'] flex items-center gap-2">
                    <ArrowDownToLine className="w-5 h-5 text-green-400" />
                    RECHARGE WALLET
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-3">
                    {rechargeOptions.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setRechargeAmount(amt.toString())}
                        className={`p-4 border text-center font-bold transition-all transform hover:scale-105
                          ${rechargeAmount === amt.toString() 
                            ? 'bg-yellow-400 border-yellow-400 text-black scale-105' 
                            : 'bg-zinc-800/50 border-white/10 hover:border-yellow-400/50'}`}
                      >
                        <span className="text-xl">{amt}</span>
                        <span className="block text-xs opacity-70">DR</span>
                      </button>
                    ))}
                  </div>
                  <div className="bg-zinc-800/50 p-3 text-sm">
                    <p className="text-zinc-400">Amount to Pay: ₹{rechargeAmount || 0}</p>
                    <p className="text-yellow-400">DR Coins: {rechargeAmount || 0}</p>
                  </div>
                  <Button
                    onClick={handleRecharge}
                    disabled={processing || !rechargeAmount}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-bold"
                    data-testid="confirm-recharge-btn"
                  >
                    {processing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        PAY ₹{rechargeAmount || 0}
                      </span>
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1 turbo-btn border-white/20 hover:border-yellow-400" data-testid="withdraw-btn">
                  <span className="flex items-center gap-2">
                    <ArrowUpFromLine className="w-5 h-5" />
                    WITHDRAW
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-['Chakra_Petch'] flex items-center gap-2">
                    <ArrowUpFromLine className="w-5 h-5 text-red-400" />
                    WITHDRAW FUNDS
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {withdrawOptions.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawData({ ...withdrawData, amount: amt.toString() })}
                        className={`p-3 border text-center font-bold transition-colors
                          ${withdrawData.amount === amt.toString() 
                            ? 'bg-yellow-400 border-yellow-400 text-black' 
                            : 'bg-zinc-800/50 border-white/10 hover:border-yellow-400/50'}`}
                      >
                        {amt} DR
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Custom Amount</Label>
                    <Input
                      type="number"
                      placeholder="Enter amount (min 30)"
                      value={withdrawData.amount}
                      onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                      className="bg-zinc-800/50 border-white/10"
                      data-testid="withdraw-amount-input"
                    />
                  </div>
                  
                  <Tabs defaultValue="upi">
                    <TabsList className="bg-zinc-800 w-full">
                      <TabsTrigger value="upi" className="flex-1">UPI</TabsTrigger>
                      <TabsTrigger value="bank" className="flex-1">Bank</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upi" className="space-y-2 mt-4">
                      <Label>UPI ID *</Label>
                      <Input
                        placeholder="yourname@upi"
                        value={withdrawData.upi_id}
                        onChange={(e) => setWithdrawData({ ...withdrawData, upi_id: e.target.value })}
                        className="bg-zinc-800/50 border-white/10"
                        data-testid="upi-id-input"
                      />
                    </TabsContent>
                    <TabsContent value="bank" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label>Account Number *</Label>
                        <Input
                          placeholder="Enter account number"
                          value={withdrawData.bank_account}
                          onChange={(e) => setWithdrawData({ ...withdrawData, bank_account: e.target.value })}
                          className="bg-zinc-800/50 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>IFSC Code *</Label>
                        <Input
                          placeholder="Enter IFSC code"
                          value={withdrawData.ifsc_code}
                          onChange={(e) => setWithdrawData({ ...withdrawData, ifsc_code: e.target.value })}
                          className="bg-zinc-800/50 border-white/10"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="bg-zinc-800/50 p-3 text-sm">
                    <p className="text-zinc-400">Your Balance: {user?.wallet_balance} DR</p>
                    <p className="text-yellow-400">Processing Time: 5-10 minutes</p>
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={processing || !withdrawData.amount}
                    className="w-full bg-red-500 hover:bg-red-400 text-white font-bold"
                    data-testid="confirm-withdraw-btn"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'WITHDRAW'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Transaction History */}
        <div className="bg-zinc-900/50 border border-white/10 p-6">
          <h2 className="text-lg font-bold font-['Chakra_Petch'] mb-4">TRANSACTION HISTORY</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div 
                  key={tx.id}
                  className="flex items-center justify-between bg-zinc-800/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    {tx.type === 'DEPOSIT' ? (
                      <ArrowDownToLine className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowUpFromLine className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {tx.type === 'DEPOSIT' ? 'Recharge' : 'Withdrawal'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount} DR
                    </p>
                    <div className="flex items-center gap-1 text-xs">
                      {getStatusIcon(tx.status)}
                      <span className="text-zinc-400">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-8">No transactions yet</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default WalletPage;
