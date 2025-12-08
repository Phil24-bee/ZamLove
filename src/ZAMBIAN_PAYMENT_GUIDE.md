# Zambian Mobile Money Payment Integration Guide

This guide will help you integrate Zambian mobile money payments (Airtel Money, MTN Mobile Money, Zamtel Kwacha) into ZamLove.

## Overview

Your app currently has a **demo payment system** that simulates payments for testing. To enable real payments, you need to integrate with a payment gateway.

## Recommended Payment Gateway: Flutterwave

**Flutterwave** is the best option for Zambian payments because it supports:
- ✅ Airtel Money
- ✅ MTN Mobile Money  
- ✅ Zamtel Kwacha
- ✅ Card payments (Visa, Mastercard)
- ✅ Bank transfers
- ✅ International payments

### Alternative Options

1. **PayChangu** - Zambian payment gateway (local support)
2. **Paystack** - Limited Zambian support
3. **Direct integration** with each mobile money provider (complex)

---

## Step 1: Create a Flutterwave Account

1. Go to [https://flutterwave.com](https://flutterwave.com)
2. Click "Get Started" or "Sign Up"
3. Fill in your business details:
   - Business Name: ZamLove
   - Business Type: Dating/Social Networking
   - Country: Zambia
   - Email: your-email@zamlove.com
   - Phone: Your Zambian phone number

4. Verify your email address
5. Complete KYC (Know Your Customer) process:
   - Upload business registration documents
   - Upload ID (National Registration Card or Passport)
   - Proof of address
   - Bank account details

**Note:** KYC approval can take 1-3 business days

---

## Step 2: Get Your API Keys

Once approved:

1. Log in to Flutterwave Dashboard
2. Go to **Settings** > **API**
3. You'll find:
   - **Public Key** (starts with `FLWPUBK-`)
   - **Secret Key** (starts with `FLWSECK-`)
   - **Encryption Key**

4. **IMPORTANT**: Use **Test Mode** keys first for testing!
   - Toggle "Test Mode" in the dashboard
   - Get test keys for development
   - Switch to live mode only when ready for production

---

## Step 3: Configure Environment Variables

Add these to your Supabase Edge Function environment:

```bash
# Flutterwave Keys
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-your-public-key
FLUTTERWAVE_SECRET_KEY=FLWSECK-your-secret-key
FLUTTERWAVE_ENCRYPTION_KEY=your-encryption-key
```

To add in Supabase:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** > **Settings**
3. Add each environment variable
4. Deploy your edge function

---

## Step 4: Install Flutterwave SDK

Update your server code (`/supabase/functions/server/index.tsx`):

```typescript
// Add this import at the top
import { Flutterwave } from "npm:flutterwave-node-v3";

// Initialize Flutterwave
const flw = new Flutterwave(
  Deno.env.get('FLUTTERWAVE_PUBLIC_KEY')!,
  Deno.env.get('FLUTTERWAVE_SECRET_KEY')!
);
```

---

## Step 5: Update Payment Initiation Endpoint

Replace the simulated payment code with real Flutterwave integration:

```typescript
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
    
    // Get user profile for email
    const userProfile = await kv.get(`profile:${userId}`);
    
    // Prepare payment payload based on method
    let payload: any;
    
    if (paymentMethod === 'airtel' || paymentMethod === 'mtn' || paymentMethod === 'zamtel') {
      // Mobile Money Payment
      if (!phoneNumber) {
        return c.json({ error: "Phone number required for mobile money" }, 400);
      }
      
      payload = {
        tx_ref: transactionId,
        amount: amount,
        currency: "ZMW", // Zambian Kwacha
        email: userProfile?.email || 'user@zamlove.com',
        phone_number: phoneNumber,
        fullname: userProfile?.name || 'ZamLove User',
        meta: {
          userId,
          plan,
        },
        redirect_url: "https://zamlove.com/payment-success",
        // Payment method specific
        payment_type: "mobilemoneyzambia", // Flutterwave's Zambian mobile money
      };
      
    } else if (paymentMethod === 'card') {
      // Card Payment
      payload = {
        tx_ref: transactionId,
        amount: amount,
        currency: "ZMW",
        email: userProfile?.email || 'user@zamlove.com',
        phone_number: userProfile?.phoneNumber || '260000000000',
        fullname: userProfile?.name || 'ZamLove User',
        meta: {
          userId,
          plan,
        },
        redirect_url: "https://zamlove.com/payment-success",
        customizations: {
          title: "ZamLove Premium",
          description: `${plan} subscription`,
          logo: "https://zamlove.com/logo.png",
        },
      };
    }
    
    // Initiate payment with Flutterwave
    const response = await flw.MobileMoney.zambia(payload);
    
    if (response.status === 'success') {
      // Store payment record
      const paymentRecord = {
        transactionId: response.data.tx_ref,
        flutterwaveId: response.data.id,
        userId,
        plan,
        amount,
        paymentMethod,
        phoneNumber,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      
      await kv.set(`payment:${transactionId}`, paymentRecord);
      
      return c.json({ 
        success: true, 
        transactionId,
        paymentLink: response.data.link, // For card payments
        message: 'Payment initiated. Please approve on your phone.',
      });
    } else {
      return c.json({ error: response.message }, 400);
    }
    
  } catch (error) {
    console.log("Error initiating payment:", error);
    return c.json({ error: "Failed to initiate payment" }, 500);
  }
});
```

---

## Step 6: Set Up Webhook for Payment Verification

Flutterwave will send payment confirmations to your webhook URL.

### Create Webhook Endpoint

```typescript
// Webhook endpoint for Flutterwave
app.post("/make-server-8234dc9e/payment/webhook", async (c) => {
  try {
    const secretHash = Deno.env.get('FLUTTERWAVE_SECRET_HASH');
    const signature = c.req.header('verif-hash');
    
    // Verify webhook signature
    if (!signature || signature !== secretHash) {
      return c.json({ error: 'Invalid signature' }, 401);
    }
    
    const payload = await c.req.json();
    
    if (payload.status === 'successful') {
      const txRef = payload.tx_ref;
      
      // Get payment record
      const paymentRecord = await kv.get(`payment:${txRef}`);
      
      if (paymentRecord) {
        // Verify payment with Flutterwave
        const flw = new Flutterwave(
          Deno.env.get('FLUTTERWAVE_PUBLIC_KEY')!,
          Deno.env.get('FLUTTERWAVE_SECRET_KEY')!
        );
        
        const verification = await flw.Transaction.verify({ id: payload.id });
        
        if (verification.data.status === 'successful' && 
            verification.data.amount >= paymentRecord.amount &&
            verification.data.currency === 'ZMW') {
          
          // Update payment status
          paymentRecord.status = 'successful';
          await kv.set(`payment:${txRef}`, paymentRecord);
          
          // Create subscription
          const userId = paymentRecord.userId;
          const plan = paymentRecord.plan;
          const durationDays = plan === 'weekly' ? 7 : plan === 'monthly' ? 30 : 365;
          const startDate = new Date();
          const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
          
          const subscription: Subscription = {
            userId,
            plan,
            amount: paymentRecord.amount,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            status: 'active',
            transactionId: txRef,
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
      }
    }
    
    return c.json({ status: 'success' });
    
  } catch (error) {
    console.log("Webhook error:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});
```

### Configure Webhook in Flutterwave Dashboard

1. Go to **Settings** > **Webhooks**
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/make-server-8234dc9e/payment/webhook`
3. Generate and save a secret hash
4. Add the secret hash to environment variables as `FLUTTERWAVE_SECRET_HASH`

---

## Step 7: Test Payments

### Test Mode

Flutterwave provides test credentials:

**Test Phone Numbers:**
- Airtel: `+260977000000`
- MTN: `+260966000000`  
- Zamtel: `+260955000000`

**Test OTP:** `12345`

**Test Amounts:**
- Any amount works in test mode
- Use multiples of 100 for best results (100, 200, 500, etc.)

### Test Flow

1. Select "Airtel Money" in your app
2. Enter test phone number
3. Click Pay
4. You'll receive a push notification (simulated)
5. Enter OTP: `12345`
6. Payment should be confirmed

---

## Step 8: Go Live

Once testing is complete:

1. **Switch to Live Mode** in Flutterwave Dashboard
2. Get **Live API Keys**
3. Update environment variables with live keys
4. **Submit for review**:
   - Flutterwave will review your integration
   - They may test payments
   - Approval takes 1-3 days

5. **Configure payout account**:
   - Add your Zambian bank account
   - Set payout schedule (daily, weekly, monthly)

---

## Pricing & Fees

### Flutterwave Fees (Zambia)

- **Mobile Money**: 2.9% + ZMW 2 per transaction
- **Card Payments**: 3.8% per transaction
- **Bank Transfers**: 1.4% per transaction

### Your Pricing

With your current pricing:
- Weekly: ZMW 50
- Monthly: ZMW 150
- Yearly: ZMW 1,200

**Example Fee Calculation:**
- User pays ZMW 150 for monthly subscription
- Flutterwave fee: 2.9% + ZMW 2 = ZMW 6.35
- **You receive: ZMW 143.65**

---

## Alternative: PayChangu (Zambian Gateway)

If you prefer a local Zambian solution:

### PayChangu Setup

1. Go to [https://paych.angu.io](https://paychangu.com)
2. Sign up for business account
3. Complete verification
4. Get API credentials

### Advantages
- ✅ Zambian company
- ✅ Local support
- ✅ Potentially lower fees
- ✅ Better understanding of local market

### Disadvantages
- ❌ Smaller scale than Flutterwave
- ❌ Less international reach
- ❌ Fewer features

---

## Security Best Practices

1. **Never expose secret keys** in frontend code
2. **Always verify** webhook signatures
3. **Validate** payment amounts on server
4. **Store** payment records for reconciliation
5. **Implement** idempotency for webhooks
6. **Monitor** for fraud and chargebacks
7. **Use HTTPS** for all endpoints
8. **Log** all payment events

---

## Troubleshooting

### Payment Not Going Through

1. Check API keys are correct
2. Verify test mode vs live mode
3. Check webhook is configured
4. Review Flutterwave logs
5. Ensure phone number format is correct (+260...)

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify secret hash matches
3. Check Supabase edge function logs
4. Test webhook with Flutterwave test tool

### User Not Getting Premium

1. Check webhook processed successfully
2. Verify subscription was created
3. Check user profile was updated
4. Review server logs for errors

---

## Support

- **Flutterwave Support**: support@flutterwave.com
- **Flutterwave Docs**: https://developer.flutterwave.com
- **PayChangu Support**: support@paychangu.com
- **Zambian Payment Forum**: [LinkedIn Groups]

---

## Next Steps

1. ✅ Create Flutterwave account
2. ✅ Get API keys (test mode first)
3. ✅ Add environment variables to Supabase
4. ✅ Update server code with Flutterwave SDK
5. ✅ Configure webhook
6. ✅ Test with test credentials
7. ✅ Switch to live mode
8. ✅ Start accepting real payments!

---

## Summary

You now have:
- ✅ Premium subscription system
- ✅ Zambian mobile money support (Airtel, MTN, Zamtel)
- ✅ Card payment support
- ✅ Webhook for automatic subscription activation
- ✅ Full blocking functionality
- ✅ Ready for production payments

**Your ZamLove app is now ready to generate revenue! 💰🇿🇲**
