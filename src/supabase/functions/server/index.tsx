// @ts-ignore
// @ts-ignore
import { Hono } from "npm:hono";
// @ts-ignore
import { cors } from "npm:hono/cors";
// @ts-ignore
import { logger } from "npm:hono/logger";
// @ts-ignore
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Create Supabase client with service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize storage bucket for profile images
async function initializeStorage() {
  try {
    const bucketName = 'make-8234dc9e-profile-images';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);

    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      });
      console.log('Created storage bucket:', bucketName);
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// Initialize on startup
initializeStorage();

// Profanity filter - basic implementation
const profanityList = [
  // Offensive terms
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap',
  'piss', 'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut',
  // Racist/hateful terms
  'nigger', 'nigga', 'kike', 'spic', 'chink', 'wetback', 'raghead',
  // Sexual harassment
  'rape', 'molest', 'sex4cash', 'escort',
  // Scam/spam indicators
  'bitcoin', 'crypto', 'invest', 'forex', 'click here', 'buy now',
  'viagra', 'casino', 'lottery', 'winner',
  // Personal info (common patterns)
  'whatsapp', 'telegram', 'snapchat', 'kik',
  // Drug related
  'cocaine', 'heroin', 'meth', 'marijuana', 'weed', 'drugs',
  // Violence
  'kill', 'murder', 'bomb', 'terrorist', 'violence',
];

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityList.some(word => lowerText.includes(word));
}

function moderateContent(text: string): { clean: boolean; reason?: string } {
  if (containsProfanity(text)) {
    return { clean: false, reason: 'Contains inappropriate language' };
  }
  // Add more checks as needed (spam detection, etc.)
  return { clean: true };
}

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Types
interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  city: string;
  bio: string;
  image: string;
  interests: string[];
  personalityTraits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  verified: boolean;
  verificationDate?: string;
  blockedUsers: string[];
  reportedUsers: string[];
  premium?: boolean;
  premiumUntil?: string;
}

interface MatchData {
  userId: string;
  matchedUserId: string;
  compatibility: number;
  timestamp: string;
}

interface BlockData {
  userId: string;
  blockedUserId: string;
  timestamp: string;
}

interface ReportData {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  timestamp: string;
}

// Health check endpoint
app.get("/make-server-8234dc9e/health", (c) => {
  return c.json({ status: "ok" });
});

// User signup endpoint
app.post("/make-server-8234dc9e/signup", async (c) => {
  try {
    const { email, password, name, age, city } = await c.req.json();

    // Validate input
    if (!email || !password || !name || !age || !city) {
      return c.json({ error: "All fields are required" }, 400);
    }

    if (age < 18) {
      return c.json({ error: "You must be at least 18 years old" }, 400);
    }

    // Content moderation on name
    const nameModeration = moderateContent(name);
    if (!nameModeration.clean) {
      return c.json({ error: "Name contains inappropriate content" }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, age, city },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error('Auth error during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Create user profile in KV store
    const userProfile: UserProfile = {
      id: data.user.id,
      name,
      age,
      location: city,
      city,
      bio: '',
      image: '',
      interests: [],
      personalityTraits: {
        openness: 50,
        conscientiousness: 50,
        extraversion: 50,
        agreeableness: 50,
        neuroticism: 50,
      },
      verified: false,
      blockedUsers: [],
      reportedUsers: [],
    };

    await kv.set(`profile:${data.user.id}`, userProfile);

    return c.json({ success: true, user: data.user, profile: userProfile });
  } catch (error) {
    console.error('Error during signup:', error);
    return c.json({ error: "Failed to create account" }, 500);
  }
});

// Upload profile image
app.post("/make-server-8234dc9e/upload-image/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || user.id !== userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return c.json({ error: 'No image provided' }, 400);
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' }, 400);
    }

    // Validate file size (5MB max)
    if (file.size > 5242880) {
      return c.json({ error: 'File too large. Maximum size is 5MB' }, 400);
    }

    const bucketName = 'make-8234dc9e-profile-images';
    const fileName = `${userId}/${Date.now()}.${file.name.split('.').pop()}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return c.json({ error: 'Failed to upload image' }, 500);
    }

    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000);

    if (!urlData?.signedUrl) {
      return c.json({ error: 'Failed to generate image URL' }, 500);
    }

    // Update user profile with new image URL
    const profile = await kv.get(`profile:${userId}`);
    if (profile) {
      profile.image = urlData.signedUrl;
      await kv.set(`profile:${userId}`, profile);
    }

    return c.json({ success: true, imageUrl: urlData.signedUrl });
  } catch (error) {
    console.error('Error in image upload:', error);
    return c.json({ error: 'Failed to upload image' }, 500);
  }
});

// Get user profile
app.get("/make-server-8234dc9e/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const profile = await kv.get(`profile:${userId}`);

    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.log("Error fetching profile:", error);
    return c.json({ error: "Failed to fetch profile" }, 500);
  }
});

// Create or update user profile
app.post("/make-server-8234dc9e/profile", async (c) => {
  try {
    const profile = await c.req.json();
    const userId = profile.id;

    if (!userId) {
      return c.json({ error: "User ID is required" }, 400);
    }

    // Content moderation
    const bioModeration = moderateContent(profile.bio);
    if (!bioModeration.clean) {
      return c.json({ error: bioModeration.reason }, 400);
    }

    await kv.set(`profile:${userId}`, profile);
    return c.json({ success: true, profile });
  } catch (error) {
    console.log("Error saving profile:", error);
    return c.json({ error: "Failed to save profile" }, 500);
  }
});

// Update personality test results
app.post("/make-server-8234dc9e/personality/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const traits = await c.req.json();

    const profile = await kv.get(`profile:${userId}`);
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updatedProfile = {
      ...profile,
      personalityTraits: traits,
    };

    await kv.set(`profile:${userId}`, updatedProfile);
    return c.json({ success: true, traits });
  } catch (error) {
    console.log("Error updating personality traits:", error);
    return c.json({ error: "Failed to update personality traits" }, 500);
  }
});

// Get matches for a user based on interests, personality, and location
app.get("/make-server-8234dc9e/matches/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userProfile = await kv.get(`profile:${userId}`);

    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    // Get all profiles
    const allProfiles = await kv.getByPrefix("profile:");

    // Filter and calculate compatibility
    const matches = allProfiles
      .filter((p: UserProfile) => {
        // Don't match with self
        if (p.id === userId) return false;

        // Don't match with blocked users
        if (userProfile.blockedUsers?.includes(p.id)) return false;
        if (p.blockedUsers?.includes(userId)) return false;

        // Location filter - same city
        if (p.city !== userProfile.city) return false;

        return true;
      })
      .map((p: UserProfile) => {
        const compatibility = calculateCompatibility(userProfile, p);
        return { ...p, compatibility };
      })
      .sort((a, b) => b.compatibility - a.compatibility);

    return c.json(matches);
  } catch (error) {
    console.log("Error fetching matches:", error);
    return c.json({ error: "Failed to fetch matches" }, 500);
  }
});

// Calculate compatibility score
function calculateCompatibility(user1: UserProfile, user2: UserProfile): number {
  let score = 0;

  // Interest matching (40% weight)
  const commonInterests = user1.interests.filter(i => user2.interests.includes(i));
  const interestScore = (commonInterests.length / Math.max(user1.interests.length, user2.interests.length)) * 40;
  score += interestScore;

  // Personality compatibility (40% weight)
  if (user1.personalityTraits && user2.personalityTraits) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    let personalityScore = 0;

    traits.forEach(trait => {
      const diff = Math.abs(user1.personalityTraits[trait] - user2.personalityTraits[trait]);
      personalityScore += (100 - diff) / traits.length;
    });

    score += (personalityScore / 100) * 40;
  }

  // Verification status (10% weight)
  if (user1.verified && user2.verified) {
    score += 10;
  } else if (user1.verified || user2.verified) {
    score += 5;
  }

  // Age compatibility (10% weight)
  const ageDiff = Math.abs(user1.age - user2.age);
  const ageScore = Math.max(0, 10 - ageDiff);
  score += ageScore;

  return Math.round(score);
}

// Block a user
app.post("/make-server-8234dc9e/block", async (c) => {
  try {
    const { userId, blockedUserId } = await c.req.json();

    const userProfile = await kv.get(`profile:${userId}`);
    if (!userProfile) {
      return c.json({ error: "User profile not found" }, 404);
    }

    const blockedUsers = userProfile.blockedUsers || [];
    if (!blockedUsers.includes(blockedUserId)) {
      blockedUsers.push(blockedUserId);
    }

    const updatedProfile = {
      ...userProfile,
      blockedUsers,
    };

    await kv.set(`profile:${userId}`, updatedProfile);

    // Store block data
    const blockData: BlockData = {
      userId,
      blockedUserId,
      timestamp: new Date().toISOString(),
    };
    await kv.set(`block:${userId}:${blockedUserId}`, blockData);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error blocking user:", error);
    return c.json({ error: "Failed to block user" }, 500);
  }
});

// Report a user
app.post("/make-server-8234dc9e/report", async (c) => {
  try {
    const { reporterId, reportedUserId, reason } = await c.req.json();

    const reportData: ReportData = {
      reporterId,
      reportedUserId,
      reason,
      timestamp: new Date().toISOString(),
    };

    const reportId = `report:${Date.now()}:${reporterId}:${reportedUserId}`;
    await kv.set(reportId, reportData);

    return c.json({ success: true, reportId });
  } catch (error) {
    console.log("Error reporting user:", error);
    return c.json({ error: "Failed to report user" }, 500);
  }
});

// Verify user (simplified - in production this would involve document verification)
app.post("/make-server-8234dc9e/verify/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userProfile = await kv.get(`profile:${userId}`);

    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const updatedProfile = {
      ...userProfile,
      verified: true,
      verificationDate: new Date().toISOString(),
    };

    await kv.set(`profile:${userId}`, updatedProfile);
    return c.json({ success: true, verified: true });
  } catch (error) {
    console.log("Error verifying user:", error);
    return c.json({ error: "Failed to verify user" }, 500);
  }
});

// Get blocked users
app.get("/make-server-8234dc9e/blocked/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userProfile = await kv.get(`profile:${userId}`);

    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json({ blockedUsers: userProfile.blockedUsers || [] });
  } catch (error) {
    console.log("Error fetching blocked users:", error);
    return c.json({ error: "Failed to fetch blocked users" }, 500);
  }
});

// Unblock a user
app.delete("/make-server-8234dc9e/block/:userId/:blockedUserId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const blockedUserId = c.req.param("blockedUserId");

    const userProfile = await kv.get(`profile:${userId}`);
    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const blockedUsers = (userProfile.blockedUsers || []).filter(
      (id: string) => id !== blockedUserId
    );

    const updatedProfile = {
      ...userProfile,
      blockedUsers,
    };

    await kv.set(`profile:${userId}`, updatedProfile);
    await kv.del(`block:${userId}:${blockedUserId}`);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error unblocking user:", error);
    return c.json({ error: "Failed to unblock user" }, 500);
  }
});

// Get blocked users with full profiles
app.get("/make-server-8234dc9e/blocked-profiles/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const userProfile = await kv.get(`profile:${userId}`);

    if (!userProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    const blockedUserIds = userProfile.blockedUsers || [];
    const blockedProfiles = [];

    for (const blockedId of blockedUserIds) {
      const profile = await kv.get(`profile:${blockedId}`);
      if (profile) {
        blockedProfiles.push({
          id: profile.id,
          name: profile.name,
          age: profile.age,
          image: profile.image,
        });
      }
    }

    return c.json({ blockedUsers: blockedProfiles });
  } catch (error) {
    console.log("Error fetching blocked profiles:", error);
    return c.json({ error: "Failed to fetch blocked users" }, 500);
  }
});

// Payment endpoints
interface PaymentRequest {
  userId: string;
  plan: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  paymentMethod: 'airtel' | 'mtn' | 'zamtel' | 'card';
  phoneNumber?: string;
}

interface Subscription {
  userId: string;
  plan: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  transactionId: string;
}

// Initiate payment
app.post("/make-server-8234dc9e/payment/initiate", async (c) => {
  try {
    const paymentData: PaymentRequest = await c.req.json();
    const { userId, plan, amount, paymentMethod, phoneNumber } = paymentData;

    // Validate
    if (!userId || !plan || !amount || !paymentMethod) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Generate transaction ID
    const transactionId = `txn_${Date.now()}_${userId}`;

    // For mobile money, validate phone number
    if ((paymentMethod === 'airtel' || paymentMethod === 'mtn' || paymentMethod === 'zamtel') && !phoneNumber) {
      return c.json({ error: "Phone number required for mobile money" }, 400);
    }

    // In production, integrate with Flutterwave or payment provider
    // For now, we'll simulate the payment
    const paymentRecord = {
      transactionId,
      userId,
      plan,
      amount,
      paymentMethod,
      phoneNumber,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`payment:${transactionId}`, paymentRecord);

    // TODO: Integrate with Flutterwave API
    // const flutterwaveResponse = await initiateFlutterwavePayment(paymentData);

    // Simulate payment approval after 5 seconds (for testing)
    // In production, this would be handled by webhook from payment provider
    setTimeout(async () => {
      const record = await kv.get(`payment:${transactionId}`);
      if (record) {
        record.status = 'successful';
        await kv.set(`payment:${transactionId}`, record);

        // Create subscription
        const durationDays = plan === 'weekly' ? 7 : plan === 'monthly' ? 30 : plan === 'quarterly' ? 90 : 365;
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const subscription: Subscription = {
          userId,
          plan,
          amount,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          status: 'active',
          transactionId,
        };

        await kv.set(`subscription:${userId}`, subscription);

        // Update user profile
        const userProfile = await kv.get(`profile:${userId}`);
        if (userProfile) {
          userProfile.premium = true;
          userProfile.premiumUntil = endDate.toISOString();
          await kv.set(`profile:${userId}`, userProfile);
        }
      }
    }, 5000);

    return c.json({
      success: true,
      transactionId,
      message: 'Payment initiated. Please approve on your phone.',
    });
  } catch (error) {
    console.log("Error initiating payment:", error);
    return c.json({ error: "Failed to initiate payment" }, 500);
  }
});

// Check payment status
app.get("/make-server-8234dc9e/payment/status/:transactionId", async (c) => {
  try {
    const transactionId = c.req.param("transactionId");
    const paymentRecord = await kv.get(`payment:${transactionId}`);

    if (!paymentRecord) {
      return c.json({ error: "Transaction not found" }, 404);
    }

    return c.json({
      status: paymentRecord.status,
      transactionId: paymentRecord.transactionId,
    });
  } catch (error) {
    console.log("Error checking payment status:", error);
    return c.json({ error: "Failed to check payment status" }, 500);
  }
});

// Get user subscription
app.get("/make-server-8234dc9e/subscription/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const subscription = await kv.get(`subscription:${userId}`);

    if (!subscription) {
      return c.json({ premium: false });
    }

    // Check if subscription is still active
    const now = new Date();
    const endDate = new Date(subscription.endDate);

    if (now > endDate) {
      subscription.status = 'expired';
      await kv.set(`subscription:${userId}`, subscription);

      // Update user profile
      const userProfile = await kv.get(`profile:${userId}`);
      if (userProfile) {
        userProfile.premium = false;
        await kv.set(`profile:${userId}`, userProfile);
      }

      return c.json({ premium: false, expired: true });
    }

    return c.json({
      premium: true,
      subscription,
    });
  } catch (error) {
    console.log("Error fetching subscription:", error);
    return c.json({ error: "Failed to fetch subscription" }, 500);
  }
});

// Cancel subscription
app.post("/make-server-8234dc9e/subscription/cancel/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const subscription = await kv.get(`subscription:${userId}`);

    if (!subscription) {
      return c.json({ error: "No active subscription" }, 404);
    }

    subscription.status = 'cancelled';
    await kv.set(`subscription:${userId}`, subscription);

    return c.json({ success: true });
  } catch (error) {
    console.log("Error cancelling subscription:", error);
    return c.json({ error: "Failed to cancel subscription" }, 500);
  }
});

// ==================== MESSAGING SYSTEM ====================

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
  reactions?: string[];
}

// Send a message
app.post("/make-server-8234dc9e/messages/send", async (c) => {
  try {
    const { senderId, receiverId, text } = await c.req.json();

    if (!senderId || !receiverId || !text) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Content moderation
    const moderation = moderateContent(text);
    if (!moderation.clean) {
      return c.json({ error: moderation.reason }, 400);
    }

    // Check if users have blocked each other
    const senderProfile = await kv.get(`profile:${senderId}`);
    const receiverProfile = await kv.get(`profile:${receiverId}`);

    if (senderProfile?.blockedUsers?.includes(receiverId) ||
        receiverProfile?.blockedUsers?.includes(senderId)) {
      return c.json({ error: "Cannot send message to blocked user" }, 403);
    }

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
      reactions: [],
    };

    // Try to store in database first (if table exists)
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          senderId,
          receiverId,
          text,
          timestamp: new Date().toISOString(),
          read: false,
          reactions: [],
        })
        .select()
        .single();

      if (!error && data) {
        // Database insertion successful
        return c.json({ success: true, message: data });
      }
    } catch (dbError) {
      // Database error, fall back to KV store
      console.log('Database not available, using KV store');
    }

    // Fall back to KV store if database not available
    await kv.set(`message:${message.id}`, message);
    await kv.set(`chat:${senderId}:${receiverId}:${message.id}`, message);
    await kv.set(`chat:${receiverId}:${senderId}:${message.id}`, message);

    // Update last message timestamp for chat list
    const chatMetadata = {
      lastMessage: text,
      lastMessageAt: message.timestamp,
      lastSenderId: senderId,
    };
    await kv.set(`chat_meta:${senderId}:${receiverId}`, chatMetadata);
    await kv.set(`chat_meta:${receiverId}:${senderId}`, chatMetadata);

    return c.json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Get messages between two users
app.get("/make-server-8234dc9e/messages/:userId/:contactId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const contactId = c.req.param("contactId");

    // Try database first
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(senderId.eq.${userId},receiverId.eq.${contactId}),` +
          `and(senderId.eq.${contactId},receiverId.eq.${userId})`
        )
        .order('timestamp', { ascending: true });

      if (!error && messages) {
        return c.json({ messages });
      }
    } catch (dbError) {
      console.log('Database not available, using KV store');
    }

    // Fall back to KV store
    const messages1 = await kv.getByPrefix(`chat:${userId}:${contactId}:`);
    const messages2 = await kv.getByPrefix(`chat:${contactId}:${userId}:`);

    // Combine and sort by timestamp
    const allMessages = [...messages1, ...messages2]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Remove duplicates (messages stored in both directions)
    const uniqueMessages = Array.from(
      new Map(allMessages.map(msg => [msg.id, msg])).values()
    );

    return c.json({ messages: uniqueMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Mark messages as read
app.post("/make-server-8234dc9e/messages/mark-read", async (c) => {
  try {
    const { userId, contactId } = await c.req.json();

    const messages = await kv.getByPrefix(`chat:${contactId}:${userId}:`);

    for (const message of messages) {
      if (message.receiverId === userId && !message.read) {
        message.read = true;
        await kv.set(`message:${message.id}`, message);
        await kv.set(`chat:${contactId}:${userId}:${message.id}`, message);
        await kv.set(`chat:${userId}:${contactId}:${message.id}`, message);
      }
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return c.json({ error: "Failed to mark messages as read" }, 500);
  }
});

// Add reaction to message
app.post("/make-server-8234dc9e/messages/react", async (c) => {
  try {
    const { messageId, emoji, userId } = await c.req.json();

    const message = await kv.get(`message:${messageId}`);
    if (!message) {
      return c.json({ error: "Message not found" }, 404);
    }

    // Add reaction
    if (!message.reactions) {
      message.reactions = [];
    }
    message.reactions.push(emoji);

    // Update in all locations
    await kv.set(`message:${messageId}`, message);
    await kv.set(`chat:${message.senderId}:${message.receiverId}:${messageId}`, message);
    await kv.set(`chat:${message.receiverId}:${message.senderId}:${messageId}`, message);

    return c.json({ success: true, message });
  } catch (error) {
    console.error("Error adding reaction:", error);
    return c.json({ error: "Failed to add reaction" }, 500);
  }
});

// Get user's conversations list
app.get("/make-server-8234dc9e/conversations/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");

    // Get all chat metadata
    const chatMetas = await kv.getByPrefix(`chat_meta:${userId}:`);

    // Get profile info for each contact
    const conversations = [];
    for (const meta of chatMetas) {
      const contactId = meta.key.split(':')[2];
      const contactProfile = await kv.get(`profile:${contactId}`);

      if (contactProfile) {
        // Count unread messages
        const messages = await kv.getByPrefix(`chat:${contactId}:${userId}:`);
        const unreadCount = messages.filter(m => m.receiverId === userId && !m.read).length;

        conversations.push({
          contactId,
          name: contactProfile.name,
          image: contactProfile.image,
          age: contactProfile.age,
          lastMessage: meta.lastMessage,
          lastMessageAt: meta.lastMessageAt,
          unreadCount,
          newMessage: unreadCount > 0,
        });
      }
    }

    // Sort by most recent
    conversations.sort((a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return c.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return c.json({ error: "Failed to fetch conversations" }, 500);
  }
});

// Delete a message
app.delete("/make-server-8234dc9e/messages/:messageId", async (c) => {
  try {
    const messageId = c.req.param("messageId");
    const { userId } = await c.req.json();

    const message = await kv.get(`message:${messageId}`);
    if (!message) {
      return c.json({ error: "Message not found" }, 404);
    }

    // Only sender can delete
    if (message.senderId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Delete from all locations
    await kv.del(`message:${messageId}`);
    await kv.del(`chat:${message.senderId}:${message.receiverId}:${messageId}`);
    await kv.del(`chat:${message.receiverId}:${message.senderId}:${messageId}`);

    return c.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return c.json({ error: "Failed to delete message" }, 500);
  }
});

Deno.serve(app.fetch);

