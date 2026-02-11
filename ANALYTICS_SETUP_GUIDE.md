# User Tracking & Analytics Setup Guide

## Overview

This guide will help you set up user tracking on your website so you can see:
- How many people visit your site
- Which pages they view
- Where they come from (Google, social media, etc.)
- What buttons they click
- How long they stay
- And much more!

**All data is private and only you can see it.**

---

## Step 1: Set Up Google Analytics 4 (Recommended)

### Why Google Analytics?
- ✅ Free
- ✅ Industry standard
- ✅ Comprehensive data
- ✅ Only you can access it (with your Google account)
- ✅ Easy to set up

### Setup Steps:

1. **Create Google Analytics Account**
   - Go to: https://analytics.google.com/
   - Sign in with your Google account
   - Click "Start measuring"

2. **Create a Property**
   - Property name: "mindcove.io" or "Career Confidence Kit"
   - Time zone: (Asia/Kolkata)
   - Currency: INR

3. **Get Your Measurement ID**
   - After creating property, you'll get a Measurement ID
   - Format: `G-XXXXXXXXXX` (starts with G-)
   - **Copy this ID - you'll need it!**

4. **Add to Your Website**
   - Create a `.env` file in the root directory
   - Add: `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` (replace with your actual ID)
   - OR directly edit `src/main.tsx` and replace the empty string with your ID
   - The tracking will automatically start working

---

## Step 2: Add Tracking Code to HTML

The tracking code needs to be added to your `index.html` file.

### Option A: Add via React (Recommended - Already Set Up)

The tracking is set up in `src/lib/analytics.ts` and will be initialized automatically.

### Option B: Add Directly to HTML

If you prefer, you can also add it directly to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Step 3: Enable Event Tracking

The following events are already set up to track:

### Automatic Tracking:
- ✅ Page views
- ✅ Button clicks (Purchase buttons)
- ✅ WhatsApp clicks
- ✅ Scroll depth
- ✅ Time on page

### Manual Events You Can Add:

```typescript
// Track when someone views pricing
trackEvent("view_pricing");

// Track when FAQ is opened
trackEvent("faq_opened");

// Track when testimonial is viewed
trackEvent("testimonial_viewed");
```

---

## Step 4: View Your Data

### Access Google Analytics:
1. Go to: https://analytics.google.com/
2. Select your property
3. View reports:
   - **Realtime**: See who's on your site right now
   - **Acquisition**: Where visitors come from
   - **Engagement**: What they do on your site
   - **Monetization**: Purchase events (if configured)

### Key Metrics to Watch:
- **Users**: Total visitors
- **Sessions**: Total visits
- **Page views**: How many pages viewed
- **Bounce rate**: % who leave immediately
- **Average session duration**: How long they stay
- **Conversion events**: Button clicks, purchases

---

## Privacy & Legal Considerations

### Important:
1. **Privacy Policy**: You should have a privacy policy mentioning analytics
2. **GDPR/CCPA**: If you have EU/California visitors, you may need cookie consent
3. **Cookie Notice**: Consider adding a cookie banner (optional for now)

### What Data is Collected:
- IP addresses (anonymized by default)
- Browser type
- Device type
- Pages visited
- Time on site
- Referral sources

### What is NOT Collected:
- Personal names
- Email addresses
- Phone numbers
- Exact location (only general location)

---

## Alternative: Simple Custom Tracking (No Google Account Needed)

If you don't want to use Google Analytics, you can set up a simple custom tracking system that sends data to your own endpoint.

### Option: Custom Analytics Endpoint

You would need:
1. A backend server to receive tracking data
2. A database to store it
3. A dashboard to view it

This is more complex but gives you full control.

---

## Quick Start (5 Minutes)

1. ✅ Go to https://analytics.google.com/
2. ✅ Create account → Create property → Get Measurement ID
3. ✅ Open `src/lib/analytics.ts`
4. ✅ Replace `G-XXXXXXXXXX` with your Measurement ID (3 places)
5. ✅ Deploy your site
6. ✅ Wait 24-48 hours for data to appear

---

## Testing Your Tracking

### Test in Real-time:
1. Go to Google Analytics
2. Click "Realtime" in left sidebar
3. Visit your website
4. You should see yourself appear in real-time (within seconds)

### Test Events:
- Click purchase buttons → Check "Events" in Analytics
- Click WhatsApp button → Check "Events" in Analytics
- Scroll down page → Check "Events" in Analytics

---

## What You'll See in Analytics

### Realtime Report:
- Active users right now
- Top pages being viewed
- Traffic sources
- Geographic locations

### Standard Reports:
- **Users**: Total unique visitors
- **New vs Returning**: How many are new
- **Acquisition**: Google, Direct, Social, etc.
- **Behavior**: Most viewed pages
- **Conversions**: Button clicks, purchases

### Custom Reports:
You can create custom reports for:
- Purchase button click rate
- FAQ section engagement
- Testimonial views
- Scroll depth analysis

---

## Security & Access Control

### Who Can See Your Data:
- **Only you** (and anyone you explicitly share access with)
- You control access via Google Analytics settings
- Data is stored securely by Google
- You can revoke access anytime

### To Share Access (Optional):
1. Go to Admin → Property Access Management
2. Click "+" → Add users
3. Set permission level (Viewer, Editor, Admin)

---

## Troubleshooting

### No Data Showing?
- ✅ Check Measurement ID is correct
- ✅ Wait 24-48 hours (can take time)
- ✅ Check Realtime report (shows immediately)
- ✅ Verify code is deployed
- ✅ Check browser console for errors

### Events Not Tracking?
- ✅ Check browser console for errors
- ✅ Verify `trackEvent` function is called
- ✅ Check Google Analytics DebugView

---

## Next Steps

1. ✅ Set up Google Analytics account
2. ✅ Add Measurement ID to code
3. ✅ Deploy and test
4. ✅ Set up conversion goals (purchase clicks)
5. ✅ Create custom reports
6. ✅ Set up email reports (weekly/monthly summaries)

---

## Support

If you need help:
- Google Analytics Help: https://support.google.com/analytics
- Analytics Academy: https://analytics.google.com/analytics/academy/

---

**Remember**: All tracking data is private and only accessible to you through your Google account.

