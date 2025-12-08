import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface VideoCallProps {
  contact: {
    name: string;
    image: string;
  };
  callType: 'video' | 'voice';
  onEndCall: () => void;
}

export function VideoCall({ contact, callType, onEndCall }: VideoCallProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'voice');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Simulate connection delay
    const connectTimer = setTimeout(() => {
      setIsConnecting(false);
      toast.success(`Connected to ${contact.name}`);
      startLocalVideo();
    }, 2000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startLocalVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: !isVideoOff,
        audio: !isMuted
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast.error('Could not access camera/microphone');
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    toast.info(isMuted ? 'Microphone on' : 'Microphone muted');
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    toast.info(isVideoOff ? 'Camera on' : 'Camera off');
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toast.info(isSpeakerOn ? 'Speaker off' : 'Speaker on');
  };

  const handleEndCall = () => {
    // Stop all media tracks
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    toast.success(`Call ended (${formatDuration(callDuration)})`);
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative h-screen'} bg-gray-900`}>
      {/* Remote Video/Image */}
      <div className="absolute inset-0">
        {callType === 'video' && !isConnecting ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            poster={contact.image}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <img
                src={contact.image}
                alt={contact.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 ring-4 ring-white/20"
              />
              <h2 className="text-white mb-2">{contact.name}</h2>
              <p className="text-gray-400">
                {isConnecting ? 'Connecting...' : formatDuration(callDuration)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Local Video (Picture-in-Picture) */}
      {callType === 'video' && !isVideoOff && !isConnecting && (
        <motion.div
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          className="absolute top-4 right-4 w-32 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 z-10"
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover mirror"
          />
        </motion.div>
      )}

      {/* Call Info Overlay */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent z-20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white">{contact.name}</h3>
            <p className="text-sm text-gray-300">{formatDuration(callDuration)}</p>
          </div>
          <Button
            onClick={() => setIsFullscreen(!isFullscreen)}
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Call Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent z-20">
        <div className="flex items-center justify-center gap-4">
          {/* Mute */}
          <Button
            onClick={toggleMute}
            size="icon"
            className={`w-14 h-14 rounded-full ${
              isMuted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </Button>

          {/* Video Toggle */}
          {callType === 'video' && (
            <Button
              onClick={toggleVideo}
              size="icon"
              className={`w-14 h-14 rounded-full ${
                isVideoOff 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
            </Button>
          )}

          {/* End Call */}
          <Button
            onClick={handleEndCall}
            size="icon"
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </Button>

          {/* Speaker */}
          <Button
            onClick={toggleSpeaker}
            size="icon"
            className={`w-14 h-14 rounded-full ${
              !isSpeakerOn 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-white/20 hover:bg-white/30'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6 text-white" /> : <VolumeX className="w-6 h-6 text-white" />}
          </Button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            {isConnecting ? 'Establishing secure connection...' : 'Connected via encrypted call'}
          </p>
        </div>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}
