# Environment Variables Setup

## Overview
The project uses environment variables to securely store sensitive information like API keys.

## Setup Instructions

### 1. Create .env File

Copy the example file:
```bash
cp .env.example .env
```

### 2. Add Your API Keys

Edit `.env` and add your actual API key:
```env
OPENAI_API_KEY=your-actual-openai-api-key-here
```

### 3. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in `.env`

## File Structure

```
.env              # Your actual keys (NOT committed to git)
.env.example      # Template file (committed to git)
```

## Security Notes

✅ **DO:**
- Keep `.env` file local only
- Use `.env.example` as a template
- Add `.env` to `.gitignore` (already done)

❌ **DON'T:**
- Commit `.env` to git
- Share your API keys publicly
- Hardcode keys in source code

## How It Works

### Local Development (Vercel CLI)
When you run `vercel dev`, it automatically loads `.env` file.

### Production (Vercel)
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `OPENAI_API_KEY` with your key
3. Redeploy your project

## Verification

To verify your environment variables are loaded:

**In API code:**
```typescript
const apiKey = process.env.OPENAI_API_KEY;
console.log('API Key loaded:', apiKey ? 'Yes' : 'No');
```

## Troubleshooting

### API Key Not Found Error
- Check `.env` file exists in project root
- Verify key name matches: `OPENAI_API_KEY`
- Make sure no extra spaces or quotes
- Restart `vercel dev` after changing `.env`

### Still Getting 404?
- Make sure you're using `vercel dev` (not `npm run dev`)
- Check API route exists: `api/analyze-resume.ts`
- Verify `.env` file is in the root directory

## Example .env File

```env
# OpenAI API Key
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
