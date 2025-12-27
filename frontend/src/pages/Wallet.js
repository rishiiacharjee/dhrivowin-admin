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
  Clock, CheckCircle, XCircle, Loader2, QrCode, Smartphone, Copy
} from 'lucide-react';
import { motion } from 'framer-motion';

const rechargeOptions = [15, 30, 50, 100, 150, 200, 300, 500];
const withdrawOptions = [30, 50, 100, 150, 200, 300, 500];

const WalletPage = () => {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [userUpiId, setUserUpiId] = useState('');
  const [withdrawData, setWithdrawData] = useState({ amount: '', upi_id: '', bank_account: '', ifsc_code: '', account_holder_name: '' });
  const [processing, setProcessing] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, settingsRes] = await Promise.all([
        api.get('/wallet/transactions'),
        api.get('/settings')
      ]);
      setTransactions(txRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (!amount || amount < 15) {
      toast.error('Minimum deposit is 15 DR');
      return;
    }
    if (!userUpiId && !showQR) {
      toast.error('Please enter your UPI ID');
      return;
    }

    setProcessing(true);
    try {
      await api.post('/wallet/deposit-request', {
        amount,
        user_upi_id: userUpiId,
        payment_method: showQR ? 'QR' : 'UPI'
      });
      toast.success('Deposit request submitted! Admin will send payment request to your UPI.');
      setDepositDialogOpen(false);
      setDepositAmount('');
      setUserUpiId('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit request');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawData.amount);
    if (!amount || amount < 30) {
      toast.error('Minimum withdrawal is 30 DR');
      return;
    }
    if (!withdrawData.account_holder_name) {
      toast.error('Account holder name is required');
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
        ifsc_code: withdrawData.ifsc_code || undefined,
        account_holder_name: withdrawData.account_holder_name
      });
      toast.success('Withdrawal request submitted!');
      await refreshUser();
      fetchData();
      setWithdrawDialogOpen(false);
      setWithdrawData({ amount: '', upi_id: '', bank_account: '', ifsc_code: '', account_holder_name: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  };

  const copyUPI = () => {
    if (settings?.admin_upi_id) {
      navigator.clipboard.writeText(settings.admin_upi_id);
      toast.success('UPI ID copied!');
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
    <div className="min-h-screen bg-[#0a1628] pb-24">
      <Navbar />
      
      <main className="max-w-lg mx-auto px-4 py-6 pt-20">
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-6"
        >
          <p className="text-zinc-400 text-sm mb-1">Available Balance</p>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-bold text-yellow-400">{user?.wallet_balance || 0}</span>
            <span className="text-lg text-zinc-400">DR</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Deposit Dialog */}
            <Dialog open={depositDialogOpen} onOpenChange={setDepositDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-500 hover:bg-green-400 text-white font-bold py-5 rounded-xl">
                  <Plus className="w-5 h-5 mr-2" />
                  ADD MONEY
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a1628] border-zinc-700 max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-yellow-400">Add Money to Wallet</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Amount Selection */}
                  <div>
                    <Label className="text-sm text-zinc-400">Select Amount (DR)</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {rechargeOptions.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setDepositAmount(amt.toString())}
                          className={`p-3 rounded-lg font-bold transition-all ${
                            depositAmount === amt.toString() 
                              ? 'bg-yellow-400 text-black' 
                              : 'bg-zinc-800 hover:bg-zinc-700'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Tabs */}
                  <Tabs defaultValue="upi" onValueChange={(v) => setShowQR(v === 'qr')}>
                    <TabsList className="w-full bg-zinc-800">
                      <TabsTrigger value="upi" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                        <Smartphone className="w-4 h-4 mr-2" />
                        UPI
                      </TabsTrigger>
                      <TabsTrigger value="qr" className="flex-1 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
                        <QrCode className="w-4 h-4 mr-2" />
                        QR Code
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upi" className="mt-4 space-y-4">
                      <div>
                        <Label>Your UPI ID</Label>
                        <Input
                          placeholder="yourname@paytm / yourname@upi"
                          value={userUpiId}
                          onChange={(e) => setUserUpiId(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 mt-1"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Admin will send payment request to this UPI</p>
                      </div>
                    </TabsContent>

                    <TabsContent value="qr" className="mt-4 space-y-4">
                      {settings?.qr_code_url ? (
                        <div className="text-center">
                          <img src={settings.qr_code_url} alt="Payment QR" className="w-48 h-48 mx-auto bg-white p-2 rounded-lg" />
                          <p className="text-sm text-zinc-400 mt-2">Scan & Pay ₹{depositAmount || '0'}</p>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-zinc-500">
                          <QrCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>QR Code not available</p>
                        </div>
                      )}
                      
                      {settings?.admin_upi_id && (
                        <div className="bg-zinc-800 p-3 rounded-lg">
                          <p className="text-xs text-zinc-400 mb-1">Or pay to UPI ID:</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-yellow-400">{settings.admin_upi_id}</span>
                            <button onClick={copyUPI} className="text-zinc-400 hover:text-white">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>

                  <div className="bg-zinc-800/50 p-3 rounded-lg text-sm">
                    <p className="text-zinc-400">Amount: <span className="text-white font-bold">₹{depositAmount || 0}</span></p>
                    <p className="text-zinc-400">You'll get: <span className="text-yellow-400 font-bold">{depositAmount || 0} DR</span></p>
                  </div>

                  <Button
                    onClick={handleDeposit}
                    disabled={processing || !depositAmount}
                    className="w-full bg-green-500 hover:bg-green-400 text-white font-bold py-5 rounded-xl"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SUBMIT REQUEST'}
                  </Button>

                  <p className="text-xs text-zinc-500 text-center">
                    After submitting, admin will send payment request. Once paid, coins will be credited.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Withdraw Dialog */}
            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-zinc-600 hover:bg-zinc-800 font-bold py-5 rounded-xl">
                  <ArrowUpFromLine className="w-5 h-5 mr-2" />
                  WITHDRAW
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a1628] border-zinc-700 max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-yellow-400">Withdraw Money</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {/* Amount Selection */}
                  <div>
                    <Label className="text-sm text-zinc-400">Select Amount (DR)</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {withdrawOptions.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setWithdrawData({ ...withdrawData, amount: amt.toString() })}
                          className={`p-3 rounded-lg font-bold transition-all ${
                            withdrawData.amount === amt.toString() 
                              ? 'bg-yellow-400 text-black' 
                              : 'bg-zinc-800 hover:bg-zinc-700'
                          }`}
                        >
                          {amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Account Holder Name *</Label>
                    <Input
                      placeholder="Name as per bank/UPI"
                      value={withdrawData.account_holder_name}
                      onChange={(e) => setWithdrawData({ ...withdrawData, account_holder_name: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 mt-1"
                    />
                  </div>

                  <Tabs defaultValue="upi">
                    <TabsList className="w-full bg-zinc-800">
                      <TabsTrigger value="upi" className="flex-1">UPI</TabsTrigger>
                      <TabsTrigger value="bank" className="flex-1">Bank</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upi" className="mt-4">
                      <Label>UPI ID *</Label>
                      <Input
                        placeholder="yourname@upi"
                        value={withdrawData.upi_id}
                        onChange={(e) => setWithdrawData({ ...withdrawData, upi_id: e.target.value })}
                        className="bg-zinc-800 border-zinc-700 mt-1"
                      />
                    </TabsContent>
                    <TabsContent value="bank" className="mt-4 space-y-3">
                      <div>
                        <Label>Account Number *</Label>
                        <Input
                          placeholder="Account number"
                          value={withdrawData.bank_account}
                          onChange={(e) => setWithdrawData({ ...withdrawData, bank_account: e.target.value })}
                          className="bg-zinc-800 border-zinc-700 mt-1"
                        />
                      </div>
                      <div>
                        <Label>IFSC Code *</Label>
                        <Input
                          placeholder="IFSC code"
                          value={withdrawData.ifsc_code}
                          onChange={(e) => setWithdrawData({ ...withdrawData, ifsc_code: e.target.value })}
                          className="bg-zinc-800 border-zinc-700 mt-1"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="bg-zinc-800/50 p-3 rounded-lg text-sm">
                    <p className="text-zinc-400">Your Balance: <span className="text-yellow-400 font-bold">{user?.wallet_balance} DR</span></p>
                    <p className="text-zinc-400">Withdraw: <span className="text-white font-bold">{withdrawData.amount || 0} DR</span></p>
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    disabled={processing || !withdrawData.amount}
                    className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-5 rounded-xl"
                  >
                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'WITHDRAW'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Transaction History */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
          <h2 className="font-bold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-400" />
            Transaction History
          </h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    {tx.type === 'DEPOSIT' || tx.type === 'DEPOSIT_REQUEST' ? (
                      <ArrowDownToLine className="w-5 h-5 text-green-400" />
                    ) : tx.type === 'ADMIN_CREDIT' ? (
                      <Plus className="w-5 h-5 text-green-400" />
                    ) : (
                      <ArrowUpFromLine className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {tx.type === 'DEPOSIT_REQUEST' ? 'Deposit Request' : 
                         tx.type === 'ADMIN_CREDIT' ? 'Admin Credit' :
                         tx.type === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type.includes('DEPOSIT') || tx.type === 'ADMIN_CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.type.includes('DEPOSIT') || tx.type === 'ADMIN_CREDIT' ? '+' : '-'}{tx.amount} DR
                    </p>
                    <div className="flex items-center gap-1 text-xs justify-end">
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
