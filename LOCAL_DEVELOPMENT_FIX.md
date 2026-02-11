# Fix for 404 API Error - Local Development

## Problem
When running `npm run dev`, the `/api/analyze-resume` endpoint returns 404 because Vite doesn't handle Vercel serverless functions.

## Environment Variables Setup

### Step 1: Create .env file
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 2: Add your OpenAI API Key
Edit `.env` and add your OpenAI API key:
```
OPENAI_API_KEY=your-actual-api-key-here
```

**Note**: The `.env` file is already in `.gitignore` so it won't be committed to git.

## Solution: Use Vercel CLI (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Run with Vercel Dev
```bash
vercel dev
```

This will:
- ✅ Start the frontend (React app)
- ✅ Handle API routes (`/api/analyze-resume`)
- ✅ Work exactly like production

**First time setup:**
- Vercel will ask you to login
- Link to your project (or create new)
- It will detect your project structure automatically

### Step 3: Access the App
Open: `http://localhost:3000` (or the port Vercel shows)

---

## Alternative: Quick Fix for Testing UI Only

If you just want to test the UI without the API, you can temporarily modify the code to use mock data.

### Option A: Mock API Response

Create `src/lib/mockATSResults.ts`:
```typescript
export const mockATSResults = {
  score: 75,
  overallAssessment: "Your resume has good structure but needs some improvements for better ATS compatibility.",
  strengths: [
    "Clear section headers present",
    "Contact information included",
    "Work experience section well-structured"
  ],
  issues: [
    {
      type: "warning",
      category: "Keywords",
      title: "Missing relevant keywords",
      description: "Your resume could benefit from more industry-specific keywords.",
      suggestion: "Add keywords from job descriptions you're targeting.",
      priority: "medium"
    }
  ],
  recommendations: [
    "Add more quantifiable achievements",
    "Include relevant keywords from job postings",
    "Ensure consistent formatting throughout"
  ]
};
```

Then in `src/pages/ATSResults.tsx`, temporarily replace the API call with:
```typescript
// Temporary mock for local development
import { mockATSResults } from "@/lib/mockATSResults";
setResults(mockATSResults);
setIsLoading(false);
```

---

## Why This Happens

- **Vite** (`npm run dev`) only serves frontend files
- **Vercel serverless functions** (`api/*.ts`) need Vercel's runtime
- **Solution**: Use `vercel dev` which handles both frontend and API routes

---

## Quick Commands

```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Run full app (frontend + API)
vercel dev

# Or just frontend (API won't work)
npm run dev
```

---

## Production

When deployed to Vercel, everything works automatically - no changes needed!
