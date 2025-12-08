import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ShieldCheck, Video, CheckCircle2, AlertCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface VideoSelfieVerificationProps {
  userId: string;
  onComplete: () => void;
  onBack: () => void;
}

export function VideoSelfieVerification({ userId, onComplete, onBack }: VideoSelfieVerificationProps) {
  const [step, setStep] = useState<'intro' | 'instructions' | 'recording' | 'review' | 'processing' | 'success'>('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState(3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const instructions = [
    { text: 'Look straight at the camera', emoji: '👀' },
    { text: 'Smile naturally', emoji: '😊' },
    { text: 'Turn your head slowly left', emoji: '⬅️' },
    { text: 'Turn your head slowly right', emoji: '➡️' },
  ];

  useEffect(() => {
    if (step === 'recording' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'recording' && countdown === 0 && !isRecording) {
      startRecording();
    }
  }, [step, countdown, isRecording]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please grant permission.');
    }
  };

  const startRecording = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (!stream) {
        await startCamera();
        return;
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        setStep('review');
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 5 seconds
      setTimeout(() => {
        stopRecording();
      }, 5000);

      toast.success('Recording started!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop camera
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    }
  };

  const retakeVideo = () => {
    setRecordedBlob(null);
    setCountdown(3);
    setStep('instructions');
  };

  const submitVerification = async () => {
    if (!recordedBlob) return;

    setStep('processing');

    try {
      // In production, upload video to Supabase Storage
      // For now, simulate processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/verify/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            verificationType: 'video_selfie',
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      setStep('success');
      toast.success('Verification successful!');
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Verification failed. Please try again.');
      setStep('review');
    }
  };

  const handleStartProcess = () => {
    setStep('instructions');
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md mx-auto">
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
          <div>
            <h1 className="text-gray-900 dark:text-gray-100">Video Verification</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Confirm your identity</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Intro */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#EF7D00] to-[#198A00] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-gray-900 dark:text-gray-100 mb-2">Get Verified</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Verified profiles get 3x more matches
                </p>
              </div>

              <Card className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#198A00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-100">Stand out with a verified badge</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Let others know you're authentic</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#198A00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-100">Build trust with matches</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Verified users are more trusted</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#198A00] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-800 dark:text-gray-100">Quick 5-second video</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Just follow simple instructions</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#EF7D00] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Your video will only be used for verification and will be securely stored.
                  </p>
                </div>
              </Card>

              <Button
                onClick={handleStartProcess}
                className="w-full h-14 bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:from-[#EF7D00]/90 hover:to-[#198A00]/90 text-white"
              >
                <Video className="w-5 h-5 mr-2" />
                Start Video Verification
              </Button>
            </motion.div>
          )}

          {/* Instructions */}
          {step === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <h3 className="text-gray-900 dark:text-gray-100 mb-4">Follow these steps:</h3>
                <div className="space-y-4">
                  {instructions.map((instruction, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-lg p-3"
                    >
                      <span className="text-3xl">{instruction.emoji}</span>
                      <p className="text-gray-800 dark:text-gray-100">{instruction.text}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>

              <Button
                onClick={() => setStep('recording')}
                className="w-full h-14 bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:from-[#EF7D00]/90 hover:to-[#198A00]/90 text-white"
              >
                I'm Ready
              </Button>
            </motion.div>
          )}

          {/* Recording */}
          {step === 'recording' && (
            <motion.div
              key="recording"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card className="p-4 overflow-hidden">
                <div className="relative aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                  
                  {/* Countdown Overlay */}
                  {countdown > 0 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <motion.div
                        key={countdown}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 2, opacity: 0 }}
                        className="text-9xl text-white"
                      >
                        {countdown}
                      </motion.div>
                    </div>
                  )}

                  {/* Recording Indicator */}
                  {isRecording && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-3 h-3 bg-white rounded-full"
                      />
                      <span className="text-sm">Recording</span>
                    </div>
                  )}
                </div>
              </Card>

              {isRecording && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Follow the instructions shown earlier
                  </p>
                </Card>
              )}
            </motion.div>
          )}

          {/* Review */}
          {step === 'review' && recordedBlob && (
            <motion.div
              key="review"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <Card className="p-4">
                <h3 className="text-gray-900 dark:text-gray-100 mb-4">Review Your Video</h3>
                <div className="aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={URL.createObjectURL(recordedBlob)}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={retakeVideo}
                  variant="outline"
                  className="h-14"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Retake
                </Button>
                <Button
                  onClick={submitVerification}
                  className="h-14 bg-gradient-to-r from-[#EF7D00] to-[#198A00] hover:from-[#EF7D00]/90 hover:to-[#198A00]/90 text-white"
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Submit
                </Button>
              </div>
            </motion.div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center space-y-6 py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-20 h-20 border-4 border-[#EF7D00] border-t-transparent rounded-full mx-auto"
              />
              <div>
                <h3 className="text-gray-900 dark:text-gray-100 mb-2">Verifying Your Video</h3>
                <p className="text-gray-600 dark:text-gray-400">This will only take a moment...</p>
              </div>
            </motion.div>
          )}

          {/* Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle2 className="w-12 h-12 text-white" />
              </motion.div>
              <div>
                <h2 className="text-gray-900 dark:text-gray-100 mb-2">You're Verified!</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your profile now has a verified badge
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style>{`
          .mirror {
            transform: scaleX(-1);
          }
        `}</style>
      </div>
    </div>
  );
}
