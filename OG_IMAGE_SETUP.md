# Open Graph Image Setup Instructions

## Step 1: Place Your Image

1. **Location**: Place your Open Graph image in the `public` folder
   - Path: `/public/og-image.jpg` (or `.png`)

2. **Recommended Specifications**:
   - **Dimensions**: 1200 x 630 pixels (1.91:1 aspect ratio)
   - **Format**: JPG or PNG
   - **File Size**: Under 1MB (optimized for web)
   - **File Name**: `og-image.jpg` or `og-image.png`

## Step 2: Verify Image is Linked

The image is already configured in `index.html` and will be automatically linked when you:
- Place the file as `/public/og-image.jpg` OR
- Place the file as `/public/og-image.png`

## Step 3: Test After Deployment

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
   - Enter your URL
   - Click "Scrape Again" to see the image preview

2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
   - Enter your URL
   - Verify the image appears

3. **Open Graph Preview**: https://www.opengraph.xyz/
   - Enter your URL
   - See how it looks when shared

## Current Configuration

The image is referenced in:
- ✅ Open Graph meta tags (Facebook, LinkedIn)
- ✅ Twitter Card meta tags
- ✅ Product structured data (JSON-LD)

All references point to: `https://mindcove.io/og-image.jpg`

## If Your Image Has a Different Name

If your image file has a different name (e.g., `my-og-image.png`), you can either:
1. Rename it to `og-image.jpg` (recommended)
2. Or update all references in `index.html` to match your filename






