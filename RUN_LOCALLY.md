# Run Application Locally - Complete Guide

## Quick Start Commands

### 1. Install Dependencies (First Time Only)
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy the example env file
cp .env.example .env

# Then edit .env and add your OpenAI API key:
# OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 3. Run Complete Application (Frontend + API)

**Option A: Using npm script (Recommended)**
```bash
npm run dev:full
```

**Option B: Using Vercel CLI directly**
```bash
# First install Vercel CLI globally (if not already installed)
npm i -g vercel

# Then run
vercel dev
```

### 4. Open in Browser
```
http://localhost:3000
```
(Note: Vercel dev usually runs on port 3000, but check the terminal output)

---

## Important Notes

### Why `vercel dev` instead of `npm run dev`?

- `npm run dev` - Only runs frontend (Vite dev server). API routes won't work.
- `npm run dev:full` or `vercel dev` - Runs both frontend AND API routes (serverless functions)

### What You'll See

When you run `vercel dev`, you'll see:
```
> vercel dev

Vercel CLI 32.x.x
> Ready! Available at http://localhost:3000
```

The application will be available at `http://localhost:3000` with:
- ✅ Frontend (React app)
- ✅ API routes (`/api/analyze-resume`, `/api/optimize-resume`)
- ✅ Environment variables loaded from `.env`

---

## Complete Setup Checklist

```bash
# 1. Install dependencies
npm install

# 2. Setup environment file
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=your-key-here

# 3. Install Vercel CLI (if not installed)
npm i -g vercel

# 4. Run the complete application
npm run dev:full

# 5. Open browser
# Navigate to: http://localhost:3000
```

---

## Troubleshooting

### Port Already in Use
If port 3000 is busy, Vercel will automatically use the next available port (3001, 3002, etc.). Check the terminal output for the actual URL.

### Vercel CLI Not Found
```bash
npm i -g vercel
```

### API Routes Return 404
Make sure you're using `vercel dev` or `npm run dev:full`, NOT `npm run dev`.

### Environment Variables Not Loading
- Make sure `.env` file exists in the project root
- Make sure it contains `OPENAI_API_KEY=your-key`
- Restart `vercel dev` after changing `.env`

### OpenAI API Errors
- Verify your API key is correct in `.env`
- Check you have credits/quota in your OpenAI account
- Check the terminal for detailed error messages

---

## Testing the Full Flow

1. **Start the app**: `npm run dev:full`
2. **Open browser**: `http://localhost:3000`
3. **Upload resume**: Go to ATS Score Checker section
4. **Analyze**: Click "Analyze My Resume"
5. **View results**: See ATS score and issues
6. **Optimize**: Click "Optimize My Resume with AI"
7. **Preview**: Review changes in preview page
8. **Download**: Download optimized PDF

---

## Development Commands Reference

```bash
# Run complete app (frontend + API)
npm run dev:full

# Run frontend only (API won't work)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Environment Variables

Required in `.env`:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your API key from: https://platform.openai.com/api-keys

---

## What's Running Where

- **Frontend**: React app (Vite) - Usually port 3000
- **API Routes**: Vercel serverless functions - Same port (3000)
- **Static Assets**: Served by Vite

All accessible at: `http://localhost:3000`
