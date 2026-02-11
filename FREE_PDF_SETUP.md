# Free PDF Email Capture Setup Guide

## Overview
The Free PDF Download component has been added to your site. It captures user emails before providing access to a free PDF download.

## Component Location
- **Component File**: `src/components/FreePDFDownload.tsx`
- **Page**: Added to `src/pages/Index.tsx` (between ATS Analyzer and Pricing sections)

## Quick Setup

### 1. Add Your PDF URL

Open `src/pages/Index.tsx` and find the `<FreePDFDownload />` component. Update the `pdfUrl` prop:

```tsx
<FreePDFDownload
  pdfUrl="https://your-pdf-url.com/path/to/file.pdf" // ← Update this
  pdfTitle="Free Resume Template & Interview Prep Guide"
  description="Get instant access to our free ATS-optimized resume template..."
/>
```

**PDF Hosting Options:**
- **Google Drive**: Upload PDF → Right-click → Get link → Change to "Anyone with the link can view" → Copy link
- **Dropbox**: Upload PDF → Share → Copy link → Change `?dl=0` to `?dl=1` for direct download
- **AWS S3 / Cloud Storage**: Upload and get public URL
- **Your own server**: Host PDF in `/public` folder and use `/your-file.pdf`

### 2. Customize Content (Optional)

You can customize the component by updating these props:

```tsx
<FreePDFDownload
  pdfUrl="YOUR_PDF_URL"
  pdfTitle="Your Custom Title"           // Default: "Free Resume Template & Interview Prep Guide"
  description="Your custom description"  // Default: Shows standard description
/>
```

## Email Storage

### Current Implementation
- Emails are stored in **localStorage** (browser storage)
- Users who already submitted won't see the form again (on same device/browser)
- No backend required for basic functionality

### Viewing Captured Emails

To view captured emails, open browser console (F12) and run:
```javascript
JSON.parse(localStorage.getItem("freePdfEmails") || "[]")
```

## Email Service Integration (Optional)

### Option 1: Add Backend API Endpoint

In `src/components/FreePDFDownload.tsx`, find the `onSubmit` function and uncomment/add:

```typescript
// Send email to your backend
await fetch('/api/capture-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: data.email,
    source: 'free_pdf_download',
    timestamp: new Date().toISOString(),
  })
});
```

### Option 2: Integrate with Email Services

#### Mailchimp Integration
```typescript
// Install: npm install @mailchimp/mailchimp_marketing
import mailchimp from '@mailchimp/mailchimp_marketing';

mailchimp.setConfig({
  apiKey: 'YOUR_API_KEY',
  server: 'YOUR_SERVER_PREFIX', // e.g., 'us1'
});

await mailchimp.lists.addListMember('YOUR_LIST_ID', {
  email_address: data.email,
  status: 'subscribed',
});
```

#### ConvertKit Integration
```typescript
await fetch(`https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: 'YOUR_API_KEY',
    email: data.email,
  })
});
```

#### SendGrid Integration
```typescript
// Install: npm install @sendgrid/mail
import sgMail from '@sendgrid/mail';

sgMail.setApiKey('YOUR_SENDGRID_API_KEY');

await sgMail.send({
  to: 'your-email@example.com',
  from: 'noreply@yourdomain.com',
  subject: 'New Free PDF Download',
  text: `New email captured: ${data.email}`,
});
```

### Option 3: Use Vercel Serverless Functions

Create `api/capture-email.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Add to your email service here
  // Example: Add to Mailchimp, SendGrid, etc.

  return res.status(200).json({ success: true });
}
```

Then update the component to call:
```typescript
await fetch('/api/capture-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: data.email }),
});
```

## Analytics Tracking

The component automatically tracks these events:
- `free_pdf_email_captured` - When email is submitted
- `free_pdf_download_ready` - When download link is shown
- `free_pdf_downloaded` - When PDF is downloaded
- `free_pdf_upsell_click` - When user clicks upsell button

All events are sent to Google Analytics (if configured).

## Customization

### Change Colors/Styling
Edit `src/components/FreePDFDownload.tsx`:
- Update Tailwind classes for colors
- Modify button styles
- Change layout/spacing

### Change Position on Page
In `src/pages/Index.tsx`, move the `<FreePDFDownload />` component:
- Before hero section (top of page)
- After hero section (high visibility)
- After testimonials (social proof first)
- Before pricing (lead magnet before sale)

### Add More Fields
To capture name or other info, update the schema:

```typescript
const emailSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, "Name must be at least 2 characters"), // Add this
});
```

Then add input field in the form JSX.

## Testing

1. **Test Email Validation**
   - Try invalid emails (should show error)
   - Try valid emails (should submit)

2. **Test Download**
   - Submit email
   - Click download button
   - Verify PDF opens/downloads

3. **Test Returning Users**
   - Submit email once
   - Refresh page
   - Should see download section (not form)

4. **Test on Mobile**
   - Verify form looks good on mobile
   - Test button sizes and spacing

## Troubleshooting

### PDF Not Downloading
- Check PDF URL is accessible (open in new tab)
- Verify URL is correct (no typos)
- Check if PDF hosting allows direct downloads

### Emails Not Storing
- Check browser console for errors
- Verify localStorage is enabled
- Check if browser allows localStorage

### Form Not Submitting
- Check browser console for validation errors
- Verify email format is correct
- Check network tab for API errors (if using backend)

## Next Steps

1. ✅ Add your PDF URL
2. ✅ Test the component
3. ⬜ Set up email service integration (optional)
4. ⬜ Customize styling/content (optional)
5. ⬜ Deploy and monitor email captures

## Support

If you need help:
- Check browser console for errors
- Verify all dependencies are installed: `npm install`
- Ensure PDF URL is publicly accessible
- Test in incognito mode (to test without stored email)
