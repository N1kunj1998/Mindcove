# Career Confidence Kit - Resume + Interview Mastery

## Project info

**URL**: https://mindcove.io

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

### Deploy to Vercel (Recommended)

This project is configured for Vercel deployment. You can deploy in two ways:

**Option 1: Using Vercel CLI**
```sh
# Install Vercel CLI globally
npm i -g vercel

# Deploy to Vercel
vercel

# For production deployment
vercel --prod
```

**Option 2: Using Vercel Dashboard**
1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect the Vite framework and configure settings automatically
6. Click "Deploy"

The project is pre-configured with:
- Build command: `npm run build`
- Output directory: `dist`
- Framework: Vite
- Client-side routing support (React Router)

**Manual Build**
Build the project using:
```sh
npm run build
```

The built files will be in the `dist` directory, ready to be deployed to your hosting provider.

## About

Career Confidence Kit - A complete career toolkit designed to help professionals land their dream jobs with ATS-optimized resume templates, interview preparation guides, and salary negotiation scripts.

Built by [mindcove.io](https://mindcove.io)
