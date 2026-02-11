# Vercel Deployment Guide

## Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Configure for Vercel deployment"
   git push
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Click "New Project"** → Import your repository

4. **Vercel will auto-detect:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Click "Deploy"** and wait for the build to complete

6. **Once deployed**, you'll get a URL like: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time will ask questions)
vercel

# For production deployment
vercel --prod
```

## Troubleshooting

### Issue: "Nothing is showing" / Blank Page

**Possible Causes & Solutions:**

1. **Build Failed**
   - Check the Vercel deployment logs
   - Look for errors in the "Build Logs" tab
   - Common issues:
     - Missing dependencies
     - TypeScript errors
     - Build script errors

2. **JavaScript Errors**
   - Open browser console (F12)
   - Check for runtime errors
   - Common issues:
     - Missing environment variables
     - API endpoint errors
     - Import path issues

3. **Routing Issues**
   - Verify `vercel.json` exists with correct rewrites
   - Check that React Router is configured correctly
   - Ensure all routes redirect to `/index.html`

4. **Static Assets Not Loading**
   - Check browser Network tab (F12)
   - Verify asset paths are correct
   - Ensure `dist` folder contains all assets

### Issue: "Visit Button Not Clickable"

This usually means:
- **Deployment is still building** - Wait for build to complete
- **Deployment failed** - Check build logs
- **Browser issue** - Try different browser or incognito mode

### Issue: Build Fails

**Check Build Logs for:**
- Missing dependencies → Run `npm install` locally and commit `package-lock.json`
- TypeScript errors → Fix TypeScript errors before deploying
- Environment variables → Set them in Vercel dashboard under Settings → Environment Variables

### Issue: 404 Errors on Routes

**Solution:** Ensure `vercel.json` has the correct rewrites:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Verify Local Build

Before deploying, test locally:

```bash
# Build the project
npm run build

# Preview the build
npm run preview

# Open http://localhost:4173
# Verify everything works correctly
```

## Environment Variables

If your app uses environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all required variables
3. Redeploy after adding variables

## Common Vercel Settings

- **Framework Preset:** Vite (auto-detected)
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)
- **Node Version:** Auto (or specify in `package.json` engines field)

## Check Deployment Status

1. Go to Vercel Dashboard
2. Click on your project
3. Check the "Deployments" tab
4. Look for:
   - ✅ Green checkmark = Success
   - ❌ Red X = Failed (check logs)
   - ⏳ Spinning = Building

## Still Having Issues?

1. **Check Vercel Build Logs**
   - Go to deployment → Click "View Build Logs"
   - Look for error messages

2. **Test Build Locally**
   ```bash
   npm run build
   npm run preview
   ```

3. **Check Browser Console**
   - Open deployed site
   - Press F12 → Console tab
   - Look for JavaScript errors

4. **Verify vercel.json**
   - Ensure file exists in project root
   - Check JSON syntax is valid

5. **Clear Cache**
   - Vercel Dashboard → Settings → Clear Build Cache
   - Redeploy

## Project Configuration

This project is configured with:
- ✅ `vercel.json` for routing and build settings
- ✅ Vite build system
- ✅ React Router for client-side routing
- ✅ Static asset optimization

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord
- Check deployment logs in Vercel Dashboard
