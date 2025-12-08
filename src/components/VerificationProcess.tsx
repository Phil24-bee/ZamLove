import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ShieldCheck, Camera, CheckCircle2, AlertCircle, Upload } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface VerificationProcessProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function VerificationProcess({ userId, onComplete, onBack }: VerificationProcessProps) {
  const [step, setStep] = useState<'intro' | 'photo' | 'processing' | 'success'>('intro');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleStartVerification = () => {
    setStep('photo');
  };

  const handlePhotoTaken = async () => {
    setStep('processing');
    setIsVerifying(true);

    try {
      // Simulate photo verification process
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/verify/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      setStep('success');
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      setIsVerifying(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-gray-900 mb-2">Get Verified</h2>
            <p className="text-gray-600">
              Verified profiles get 3x more matches
            </p>
          </div>

          <Card className="p-6 space-y-4 bg-white">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#198A00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-800">Stand out with a verified badge</p>
                <p className="text-sm text-gray-500">Let others know you're authentic</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#198A00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-800">Build trust with matches</p>
                <p className="text-sm text-gray-500">Verified users are more trusted</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#198A00] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-800">Quick and easy process</p>
                <p className="text-sm text-gray-500">Takes less than 2 minutes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[#EF7D00] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                We'll ask you to take a selfie to verify your identity. Your photo will be securely stored and never shared.
              </p>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handleStartVerification}
              className="w-full h-12 bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:opacity-90 text-white"
            >
              Start Verification
            </Button>
            <Button
              onClick={onBack}
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'photo' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-gray-900 mb-2">Take a Selfie</h2>
            <p className="text-gray-600">
              Make sure your face is clearly visible
            </p>
          </div>

          <Card className="p-8 bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-dashed border-gray-300">
            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Camera preview area</p>
                <p className="text-sm text-gray-400 mt-2">Position your face in the frame</p>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Button
              onClick={handlePhotoTaken}
              className="w-full h-12 bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:opacity-90 text-white"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={() => setStep('intro')}
              variant="outline"
              className="w-full"
            >
              Back
            </Button>
          </div>
        </motion.div>
      )}

      {step === 'processing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[70vh]"
        >
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-20 h-20 border-4 border-[#EF7D00] border-t-transparent rounded-full mb-6"
          />
          <h2 className="text-gray-900 mb-2">Verifying...</h2>
          <p className="text-gray-600">This will only take a moment</p>
        </motion.div>
      )}

      {step === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center min-h-[70vh]"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="w-24 h-24 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <h2 className="text-gray-900 mb-2">You're Verified!</h2>
          <p className="text-gray-600 text-center">
            Your profile now has a verified badge
          </p>
        </motion.div>
      )}
    </div>
  );
}
