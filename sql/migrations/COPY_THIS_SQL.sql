-- Create messages table for real-time messaging
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  senderId TEXT NOT NULL,
  receiverId TEXT NOT NULL,
  text TEXT NOT NULL,
  reactions TEXT[] DEFAULT ARRAY[]::TEXT[],
  read BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT now(),
  timestamp TIMESTAMP DEFAULT now(),
  FOREIGN KEY (senderId) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(senderId, receiverId, timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_sender ON messages(receiverId, senderId, timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON messages(receiverId, read);
CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp DESC);

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Row Level Security (RLS) Policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can only see messages they sent or received
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    auth.uid() = senderId OR auth.uid() = receiverId
  );

-- Policy 2: Users can only insert messages where they are the sender
CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = senderId
  );

-- Policy 3: Users can update messages they sent or received (for read status and reactions)
CREATE POLICY "Users can update their messages"
  ON messages FOR UPDATE
  USING (
    auth.uid() = senderId OR auth.uid() = receiverId
  )
  WITH CHECK (
    auth.uid() = senderId OR auth.uid() = receiverId
  );

-- Policy 4: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (
    auth.uid() = senderId
  );

-- Create read_receipts table
CREATE TABLE IF NOT EXISTS read_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  messageId UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  userId TEXT NOT NULL,
  readAt TIMESTAMP DEFAULT now(),
  UNIQUE(messageId, userId)
);

-- Create indexes for read receipts
CREATE INDEX IF NOT EXISTS idx_read_receipts_message ON read_receipts(messageId);
CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON read_receipts(userId);

-- Enable RLS for read_receipts
ALTER TABLE read_receipts ENABLE ROW LEVEL SECURITY;

-- RLS Policy for read_receipts
CREATE POLICY "Users can manage their read receipts"
  ON read_receipts FOR ALL
  USING (
    auth.uid() = userId
  )
  WITH CHECK (
    auth.uid() = userId
  );

-- Create typing_indicators table for real-time typing status
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId TEXT NOT NULL,
  receiverId TEXT NOT NULL,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT now()
);

-- Enable Realtime for typing_indicators
ALTER PUBLICATION supabase_realtime ADD TABLE typing_indicators;

-- Create indexes for typing indicators
CREATE INDEX IF NOT EXISTS idx_typing_receivers ON typing_indicators(receiverId, expiresAt);

-- Enable RLS for typing_indicators
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage typing indicators"
  ON typing_indicators FOR ALL
  USING (
    auth.uid() = userId
  )
  WITH CHECK (
    auth.uid() = userId
  );
