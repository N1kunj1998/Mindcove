# Fix Blank Page Issue - Local Development

## Problem
When running `npm run dev:full` (or `vercel dev`), you see a blank page.

## Solution Options

### Option 1: Run Frontend and API Separately (Recommended for Development)

**Terminal 1 - Frontend:**
```bash
npm run dev
```
This will start Vite dev server on `http://localhost:8080` (or next available port)

**Terminal 2 - API (in a new terminal):**
```bash
vercel dev --listen 3001
```
This will start API routes on `http://localhost:3001`

**Then update API calls** to point to `http://localhost:3001` for local development, or use a proxy.

### Option 2: Use Vercel Dev with Proper Configuration

**Step 1: Make sure Vercel CLI is installed and linked**
```bash
# Install Vercel CLI
npm i -g vercel

# Link your project (first time only)
vercel link
```

**Step 2: Run with explicit port**
```bash
vercel dev --listen 3000
```

**Step 3: Check the terminal output**
Look for:
```
> Ready! Available at http://localhost:3000
```

**Step 4: Open browser console (F12)**
Check for JavaScript errors that might cause blank page.

### Option 3: Build and Preview (For Testing Production Build)

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

Then open `http://localhost:4173` (or the port shown)

---

## Quick Debugging Steps

### 1. Check Browser Console
Open browser DevTools (F12) → Console tab
- Look for red error messages
- Common issues:
  - Module not found errors
  - React rendering errors
  - API connection errors

### 2. Check Terminal Output
Look for:
- ✅ "Ready!" message
- ❌ Error messages
- Port number (might not be 3000)

### 3. Check Network Tab
Open browser DevTools (F12) → Network tab
- Refresh the page
- Look for failed requests (red)
- Check if `index.html` is loading

### 4. Verify Files Exist
```bash
# Check if dist folder exists (for production build)
ls -la dist/

# Check if src files exist
ls -la src/
```

---

## Most Common Fix

**Try this first:**

```bash
# 1. Stop any running servers (Ctrl+C)

# 2. Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 3. Build first to check for errors
npm run build

# 4. If build succeeds, try preview
npm run preview

# 5. If preview works, then try vercel dev
vercel dev
```

---

## Alternative: Run Two Servers

If `vercel dev` doesn't work, run frontend and API separately:

**Terminal 1:**
```bash
npm run dev
# Frontend runs on http://localhost:8080
```

**Terminal 2:**
```bash
vercel dev --listen 3001
# API runs on http://localhost:3001
```

Then temporarily modify API calls in your code to use `http://localhost:3001/api/...` for local development.

---

## Check What's Actually Running

```bash
# Check what's running on common ports
lsof -i :3000
lsof -i :8080
lsof -i :5173

# Kill process if needed
kill -9 <PID>
```

---

## Still Not Working?

1. **Check Vercel CLI version:**
   ```bash
   vercel --version
   ```

2. **Try updating Vercel CLI:**
   ```bash
   npm i -g vercel@latest
   ```

3. **Check if project is linked:**
   ```bash
   vercel link
   ```

4. **Check browser console for specific errors** and share them for debugging.
