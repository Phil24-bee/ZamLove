# Email Verification Setup Guide for ZamLove

This guide will walk you through setting up email verification in Supabase for production use.

## Why Email Verification?

Currently, your app auto-confirms emails (`email_confirm: true`) which is fine for development but **not recommended for production** because:
- Fake emails can be used
- No way to verify user owns the email
- Higher spam/abuse risk
- Can't send password reset emails

## Step-by-Step Setup

### Step 1: Choose an Email Provider

You need an SMTP provider to send emails. Here are the best options:

#### Option A: SendGrid (Recommended)
**Pros**: Free tier (100 emails/day), reliable, easy setup
**Pricing**: Free up to 100 emails/day, then $15/month for 50k emails

1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Verify your account
3. Go to Settings > API Keys
4. Create a new API key with "Mail Send" permissions
5. Save the API key (you'll need it)

#### Option B: Mailgun
**Pros**: Free tier (5,000 emails/month), good for high volume
**Pricing**: Free for 5k emails/month, then $35/month

1. Sign up at [https://mailgun.com](https://mailgun.com)
2. Add and verify your domain
3. Get SMTP credentials from dashboard

#### Option C: AWS SES
**Pros**: Very cheap, scalable
**Cons**: More complex setup, requires domain verification
**Pricing**: $0.10 per 1,000 emails

1. Sign up for AWS
2. Go to SES console
3. Verify domain or email
4. Get SMTP credentials

#### Option D: Resend (Modern Choice)
**Pros**: Developer-friendly, modern API
**Pricing**: Free for 100 emails/day

1. Sign up at [https://resend.com](https://resend.com)
2. Verify domain
3. Get API key

### Step 2: Configure Supabase SMTP Settings

1. Go to your Supabase Project Dashboard
2. Navigate to **Project Settings** (gear icon)
3. Click **Auth** in the sidebar
4. Scroll to **SMTP Settings**

#### For SendGrid:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@zamlove.com
Sender Name: ZamLove
```

#### For Mailgun:
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Your Mailgun SMTP username]
SMTP Password: [Your Mailgun SMTP password]
Sender Email: noreply@zamlove.com
Sender Name: ZamLove
```

#### For AWS SES:
```
SMTP Host: email-smtp.us-east-1.amazonaws.com
SMTP Port: 587
SMTP User: [Your AWS SES SMTP username]
SMTP Password: [Your AWS SES SMTP password]
Sender Email: noreply@zamlove.com
Sender Name: ZamLove
```

5. Click **Save**

### Step 3: Enable Email Confirmation

1. Still in **Auth** settings
2. Scroll to **Email Auth**
3. Toggle **Enable Email Confirmations** to ON
4. Set **Site URL** to your production domain: `https://zamlove.com`
5. Under **Redirect URLs**, add:
   - `https://zamlove.com/**`
   - `https://www.zamlove.com/**`
   - `https://your-project.vercel.app/**` (for testing)

6. Click **Save**

### Step 4: Customize Email Templates

1. In Supabase Dashboard, go to **Authentication** > **Email Templates**

#### Confirmation Email Template

```html
<h2 style="color: #EF7D00;">Welcome to ZamLove! 💚🧡❤️</h2>

<p>Hi there!</p>

<p>Thanks for signing up for ZamLove, Zambia's premier dating platform!</p>

<p>Click the button below to confirm your email address and start finding your perfect match:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #EF7D00; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;">
    Confirm Your Email
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours.</p>

<p>If you didn't create a ZamLove account, you can safely ignore this email.</p>

<hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

<p style="color: #666; font-size: 12px;">
  This email was sent by ZamLove<br>
  Find love in Zambia 💚
</p>
```

#### Password Reset Email Template

```html
<h2 style="color: #EF7D00;">Reset Your ZamLove Password</h2>

<p>Hi there!</p>

<p>We received a request to reset your password for your ZamLove account.</p>

<p>Click the button below to reset your password:</p>

<p style="text-align: center; margin: 30px 0;">
  <a href="{{ .ConfirmationURL }}" 
     style="background-color: #198A00; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            display: inline-block;">
    Reset Password
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 1 hour.</p>

<p>If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>

<hr style="border: none; border-top: 1px solid #ccc; margin: 30px 0;">

<p style="color: #666; font-size: 12px;">
  This email was sent by ZamLove<br>
  For support, contact support@zamlove.com
</p>
```

### Step 5: Update Your Server Code

Remove the `email_confirm: true` line from `/supabase/functions/server/index.tsx`:

**Before (Line 140-146):**
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { name, age, city },
  // Automatically confirm the user's email since an email server hasn't been configured.
  email_confirm: true,
});
```

**After:**
```typescript
const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  user_metadata: { name, age, city },
});
```

Also update the comment or remove it entirely since you're now properly configured!

### Step 6: Update Frontend to Handle Unconfirmed Users

Add a message for users who haven't confirmed their email yet. Update your Login component:

```typescript
// After successful login but before redirecting
const { data: { session }, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  if (error.message.includes('Email not confirmed')) {
    toast.error('Please confirm your email before logging in. Check your inbox!');
  } else {
    toast.error(error.message);
  }
  return;
}
```

### Step 7: Add Resend Confirmation Feature

Add a button for users to resend their confirmation email:

```typescript
async function resendConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
  
  if (error) {
    toast.error('Failed to resend confirmation email');
  } else {
    toast.success('Confirmation email sent! Check your inbox.');
  }
}
```

### Step 8: Test the Flow

1. **Sign up with a real email**
   - You should receive a confirmation email
   - Click the link in the email
   - You should be redirected to your app

2. **Try to log in without confirming**
   - Should show error message

3. **Test password reset**
   - Request password reset
   - Check email
   - Click link and reset password
   - Log in with new password

### Step 9: Domain Verification (Important!)

For production, verify your sender domain to avoid spam filters:

#### For SendGrid:
1. Go to Settings > Sender Authentication
2. Click "Authenticate Your Domain"
3. Add the DNS records to your domain provider
4. Wait for verification (can take up to 48 hours)

#### For Mailgun:
1. Go to Sending > Domains
2. Add your domain
3. Add DNS records (MX, TXT, CNAME)
4. Verify domain

#### For AWS SES:
1. Go to Verified Identities
2. Create Identity > Domain
3. Add DNS records
4. Verify domain

**DNS Records Example (for zamlove.com):**
```
Type: TXT
Name: _domainkey.zamlove.com
Value: [Provided by email provider]

Type: CNAME
Name: em123.zamlove.com
Value: [Provided by email provider]

Type: TXT
Name: zamlove.com
Value: v=spf1 include:sendgrid.net ~all
```

## Testing Checklist

- [ ] Sign up with new email
- [ ] Receive confirmation email within 1 minute
- [ ] Click confirmation link
- [ ] Successfully redirected to app
- [ ] Can log in after confirmation
- [ ] Cannot log in before confirmation
- [ ] Password reset email works
- [ ] Reset link expires after time limit
- [ ] Email doesn't go to spam folder
- [ ] Email renders correctly on mobile
- [ ] Email renders correctly in Gmail
- [ ] Email renders correctly in Outlook

## Troubleshooting

### Emails Not Sending
1. Check SMTP credentials are correct
2. Verify sender email is verified
3. Check Supabase logs for errors
4. Ensure SMTP port is not blocked (try 465 or 2525)

### Emails Going to Spam
1. Verify your domain with email provider
2. Set up SPF record
3. Set up DKIM record
4. Set up DMARC record
5. Use a professional sender email (not gmail.com)

### Confirmation Link Not Working
1. Check Site URL in Supabase settings
2. Verify Redirect URLs are correct
3. Check browser console for errors
4. Ensure HTTPS is enabled

### Email Looks Broken
1. Test with [Litmus](https://www.litmus.com/) or [Email on Acid](https://www.emailonacid.com/)
2. Use inline styles (not CSS classes)
3. Keep layout simple
4. Test on multiple email clients

## Email Sending Limits

Be aware of limits:

- **SendGrid Free**: 100 emails/day
- **SendGrid Essentials**: 50k emails/month ($15/mo)
- **Mailgun Free**: 5k emails/month
- **AWS SES**: 62k emails/month free (if from EC2)

For ZamLove, estimate:
- 100 signups/day = 100 confirmation emails
- 10 password resets/day = 10 emails
- **Total: ~110 emails/day**

Start with free tier, upgrade as you grow!

## Best Practices

1. **Use a dedicated sender email**: noreply@zamlove.com
2. **Include unsubscribe link** (for marketing emails)
3. **Keep emails mobile-friendly**
4. **Use clear call-to-action buttons**
5. **Include plain text version**
6. **Monitor email delivery rates**
7. **Handle bounces and complaints**
8. **Don't send too many emails**

## Monitoring

Track these metrics:
- Delivery rate (should be > 95%)
- Open rate (should be > 20%)
- Click rate (should be > 10%)
- Bounce rate (should be < 5%)
- Complaint rate (should be < 0.1%)

Most email providers give you these stats in their dashboard.

## Advanced: Transactional Emails

Later, you might want to send:
- Welcome emails after email confirmation
- Match notification emails
- Weekly activity summaries
- Re-engagement emails

Consider using [Resend](https://resend.com) or [Loops](https://loops.so) for more advanced email features.

## Support

If you run into issues:
- SendGrid Support: https://support.sendgrid.com
- Mailgun Support: https://help.mailgun.com
- Supabase Discord: https://discord.supabase.com
- Email me: [Your support email]

---

## Summary

✅ Choose email provider (SendGrid recommended)
✅ Configure SMTP in Supabase
✅ Enable email confirmations
✅ Customize email templates
✅ Update server code
✅ Verify domain
✅ Test thoroughly
✅ Monitor delivery

**You're now ready for production email verification! 📧✨**
