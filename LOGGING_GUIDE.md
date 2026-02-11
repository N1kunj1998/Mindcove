# Logging Guide - Frontend & Server

## Overview
Comprehensive logging has been added to both frontend and server to help you understand what's happening at every step.

## Frontend Logging

### Location
- **Logger utility**: `src/lib/logger.ts`
- **Used in**: All ATS analyzer components

### Log Levels
- **INFO**: Important events (file uploads, navigation, API calls)
- **WARN**: Warnings (invalid files, missing data)
- **ERROR**: Errors (API failures, parsing errors)
- **DEBUG**: Detailed debugging info (only in development)

### Where to See Logs
Open browser console (F12 → Console tab)

### What Gets Logged

#### ATSScoreAnalyzer Component
- ✅ File selection (drag & drop or click)
- ✅ File validation
- ✅ PDF parsing start/completion
- ✅ Text extraction progress
- ✅ SessionStorage operations
- ✅ Navigation events
- ✅ Errors during PDF parsing

#### ATSScanning Component
- ✅ Page mount
- ✅ Progress updates (every 25%)
- ✅ Step changes
- ✅ Animation completion
- ✅ Navigation to results

#### ATSResults Component
- ✅ Component mount
- ✅ SessionStorage data retrieval
- ✅ API request preparation
- ✅ API response received
- ✅ Analysis completion
- ✅ Errors and failures

### Example Log Output
```
[2026-02-11T22:30:00.000Z] [INFO] [ATSScoreAnalyzer] PDF file selected {
  filename: "resume.pdf",
  size: 245678,
  type: "application/pdf"
}

[2026-02-11T22:30:01.000Z] [INFO] [ATSScoreAnalyzer] PDF loaded successfully {
  pageCount: 2
}

[2026-02-11T22:30:02.000Z] [INFO] [API] Making POST request to /api/analyze-resume {
  method: "POST",
  url: "/api/analyze-resume",
  payloadSize: 154277
}
```

---

## Server/API Logging

### Location
- **API file**: `api/analyze-resume.ts`
- **Logging utility**: Built-in `serverLog` object

### Where to See Logs

**Local Development (Vercel CLI):**
```bash
vercel dev
```
Logs appear in the terminal where you ran `vercel dev`

**Production (Vercel):**
- Go to Vercel Dashboard → Your Project → Functions
- Click on the function → View Logs

### What Gets Logged

#### Request Handling
- ✅ Request received (method, URL, headers)
- ✅ Request body parsing
- ✅ File data validation
- ✅ API key validation

#### Processing Steps
- ✅ Base64 to buffer conversion
- ✅ Text extraction status
- ✅ OpenAI API call preparation
- ✅ OpenAI API response
- ✅ JSON parsing
- ✅ Fallback analysis creation

#### Performance Metrics
- ✅ Request duration
- ✅ OpenAI API call duration
- ✅ File sizes
- ✅ Text lengths

#### Errors
- ✅ Detailed error messages
- ✅ Stack traces
- ✅ Request context

### Example Log Output
```
[2026-02-11T22:30:00.000Z] [INFO] [API] Request received [req-1234567890-abc123] {
  method: "POST",
  url: "/api/analyze-resume",
  headers: { "content-type": "application/json" }
}

[2026-02-11T22:30:00.100Z] [INFO] [API] Request body parsed [req-1234567890-abc123] {
  filename: "resume.pdf",
  hasBase64: true,
  base64Length: 154277,
  extractedTextLength: 3456
}

[2026-02-11T22:30:00.200Z] [INFO] [API] Starting OpenAI analysis [req-1234567890-abc123] {
  textLength: 3456
}

[2026-02-11T22:30:05.500Z] [INFO] [API] Analysis completed successfully [req-1234567890-abc123] {
  duration: "5300ms",
  score: 75,
  issuesCount: 3
}
```

---

## How to Use Logs for Debugging

### 1. Check Browser Console (Frontend)
1. Open your app in browser
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab
4. Filter by log level or component name

### 2. Check Terminal/Server Logs (Backend)
1. Find the terminal where `vercel dev` is running
2. Look for `[API]` prefixed logs
3. Each request has a unique ID: `[req-1234567890-abc123]`

### 3. Common Issues & What to Look For

#### Issue: File Upload Not Working
**Check:**
- `[ATSScoreAnalyzer] File selected` - File was picked?
- `[ATSScoreAnalyzer] PDF loaded successfully` - PDF parsed?
- `[ATSScoreAnalyzer] Text extraction completed` - Text extracted?

#### Issue: API Returns 404
**Check:**
- `[API] Request received` - Request reached server?
- If not, check Vercel CLI is running
- Check API route exists: `api/analyze-resume.ts`

#### Issue: Analysis Fails
**Check:**
- `[API] OpenAI API key found` - Key configured?
- `[API] Calling OpenAI API` - API call started?
- `[API] OpenAI API error` - What error?
- `[API] Analysis failed` - Full error details

#### Issue: Slow Performance
**Check:**
- `duration: "5300ms"` - How long did it take?
- `openAIDuration` - OpenAI API response time
- File sizes and text lengths

---

## Log Format

### Frontend Logs
```
[TIMESTAMP] [LEVEL] [COMPONENT] Message { data }
```

### Server Logs
```
[TIMESTAMP] [LEVEL] [API] Message [REQUEST_ID] { data }
```

---

## Filtering Logs

### Browser Console
- Filter by component: Type `ATSScoreAnalyzer` or `ATSResults`
- Filter by level: Type `ERROR` or `WARN`
- Filter by message: Type part of the message

### Server Logs
- Filter by request: Look for `[req-1234567890-abc123]`
- Filter by level: `[ERROR]` or `[WARN]`
- Filter by step: `Request received` or `Analysis completed`

---

## Production Considerations

### Frontend
- Debug logs are automatically disabled in production
- Only INFO, WARN, and ERROR logs appear
- Logs are sent to browser console only

### Server
- All logs appear in Vercel function logs
- Can be viewed in Vercel Dashboard
- Useful for debugging production issues

---

## Quick Reference

### Enable More Detailed Logs
In `src/lib/logger.ts`, change:
```typescript
private isDevelopment = import.meta.env.DEV;
```
to:
```typescript
private isDevelopment = true; // Always show debug logs
```

### Disable Logs
Comment out logger calls or set:
```typescript
private isDevelopment = false;
```

---

## Example Debugging Session

1. **User uploads PDF**
   - Check: `[ATSScoreAnalyzer] PDF file selected`
   - Check: `[ATSScoreAnalyzer] PDF loaded successfully`

2. **Navigates to scanning**
   - Check: `[ATSScanning] Scanning page mounted`
   - Check: Progress logs every 25%

3. **API call made**
   - Check: `[API] Request received`
   - Check: `[API] Request body parsed`
   - Check: `[API] Starting OpenAI analysis`

4. **Results displayed**
   - Check: `[API] Analysis completed successfully`
   - Check: `[ATSResults] Analysis completed successfully`

If any step fails, check the ERROR logs for details!
