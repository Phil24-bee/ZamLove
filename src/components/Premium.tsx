import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  ArrowLeft, 
  Crown, 
  Check, 
  Zap, 
  Heart, 
  Eye, 
  Shield,
  Sparkles,
  Star,
  Phone,
  CreditCard,
  Wallet
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PremiumProps {
  userId: string;
  onBack: () => void;
}

type PlanType = 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type PaymentMethod = 'airtel' | 'mtn' | 'zamtel' | 'card';

const plans = {
  weekly: {
    name: '1 Week Premium',
    price: 20,
    duration: '7 days',
    savings: null,
    tag: 'Try it out',
  },
  monthly: {
    name: '1 Month Premium',
    price: 50,
    duration: '30 days',
    savings: null,
    tag: 'Popular',
  },
  quarterly: {
    name: '3 Months Premium',
    price: 120,
    duration: '90 days',
    savings: '20% off',
    tag: 'Best Value',
  },
  yearly: {
    name: '1 Year Premium',
    price: 400,
    duration: '365 days',
    savings: '33% off',
    tag: 'Maximum Savings',
  },
};

const features = [
  { icon: Zap, text: 'Unlimited likes per day', color: 'text-yellow-500' },
  { icon: Eye, text: 'See who liked you', color: 'text-blue-500' },
  { icon: Heart, text: 'Rewind last swipe', color: 'text-red-500' },
  { icon: Star, text: 'Get 5x more matches', color: 'text-purple-500' },
  { icon: Shield, text: 'Priority verification', color: 'text-green-500' },
  { icon: Sparkles, text: 'Profile boost monthly', color: 'text-orange-500' },
  { icon: Crown, text: 'Premium badge on profile', color: 'text-yellow-600' },
];

export function Premium({ userId, onBack }: PremiumProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('airtel');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = () => {
    setShowPayment(true);
  };

  const handlePayment = async () => {
    // Validate phone number
    if ((paymentMethod === 'airtel' || paymentMethod === 'mtn' || paymentMethod === 'zamtel') && !phoneNumber) {
      toast.error('Please enter your mobile money number');
      return;
    }

    if (phoneNumber && !/^(09|26)[0-9]{8,9}$/.test(phoneNumber)) {
      toast.error('Please enter a valid Zambian phone number');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/payment/initiate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            plan: selectedPlan,
            amount: plans[selectedPlan].price,
            paymentMethod,
            phoneNumber,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Payment initiated!', {
          description: 'Please approve the payment on your phone',
        });
        
        // Poll for payment status
        checkPaymentStatus(data.transactionId);
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (transactionId: string) => {
    const maxAttempts = 30; // 30 attempts = 1 minute
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/payment/status/${transactionId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const data = await response.json();

        if (data.status === 'successful') {
          clearInterval(interval);
          toast.success('Payment successful!', {
            description: 'Welcome to ZamLove Premium! 🎉',
          });
          setShowPayment(false);
          // Redirect to profile or refresh premium status
          setTimeout(() => onBack(), 2000);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          toast.error('Payment failed', {
            description: 'Please try again or contact support',
          });
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          toast.warning('Payment status unknown', {
            description: 'We will notify you once payment is confirmed',
          });
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 2000); // Check every 2 seconds
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'airtel':
        return '📱';
      case 'mtn':
        return '📞';
      case 'zamtel':
        return '☎️';
      case 'card':
        return '💳';
      default:
        return '💰';
    }
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'airtel':
        return 'Airtel Money';
      case 'mtn':
        return 'MTN Mobile Money';
      case 'zamtel':
        return 'Zamtel Kwacha';
      case 'card':
        return 'Card Payment';
      default:
        return 'Payment';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-md mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={onBack}
            size="icon"
            variant="ghost"
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#EF7D00]" />
              ZamLove Premium
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Get unlimited access and more matches
            </p>
          </div>
        </div>

        {/* Promotional Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#198A00] to-[#EF7D00] p-4 rounded-lg text-white mb-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">🎉 Launch Promotion 2025!</h3>
          </div>
          <p className="text-sm text-white/90">
            Special introductory prices - limited time offer!
          </p>
        </motion.div>

        {/* Features */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border-2 border-[#EF7D00]/20">
          <h3 className="text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#EF7D00]" />
            Premium Features
          </h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className={`w-10 h-10 rounded-full bg-white dark:bg-gray-600 flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <p className="text-gray-700 dark:text-gray-300">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Pricing Plans */}
        <div className="space-y-3">
          <h3 className="text-gray-900 dark:text-gray-100">Choose Your Plan</h3>
          
          {(Object.keys(plans) as PlanType[]).map((planKey) => (
            <motion.div
              key={planKey}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  selectedPlan === planKey
                    ? 'border-2 border-[#EF7D00] bg-orange-50 dark:bg-orange-900/20'
                    : 'border border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setSelectedPlan(planKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === planKey
                        ? 'border-[#EF7D00] bg-[#EF7D00]'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedPlan === planKey && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-gray-100">{plans[planKey].name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {plans[planKey].duration}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-gray-100">
                      ZMW {plans[planKey].price}
                    </p>
                    {plans[planKey].savings && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        {plans[planKey].savings}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Subscribe Button */}
        <Button
          onClick={handleSubscribe}
          className="w-full bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:from-[#EF7D00]/90 hover:to-[#198A00]/90 text-white h-12"
          size="lg"
        >
          <Crown className="w-5 h-5 mr-2" />
          Subscribe for ZMW {plans[selectedPlan].price}
        </Button>

        {/* Payment Dialog */}
        <Dialog open={showPayment} onOpenChange={setShowPayment}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-[#EF7D00]" />
                Complete Payment
              </DialogTitle>
              <DialogDescription>
                {plans[selectedPlan].name} - ZMW {plans[selectedPlan].price}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value="airtel" id="airtel" />
                      <Label htmlFor="airtel" className="flex-1 cursor-pointer flex items-center gap-2">
                        <span className="text-xl">📱</span>
                        Airtel Money
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value="mtn" id="mtn" />
                      <Label htmlFor="mtn" className="flex-1 cursor-pointer flex items-center gap-2">
                        <span className="text-xl">📞</span>
                        MTN Mobile Money
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value="zamtel" id="zamtel" />
                      <Label htmlFor="zamtel" className="flex-1 cursor-pointer flex items-center gap-2">
                        <span className="text-xl">☎️</span>
                        Zamtel Kwacha
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Card Payment
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Phone Number Input for Mobile Money */}
              {(paymentMethod === 'airtel' || paymentMethod === 'mtn' || paymentMethod === 'zamtel') && (
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Money Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">+260</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9XXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    You will receive a push notification to approve the payment
                  </p>
                </div>
              )}

              {/* Card Payment Info */}
              {paymentMethod === 'card' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    You will be redirected to a secure payment page
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowPayment(false)}
                variant="outline"
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePayment}
                className="flex-1 bg-[#EF7D00] hover:bg-[#EF7D00]/90"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Pay ZMW {plans[selectedPlan].price}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}