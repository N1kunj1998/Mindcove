# Quick Start Guide - Running the Project

## Prerequisites

Make sure you have Node.js installed (version 16 or higher recommended).

Check if you have Node.js:
```bash
node --version
npm --version
```

If not installed, download from [nodejs.org](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm).

## Step-by-Step Instructions

### 1. Install Dependencies

First time setup (or after pulling new changes):
```bash
npm install
```

This will install all required packages including:
- React, Vite, TypeScript
- UI components (shadcn/ui)
- PDF parsing library (pdfjs-dist)
- And all other dependencies

### 2. Setup Environment Variables

Create `.env` file from the example:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=your-openai-api-key-here
```

**Get your API key:** [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Start Development Server

Run the development server:
```bash
npm run dev
```

You should see output like:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Open in Browser

Open your browser and go to:
```
http://localhost:5173
```

The app will automatically reload when you make changes to the code!

## Available Commands

### Development
```bash
npm run dev          # Start development server (with hot reload)
```

### Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Other
```bash
npm run lint         # Run ESLint to check code quality
```

## Testing the ATS Analyzer

1. **Start the dev server**: `npm run dev`
2. **Navigate to homepage**: `http://localhost:5173`
3. **Scroll to ATS Analyzer section**
4. **Upload a PDF resume** (drag & drop or click to browse)
5. **Click "Analyze My Resume"**
6. **Watch the scanning animation**
7. **View detailed results**

## Important Notes

### API Endpoint (Local Development)

The ATS analyzer uses `/api/analyze-resume` endpoint. For local development:

**Option 1: Use Vercel CLI** (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with API routes
vercel dev
```

This will start both frontend and API routes locally.

**Option 2: Mock API Response** (For testing UI only)

If you just want to test the UI without the API, you can temporarily modify the API call in `src/pages/ATSResults.tsx` to use mock data.

### Environment Variables

The project uses `.env` file for local development:

**Local Development:**
1. Copy `.env.example` to `.env`: `cp .env.example .env`
2. Edit `.env` and add your OpenAI API key
3. Run `vercel dev` - it will automatically load `.env`

**Production (Vercel):**
Add environment variable in Vercel Dashboard:
- Go to Project → Settings → Environment Variables
- Add `OPENAI_API_KEY` with your key
- Redeploy your project

## Troubleshooting

### Port Already in Use
If port 5173 is busy:
```bash
# Vite will automatically try the next available port
# Or specify a different port:
npm run dev -- --port 3000
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check for TypeScript errors
npm run build

# Check for linting errors
npm run lint
```

### PDF Upload Not Working
- Make sure you're using a valid PDF file
- Check browser console for errors
- Verify pdfjs-dist is installed: `npm list pdfjs-dist`

### API Not Working Locally
- Use `vercel dev` to run API routes locally
- Or deploy to Vercel to test full functionality
- Check API route exists: `api/analyze-resume.ts`

## Project Structure

```
career-confidence-kit-main/
├── src/
│   ├── components/        # React components
│   │   ├── ATSScoreAnalyzer.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Index.tsx
│   │   ├── ATSScanning.tsx
│   │   ├── ATSResults.tsx
│   │   └── ...
│   ├── lib/              # Utilities
│   └── App.tsx           # Main app component
├── api/                  # Vercel serverless functions
│   └── analyze-resume.ts
├── public/               # Static assets
├── package.json          # Dependencies
└── vite.config.ts        # Vite configuration
```

## Next Steps

1. ✅ Run `npm install` (if not done)
2. ✅ Run `npm run dev`
3. ✅ Open `http://localhost:5173`
4. ✅ Test the ATS analyzer
5. ✅ Make changes and see them hot-reload!

## Need Help?

- Check browser console (F12) for errors
- Check terminal for build errors
- Review the README.md for more details
- Check ATS_ANALYZER_SETUP.md for ATS analyzer specifics
