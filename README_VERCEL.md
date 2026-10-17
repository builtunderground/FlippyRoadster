# Flippy Roadster — Vercel Deployment Guide

Yes! You can deploy **Flippy Roadster** to Vercel in just a few clicks. The project is already pre-configured with `vercel.json` and optimized for Vite.

---

### Method 1: Deploy via GitHub (Recommended & Automatic)
1. Push this project repository to **GitHub** (or GitLab / Bitbucket).
2. Go to **[vercel.com](https://vercel.com/)** and log in.
3. Click **"Add New..."** → **"Project"**.
4. Select your **`flippy-roadster`** repository and click **Import**.
5. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click **Deploy**. Your game will be live with an SSL URL (e.g. `https://flippy-roadster.vercel.app`) in under 30 seconds!

---

### Method 2: Deploy with Vercel CLI (Instant from terminal)
If you have Node.js installed on your computer:
1. Open terminal inside the project directory.
2. Run:
   ```bash
   npx vercel
   ```
3. Follow the quick prompts (hit Enter to accept defaults).
4. For production deployment:
   ```bash
   npx vercel --prod
   ```

---

### Method 3: Drag & Drop Deploy (Zero setup)
1. You can upload the pre-compiled **`dist/`** or **`ready_for_ftp/`** folder directly to [vercel.com/deploy](https://vercel.com/new).
2. Vercel will host the static bundle immediately!
