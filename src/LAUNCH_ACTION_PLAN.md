# 🚀 ZamLove Launch Action Plan

## Executive Summary

**Current Status:** Alpha Prototype (25% production-ready)
**Target:** Beta Launch in 6-8 weeks
**Critical Blockers:** 7 must-fix issues

---

## 📋 WEEK-BY-WEEK PLAN

### Week 1-2: Real-Time Messaging (CRITICAL)

#### Backend Tasks:
- [ ] Create `messages` table structure in KV store
- [ ] Implement Supabase Realtime subscription
- [ ] Add message persistence endpoints
- [ ] Implement message encryption (optional but recommended)
- [ ] Add typing indicators
- [ ] Add read receipts

#### Frontend Tasks:
- [ ] Remove hardcoded messages from `ChatInterface.tsx`
- [ ] Connect to Supabase Realtime
- [ ] Implement real message sending
- [ ] Add loading states
- [ ] Test real-time delivery

#### Code Example:
```typescript
// Backend: /supabase/functions/server/index.tsx
app.post("/make-server-8234dc9e/messages", async (c) => {
  const { senderId, receiverId, text } = await c.req.json();
  
  // Content moderation
  const moderation = moderateContent(text);
  if (!moderation.clean) {
    return c.json({ error: moderation.reason }, 400);
  }
  
  const message = {
    id: `msg_${Date.now()}`,
    senderId,
    receiverId,
    text,
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  await kv.set(`message:${message.id}`, message);
  await kv.set(`chat:${senderId}:${receiverId}:${message.id}`, message);
  
  return c.json({ success: true, message });
});

// Get messages between two users
app.get("/make-server-8234dc9e/messages/:userId/:contactId", async (c) => {
  const userId = c.req.param("userId");
  const contactId = c.req.param("contactId");
  
  const messages1 = await kv.getByPrefix(`chat:${userId}:${contactId}:`);
  const messages2 = await kv.getByPrefix(`chat:${contactId}:${userId}:`);
  
  const allMessages = [...messages1, ...messages2]
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  return c.json({ messages: allMessages });
});
```

```typescript
// Frontend: Use Supabase Realtime
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(projectId, publicAnonKey)

// Subscribe to new messages
const channel = supabase.channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiverId=eq.${currentUserId}`
  }, (payload) => {
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()
```

---

### Week 3: Payment Integration (CRITICAL)

#### Tasks:
- [ ] Sign up for Flutterwave account
- [ ] Get API keys (test & live)
- [ ] Implement Flutterwave Standard integration
- [ ] Add Zambian mobile money support
- [ ] Create webhook handler for payment confirmation
- [ ] Test with test cards
- [ ] Add payment verification flow

#### Resources:
- Flutterwave Docs: https://developer.flutterwave.com/docs
- Zambian Payment Methods: Airtel Money, MTN, Zamtel

#### Code Example:
```typescript
// Add to server
app.post("/make-server-8234dc9e/payment/initiate", async (c) => {
  const { userId, plan, amount, email, phoneNumber } = await c.req.json();
  
  // Call Flutterwave API
  const response = await fetch('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('FLUTTERWAVE_SECRET_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tx_ref: `zamlove_${Date.now()}`,
      amount: amount,
      currency: 'ZMW',
      redirect_url: 'https://your-app.com/payment/callback',
      payment_options: 'mobilemoneyzmbia',
      customer: {
        email: email,
        phonenumber: phoneNumber,
        name: 'User Name',
      },
      customizations: {
        title: 'ZamLove Premium',
        description: `${plan} subscription`,
        logo: 'https://your-logo-url.com/logo.png',
      },
    }),
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    return c.json({ 
      success: true, 
      paymentUrl: data.data.link,
      transactionId: data.data.tx_ref,
    });
  } else {
    return c.json({ error: 'Payment initiation failed' }, 500);
  }
});

// Webhook handler
app.post("/make-server-8234dc9e/payment/webhook", async (c) => {
  const payload = await c.req.json();
  const signature = c.req.header('verif-hash');
  
  // Verify webhook signature
  if (signature !== Deno.env.get('FLUTTERWAVE_WEBHOOK_SECRET')) {
    return c.json({ error: 'Invalid signature' }, 401);
  }
  
  if (payload.status === 'successful') {
    // Update user subscription
    const userId = payload.meta.userId; // You'd include this in the transaction
    const plan = payload.meta.plan;
    
    // Create subscription...
    // (Use existing subscription code)
  }
  
  return c.json({ success: true });
});
```

#### Environment Variables Needed:
```
FLUTTERWAVE_PUBLIC_KEY=your_public_key
FLUTTERWAVE_SECRET_KEY=your_secret_key
FLUTTERWAVE_ENCRYPTION_KEY=your_encryption_key
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret
```

---

### Week 4: Image Moderation (CRITICAL)

#### Tasks:
- [ ] Sign up for AWS or Google Cloud
- [ ] Enable Rekognition or Vision API
- [ ] Implement NSFW detection
- [ ] Create manual review queue
- [ ] Add automated blocking for explicit content
- [ ] Test with various images

#### Code Example:
```typescript
// Add to server
import { RekognitionClient, DetectModerationLabelsCommand } from "npm:@aws-sdk/client-rekognition";

const rekognitionClient = new RekognitionClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID')!,
    secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY')!,
  },
});

async function moderateImage(imageBytes: Uint8Array): Promise<{ safe: boolean; labels: string[] }> {
  const command = new DetectModerationLabelsCommand({
    Image: { Bytes: imageBytes },
    MinConfidence: 60,
  });
  
  const response = await rekognitionClient.send(command);
  const labels = response.ModerationLabels || [];
  
  // Check for inappropriate content
  const unsafe = labels.some(label => 
    label.Name === 'Explicit Nudity' || 
    label.Name === 'Suggestive' ||
    label.Name === 'Violence' ||
    label.Name === 'Visually Disturbing'
  );
  
  return {
    safe: !unsafe,
    labels: labels.map(l => l.Name || ''),
  };
}

// Update upload endpoint
app.post("/make-server-8234dc9e/upload-image/:userId", async (c) => {
  // ... existing auth code ...
  
  const arrayBuffer = await file.arrayBuffer();
  const imageBytes = new Uint8Array(arrayBuffer);
  
  // Moderate image
  const moderation = await moderateImage(imageBytes);
  
  if (!moderation.safe) {
    return c.json({ 
      error: 'Image contains inappropriate content',
      labels: moderation.labels,
    }, 400);
  }
  
  // ... continue with upload ...
});
```

#### Costs:
- AWS Rekognition: $1 per 1000 images (first 5000/month free)
- Google Vision: $1.50 per 1000 images (first 1000/month free)

---

### Week 5: Real Verification (CRITICAL)

#### Option A: DIY Verification
- [ ] Implement ID document upload
- [ ] Add video selfie recording
- [ ] Create manual review queue
- [ ] Hire moderators to verify

#### Option B: Third-Party Service (RECOMMENDED)
- [ ] Sign up for Veriff, Onfido, or Jumio
- [ ] Integrate SDK
- [ ] Set up webhook for verification results

#### Recommended: Veriff
- Cost: ~$1-3 per verification
- Fast: Results in minutes
- Reliable: 98%+ accuracy
- Docs: https://developers.veriff.com

```typescript
// Using Veriff
app.post("/make-server-8234dc9e/verification/start/:userId", async (c) => {
  const userId = c.req.param("userId");
  
  const response = await fetch('https://stationapi.veriff.com/v1/sessions', {
    method: 'POST',
    headers: {
      'X-AUTH-CLIENT': Deno.env.get('VERIFF_API_KEY')!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      verification: {
        callback: 'https://your-app.com/verification/webhook',
        person: {
          firstName: 'User',
          lastName: 'Name',
        },
        vendorData: userId,
      },
    }),
  });
  
  const data = await response.json();
  
  return c.json({ 
    verificationUrl: data.verification.url,
    sessionId: data.verification.id,
  });
});

// Webhook
app.post("/make-server-8234dc9e/verification/webhook", async (c) => {
  const payload = await c.req.json();
  
  if (payload.status === 'approved') {
    const userId = payload.verification.vendorData;
    
    // Update user profile
    const profile = await kv.get(`profile:${userId}`);
    if (profile) {
      profile.verified = true;
      profile.verificationDate = new Date().toISOString();
      await kv.set(`profile:${userId}`, profile);
    }
  }
  
  return c.json({ success: true });
});
```

---

### Week 6: Email Confirmation & Password Reset (CRITICAL)

#### Tasks:
- [ ] Set up SendGrid or Mailgun account
- [ ] Configure email templates
- [ ] Update signup to require email confirmation
- [ ] Implement forgot password flow
- [ ] Test email delivery

#### Code Example:
```typescript
// Update signup endpoint
app.post("/make-server-8234dc9e/signup", async (c) => {
  // ... validation ...
  
  // Create user WITHOUT auto-confirm
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, age, city },
    email_confirm: false,  // ← Changed!
  });
  
  // Send custom confirmation email via SendGrid
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email }],
        dynamic_template_data: {
          name,
          confirmation_link: `https://your-app.com/confirm?token=${confirmToken}`,
        },
      }],
      from: { email: 'noreply@zamlove.com', name: 'ZamLove' },
      template_id: 'd-your-template-id',
    }),
  });
  
  return c.json({ 
    success: true, 
    message: 'Please check your email to confirm your account',
  });
});
```

#### Frontend - Forgot Password:
```typescript
// In ForgotPassword component
const handleReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://your-app.com/reset-password',
  });
  
  if (error) {
    toast.error('Failed to send reset email');
  } else {
    toast.success('Check your email for reset link');
  }
};
```

---

### Week 7: Legal Review & Updates (CRITICAL)

#### Tasks:
- [ ] Hire Zambian lawyer for consultation
- [ ] Update Terms of Service for Zambian law
- [ ] Update Privacy Policy with Zambian requirements
- [ ] Add GDPR data export functionality
- [ ] Add account deletion functionality
- [ ] Add cookie consent banner
- [ ] Create Community Guidelines
- [ ] Add age verification gate

#### Legal Consultation Questions:
1. What are Zambian data protection requirements?
2. Do we need business registration before launch?
3. What tax implications exist?
4. What liability protections do we need?
5. Are there age verification requirements?

#### Data Export Endpoint:
```typescript
app.get("/make-server-8234dc9e/export-data/:userId", async (c) => {
  const userId = c.req.param("userId");
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  if (!user || user.id !== userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // Collect all user data
  const profile = await kv.get(`profile:${userId}`);
  const messages = await kv.getByPrefix(`chat:${userId}:`);
  const matches = await kv.getByPrefix(`match:${userId}:`);
  
  const userData = {
    profile,
    messages,
    matches,
    exportedAt: new Date().toISOString(),
  };
  
  return c.json(userData);
});
```

#### Account Deletion:
```typescript
app.delete("/make-server-8234dc9e/account/:userId", async (c) => {
  const userId = c.req.param("userId");
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  // Verify auth
  const { data: { user } } = await supabase.auth.getUser(accessToken);
  if (!user || user.id !== userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  // Delete all user data
  await kv.del(`profile:${userId}`);
  
  // Delete messages
  const messages = await kv.getByPrefix(`chat:${userId}:`);
  for (const msg of messages) {
    await kv.del(`message:${msg.id}`);
  }
  
  // Delete auth account
  await supabase.auth.admin.deleteUser(userId);
  
  return c.json({ success: true, message: 'Account deleted' });
});
```

---

### Week 8: Testing & Bug Fixes

#### Beta Testing Tasks:
- [ ] Recruit 50-100 beta testers in Lusaka
- [ ] Create beta testing guidelines
- [ ] Set up feedback collection (Google Forms/Typeform)
- [ ] Monitor error logs (set up Sentry)
- [ ] Fix critical bugs daily
- [ ] Test on multiple devices
- [ ] Test various network conditions

#### Beta Tester Recruitment:
- Post in Zambian Facebook groups
- University WhatsApp groups (UNZA, CBU)
- Reddit r/Zambia
- Offer free premium for testing

#### Monitoring Setup:
```typescript
// Add Sentry to catch errors
import * as Sentry from "https://deno.land/x/sentry/index.ts";

Sentry.init({
  dsn: Deno.env.get('SENTRY_DSN'),
  environment: Deno.env.get('ENVIRONMENT') || 'production',
});

app.onError((err, c) => {
  Sentry.captureException(err);
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});
```

---

## 🎯 HIGH PRIORITY (Fix After Beta Launch)

### Week 9-10: Enhanced Features

#### Video/Voice Calls
- Use Agora.io or Twilio Video
- Cost: ~$0.001-0.004 per minute
- Implementation: 3-5 days

```typescript
// Example with Agora
import { RtcTokenBuilder, RtcRole } from "npm:agora-access-token";

app.post("/make-server-8234dc9e/video-call/token", async (c) => {
  const { userId, channelName } = await c.req.json();
  
  const appId = Deno.env.get('AGORA_APP_ID');
  const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');
  const uid = parseInt(userId);
  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
  
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
  
  return c.json({ token, channel: channelName });
});
```

#### Phone Number Login
```typescript
// Frontend
const signInWithPhone = async (phone: string) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phone,
  });
  
  if (error) {
    toast.error('Failed to send OTP');
  } else {
    toast.success('Check your phone for OTP');
    // Show OTP input screen
  }
};

const verifyOtp = async (phone: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  
  if (error) {
    toast.error('Invalid OTP');
  } else {
    toast.success('Logged in successfully!');
  }
};
```

#### Rate Limiting
```typescript
// Add to server
import { rateLimiter } from "npm:hono-rate-limiter";

app.use(
  "/make-server-8234dc9e/*",
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later",
  })
);
```

---

## 📊 SUCCESS METRICS

### Week 1-2 Completion Criteria:
- [ ] Can send real messages between users
- [ ] Messages persist in database
- [ ] Real-time delivery works
- [ ] Typing indicators functional

### Week 3 Completion Criteria:
- [ ] Successfully process test payment
- [ ] Mobile money integration working
- [ ] Webhook receives payment confirmation
- [ ] Premium features activate after payment

### Week 4 Completion Criteria:
- [ ] NSFW images rejected
- [ ] Safe images approved
- [ ] Flagged images go to review queue
- [ ] 99% accuracy on test set

### Week 5 Completion Criteria:
- [ ] ID verification process works
- [ ] Video selfie liveness check passes
- [ ] Fake IDs rejected
- [ ] Real IDs approved

### Week 6 Completion Criteria:
- [ ] Email confirmation required
- [ ] Confirmation emails delivered
- [ ] Password reset works
- [ ] Unverified users can't use app

### Week 7 Completion Criteria:
- [ ] Legal documents reviewed by lawyer
- [ ] Zambian compliance confirmed
- [ ] Data export works
- [ ] Account deletion works

### Week 8 Completion Criteria:
- [ ] 50+ beta testers recruited
- [ ] Feedback collected
- [ ] Critical bugs fixed
- [ ] Zero crash rate

---

## 💰 BUDGET BREAKDOWN

### Required Services:
| Service | Monthly Cost | One-time Cost |
|---------|--------------|---------------|
| Flutterwave | 3% per transaction | FREE |
| AWS Rekognition | $20-50 | FREE (5000 free) |
| Veriff (verification) | $0 (pay per use) | $1-3 per verify |
| SendGrid (email) | $15-50 | FREE (100/day free) |
| Agora.io (video calls) | $0-100 | FREE (10k mins free) |
| Sentry (monitoring) | FREE | FREE |
| **Total Monthly** | **$35-200** | **Variable** |

### Additional Costs:
- Lawyer consultation: $500-1000 (one-time)
- Domain: $10-50/year
- Business registration: ~ZMW 1000 (one-time)
- Marketing (optional): $100-1000/month

**Total First 2 Months: $600-$2500**

---

## 🚨 RISK MITIGATION

### Risk: Beta users share explicit content
**Mitigation:** Image moderation MUST be complete before beta

### Risk: Payment fraud
**Mitigation:** Start with small amounts, monitor transactions

### Risk: Legal issues during beta
**Mitigation:** Clear beta disclaimer, legal review first

### Risk: Server overload
**Mitigation:** Start with 50 users, scale gradually

### Risk: Data breach
**Mitigation:** Security audit, encrypted storage

---

## ✅ LAUNCH CHECKLIST

### Pre-Beta (Week 1-7):
- [ ] Messaging works
- [ ] Payments work
- [ ] Image moderation active
- [ ] Verification process ready
- [ ] Email confirmation required
- [ ] Legal documents approved
- [ ] Data export/deletion works

### Beta Launch (Week 8):
- [ ] 50-100 testers recruited
- [ ] Feedback form ready
- [ ] Monitoring active (Sentry)
- [ ] Support email set up
- [ ] Beta disclaimer visible
- [ ] Daily bug fix schedule

### Public Launch (Week 10+):
- [ ] All beta feedback addressed
- [ ] Video calls working
- [ ] Phone login working
- [ ] Rate limiting active
- [ ] Marketing materials ready
- [ ] Support team ready
- [ ] Business registered
- [ ] Insurance obtained (optional)

---

## 📞 HELP RESOURCES

### Development:
- **Supabase:** https://discord.supabase.com
- **Flutterwave:** support@flutterwave.com
- **Agora:** https://agora.io/en/support/

### Legal:
- **PACRA:** https://www.pacra.org.zm
- **Zambian lawyer directory:** Search "tech lawyer Lusaka"

### Business:
- **BongoHive:** https://bongohive.co.zm
- **Seedstars Zambia:** https://www.seedstars.com/zambia

---

## 🎊 YOU CAN DO THIS!

This plan is aggressive but achievable. Stay focused on one week at a time.

**Week 1-2:** Messaging (CRITICAL)
**Week 3:** Payments (CRITICAL)
**Week 4:** Image moderation (CRITICAL)
**Week 5:** Verification (CRITICAL)
**Week 6:** Email/password (CRITICAL)
**Week 7:** Legal (CRITICAL)
**Week 8:** Beta testing

**After 8 weeks, you'll have a SAFE, LEGAL, FUNCTIONAL beta.**

---

**Questions?** Refer to PRODUCTION_READINESS_ASSESSMENT.md for details.
**Progress tracking:** Check off items as you complete them!
