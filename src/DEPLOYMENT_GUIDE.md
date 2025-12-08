# ZamLove Deployment Guide

This guide will help you deploy ZamLove to production and configure all necessary services.

## Table of Contents
1. [Vercel Deployment](#vercel-deployment)
2. [Supabase Email Verification](#supabase-email-verification)
3. [Custom Domain Setup](#custom-domain-setup)
4. [Production Checklist](#production-checklist)

---

## Vercel Deployment

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier is sufficient)

### Step 1: Push Your Code to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - ZamLove dating app"
```

2. Create a new repository on GitHub and push:
```bash
git remote add origin https://github.com/yourusername/zamlove.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Vite
   - **Root Directory**: ./
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)

5. Add Environment Variables (Click "Environment Variables"):
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

6. Click "Deploy"

Your app will be live at `https://your-project-name.vercel.app`

### Step 3: Configure Vercel for Supabase Edge Functions

Since your backend uses Supabase Edge Functions, ensure:
- Your Supabase project is properly configured
- Environment variables are set in Supabase dashboard
- Edge functions are deployed to Supabase (not Vercel)

---

## Supabase Email Verification

Currently, your app auto-confirms emails (`email_confirm: true`). For production, you should enable proper email verification.

### Step 1: Configure Email Provider

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Email Templates**
3. Choose an email provider:

#### Option A: Use Supabase's Built-in SMTP (Recommended for Testing)
- Supabase provides 3 emails/hour on free tier
- Good for testing, not recommended for production

#### Option B: Configure Custom SMTP (Recommended for Production)
1. Navigate to **Project Settings** > **Auth** > **SMTP Settings**
2. Choose a provider (SendGrid, Mailgun, AWS SES, etc.)

**Example with SendGrid:**
- Sign up at [https://sendgrid.com](https://sendgrid.com)
- Create an API key
- In Supabase SMTP settings:
  - **SMTP Host**: smtp.sendgrid.net
  - **SMTP Port**: 587
  - **SMTP User**: apikey
  - **SMTP Password**: Your SendGrid API key
  - **Sender Email**: noreply@yourdomain.com
  - **Sender Name**: ZamLove

### Step 2: Enable Email Confirmation

1. In Supabase Dashboard, go to **Authentication** > **Settings**
2. Enable **"Enable email confirmations"**
3. Set **"Site URL"** to your production domain (e.g., `https://zamlove.com`)
4. Add **Redirect URLs**:
   - `https://zamlove.com/**`
   - `https://your-project.vercel.app/**`

### Step 3: Update Server Code

Remove `email_confirm: true` from `/supabase/functions/server/index.tsx`:

```typescript
// Before (Line 145):
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { name, age, city },
  email_confirm: true, // REMOVE THIS LINE
});

// After:
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { name, age, city },
});
```

### Step 4: Customize Email Templates

1. Go to **Authentication** > **Email Templates**
2. Customize templates for:
   - Confirm signup
   - Reset password
   - Change email

**Example Confirmation Email:**
```html
<h2>Welcome to ZamLove!</h2>
<p>Click the link below to confirm your email address:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create an account, you can safely ignore this email.</p>
```

---

## Custom Domain Setup

### Step 1: Purchase a Domain

Purchase a domain from:
- Namecheap
- GoDaddy
- Google Domains
- Cloudflare

Suggested domains:
- zamlove.com
- zamlove.co.zm (Zambian domain)
- zamlove.app

### Step 2: Add Domain to Vercel

1. In Vercel dashboard, go to your project
2. Click **Settings** > **Domains**
3. Click **Add Domain**
4. Enter your domain (e.g., `zamlove.com`)
5. Vercel will provide DNS records to add

### Step 3: Configure DNS Records

Add the following records to your domain provider:

**For Root Domain (zamlove.com):**
- Type: A
- Name: @
- Value: 76.76.21.21

**For WWW Subdomain (www.zamlove.com):**
- Type: CNAME
- Name: www
- Value: cname.vercel-dns.com

**Wait 24-48 hours** for DNS propagation (usually faster).

### Step 4: Enable SSL

Vercel automatically provisions SSL certificates. Once DNS is configured:
1. Your site will be available at `https://zamlove.com`
2. Vercel will redirect HTTP to HTTPS automatically

### Step 5: Update Supabase Settings

1. Go to Supabase Dashboard > **Authentication** > **URL Configuration**
2. Update **Site URL** to your custom domain: `https://zamlove.com`
3. Add redirect URL: `https://zamlove.com/**`

---

## Production Checklist

Before launching to real users, complete this checklist:

### Security
- [ ] Remove `email_confirm: true` and enable proper email verification
- [ ] Review and expand content moderation list
- [ ] Enable rate limiting in Supabase
- [ ] Set up RLS (Row Level Security) policies in Supabase
- [ ] Review all API endpoints for authentication checks
- [ ] Enable CAPTCHA on signup (optional but recommended)

### Performance
- [ ] Test on multiple devices (mobile, tablet, desktop)
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Optimize images (compress profile images)
- [ ] Set up CDN for static assets (Vercel does this automatically)
- [ ] Monitor performance with Vercel Analytics

### Legal & Compliance
- [ ] Ensure Terms of Service are up to date
- [ ] Ensure Privacy Policy is up to date
- [ ] Add cookie consent banner (if using analytics)
- [ ] Ensure compliance with data protection laws (GDPR, etc.)
- [ ] Set up data retention policies
- [ ] Create content reporting workflow

### Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Configure Vercel Analytics
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Create admin dashboard for reports/moderation

### Social Features
- [ ] Test matching algorithm with real data
- [ ] Test personality compatibility scoring
- [ ] Test location-based matching
- [ ] Verify image upload and storage works
- [ ] Test blocking and reporting features

### Email & Notifications
- [ ] Test signup confirmation emails
- [ ] Test password reset emails
- [ ] Set up notification emails for matches (optional)
- [ ] Configure email sending limits

### Payment (If implementing premium features)
- [ ] Integrate payment provider (Stripe, PayPal)
- [ ] Set up subscription management
- [ ] Create pricing tiers
- [ ] Test payment flow

---

## Environment Variables Reference

### Vercel Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Edge Functions (Configured in Supabase Dashboard)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DB_URL=postgresql://...
```

---

## Troubleshooting

### "Function not found" errors
- Ensure Supabase Edge Functions are deployed
- Check function names match in code
- Verify CORS configuration

### Email not sending
- Check SMTP configuration in Supabase
- Verify sender email is verified
- Check spam folder
- Review Supabase logs

### Domain not working
- Wait for DNS propagation (up to 48 hours)
- Verify DNS records are correct
- Clear browser cache
- Try incognito/private mode

### Images not loading
- Check Supabase Storage bucket exists
- Verify bucket is private (using signed URLs)
- Check file size limits
- Review CORS settings in Storage

---

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Documentation**: https://react.dev

---

## Next Steps

After deployment:
1. Monitor user signups and activity
2. Collect user feedback
3. Iterate on features
4. Expand to more Zambian cities
5. Consider mobile app (React Native)
6. Implement premium features
7. Build community features

Good luck with your launch! 🚀❤️
