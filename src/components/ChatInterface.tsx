import { toast } from 'sonner@2.0.3';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

const reactionEmojis = ['❤️', '😂', '😮', '😢', '👍', '🔥'];

interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  sender: 'user' | 'other';
  timestamp: string;
  read: boolean;
  reactions?: string[];
}

interface ChatInterfaceProps {
  contact: {
    id?: string | number;
    name: string;
    age: number;
    image: string;
  };
  currentUserId?: string;
  onBack: () => void;
  onBlock?: (contactId: string | number) => void;
}

export function ChatInterface({ contact, currentUserId = 'user1', onBack, onBlock }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showScreenshotWarning, setShowScreenshotWarning] = useState(false);
  const [selectedMessageForReaction, setSelectedMessageForReaction] = useState<string | null>(null);
  const [activeCall, setActiveCall] = useState<'video' | 'voice' | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load initial messages and set up real-time subscription
  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [currentUserId, contact.id]);

  // Mark messages as read when chat opens
  useEffect(() => {
    markMessagesAsRead();
  }, [currentUserId, contact.id]);

  const loadMessages = async () => {
    try {
      // Query both directions
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(senderId.eq.${currentUserId},receiverId.eq.${contact.id}),` +
          `and(senderId.eq.${contact.id},receiverId.eq.${currentUserId})`
        )
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        // Fallback to API if table doesn't exist yet
        await loadMessagesFromAPI();
      } else if (messagesData) {
        setMessages(messagesData.map((msg: any) => ({
          ...msg,
          sender: msg.senderId === currentUserId ? 'user' : 'other',
        })));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      await loadMessagesFromAPI();
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesFromAPI = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/messages/${currentUserId}/${contact.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages.map((msg: Message) => ({
          ...msg,
          sender: msg.senderId === currentUserId ? 'user' : 'other',
        })));
      }
    } catch (error) {
      console.error('Error loading messages from API:', error);
    }
  };

  const subscribeToMessages = () => {
    try {
      const channel = supabase
        .channel(`chat_${currentUserId}_${contact.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `or(and(senderId.eq.${currentUserId},receiverId.eq.${contact.id}),and(senderId.eq.${contact.id},receiverId.eq.${currentUserId}))`,
          },
          (payload) => {
            const newMsg = payload.new as any;
            setMessages((prev) => [
              ...prev,
              {
                ...newMsg,
                sender: newMsg.senderId === currentUserId ? 'user' : 'other',
              },
            ]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const updatedMsg = payload.new as any;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === updatedMsg.id
                  ? { ...msg, ...updatedMsg }
                  : msg
              )
            );
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      // Update unread messages in Supabase
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiverId', currentUserId)
        .eq('senderId', contact.id)
        .eq('read', false);

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = table doesn't exist, fall back to API
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/messages/mark-read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              userId: currentUserId,
              contactId: contact.id,
            }),
          }
        );
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('messages')
        .insert({
          senderId: currentUserId,
          receiverId: contact.id,
          text: newMessage.trim(),
          read: false,
          reactions: [],
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setNewMessage('');
        // Message will appear via real-time subscription
      } else {
        // Fallback to API if table doesn't exist
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/messages/send`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              senderId: currentUserId,
              receiverId: contact.id,
              text: newMessage.trim(),
            }),
          }
        );

        if (response.ok) {
          const apiData = await response.json();
          const sentMessage = {
            ...apiData.message,
            sender: 'user' as const,
          };
          setMessages([...messages, sentMessage]);
          setNewMessage('');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const updatedReactions = message.reactions || [];
      if (!updatedReactions.includes(emoji)) {
        updatedReactions.push(emoji);
      }

      // Try Supabase first
      const { error } = await supabase
        .from('messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!error) {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, reactions: updatedReactions } : msg
        ));
        setSelectedMessageForReaction(null);
        toast.success('Reaction added!');
      } else {
        // Fallback to API
        const { projectId, publicAnonKey } = await import('../utils/supabase/info');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/messages/react`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              messageId,
              emoji,
              userId: currentUserId,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(messages.map(msg => 
            msg.id === messageId ? { ...data.message, sender: msg.sender } : msg
          ));
          setSelectedMessageForReaction(null);
          toast.success('Reaction added!');
        }
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  };

  // Detect potential screenshot attempts (visual warning only - can't actually prevent in web)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User might be taking a screenshot
        setShowScreenshotWarning(true);
        setTimeout(() => setShowScreenshotWarning(false), 3000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleBlock = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/block`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId: currentUserId,
            blockedUserId: contact.id || contact.name,
          }),
        }
      );

      if (response.ok) {
        toast.success(`${contact.name} has been blocked`);
        setShowBlockDialog(false);
        if (onBlock) {
          onBlock(contact.id || contact.name);
        }
        setTimeout(() => onBack(), 1000);
      } else {
        toast.error('Failed to block user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleReport = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8234dc9e/report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            reporterId: currentUserId,
            reportedUserId: contact.id || contact.name,
            reason: 'Inappropriate behavior',
          }),
        }
      );

      if (response.ok) {
        toast.success(`${contact.name} has been reported`);
        setShowReportDialog(false);
      } else {
        toast.error('Failed to report user');
      }
    } catch (error) {
      console.error('Error reporting user:', error);
      toast.error('Failed to report user');
    }
  };

  if (activeCall) {
    return (
      <VideoCall
        contact={contact}
        callType={activeCall}
        onEndCall={() => setActiveCall(null)}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-t-3xl shadow-2xl">
      {/* Screenshot Warning */}
      <AnimatePresence>
        {showScreenshotWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#DE2010] to-red-600 text-white p-3 flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">Screenshots may violate privacy. Please be respectful.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <Button
          onClick={onBack}
          size="icon"
          variant="ghost"
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <img 
              src={contact.image}
              alt={contact.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#EF7D00]/20"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#198A00] rounded-full border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-gray-900">{contact.name}, {contact.age}</h3>
              <Shield className="w-4 h-4 text-[#198A00]" title="Safe messaging enabled" />
            </div>
            <p className="text-xs text-[#198A00]">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full text-[#EF7D00]"
            onClick={() => setActiveCall('voice')}
          >
            <Phone className="w-5 h-5" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full text-[#EF7D00]"
            onClick={() => setActiveCall('video')}
          >
            <Video className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => setShowReportDialog(true)}
                className="text-[#EF7D00] cursor-pointer"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowBlockDialog(true)}
                className="text-[#DE2010] cursor-pointer"
              >
                <Ban className="w-4 h-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-orange-50/30 to-white">
        {/* Safe Messaging Notice */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#198A00]" />
            <p className="text-xs text-emerald-700">Safe messaging enabled</p>
          </div>
        </div>

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'} relative`}>
                <div
                  className={`rounded-3xl px-5 py-3 cursor-pointer ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-[#EF7D00] to-[#198A00] text-white rounded-br-lg'
                      : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 rounded-bl-lg'
                  }`}
                  onClick={() => setSelectedMessageForReaction(message.id)}
                >
                  <p className={message.sender === 'user' ? 'text-white' : 'text-gray-800 dark:text-gray-100'}>
                    {message.text}
                  </p>
                </div>
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex gap-1 mt-1 px-2">
                    {message.reactions.map((reaction, idx) => (
                      <span key={idx} className="text-sm bg-white dark:bg-gray-700 rounded-full px-2 py-0.5 border border-gray-200 dark:border-gray-600">
                        {reaction}
                      </span>
                    ))}
                  </div>
                )}

                <p className={`text-xs text-gray-400 dark:text-gray-500 mt-1 px-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {message.timestamp}
                </p>

                {/* Reaction Picker */}
                {selectedMessageForReaction === message.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute top-0 ${message.sender === 'user' ? 'right-0' : 'left-0'} bg-white dark:bg-gray-800 rounded-full shadow-lg p-2 flex gap-1 border border-gray-200 dark:border-gray-600 z-10`}
                  >
                    {reactionEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="text-xl hover:scale-125 transition-transform"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => setSelectedMessageForReaction(null)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ml-1"
                    >
                      ✕
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full text-[#EF7D00] flex-shrink-0"
          >
            <Heart className="w-5 h-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="rounded-full bg-gray-100 border-0 pr-12 h-12"
            />
          </div>
          
          <Button
            onClick={handleSend}
            size="icon"
            className="rounded-full bg-gradient-to-br from-[#EF7D00] to-[#198A00] hover:opacity-90 text-white w-12 h-12 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {contact.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to message you or see your profile. You can unblock them later from settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlock}
              className="bg-[#DE2010] hover:bg-[#DE2010]/90"
            >
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report {contact.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Your report will be reviewed by our team. We take user safety seriously and will take appropriate action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReport}
              className="bg-[#EF7D00] hover:bg-[#EF7D00]/90"
            >
              Submit Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}