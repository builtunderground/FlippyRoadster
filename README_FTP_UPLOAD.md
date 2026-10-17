# Flippy Roadster — FTP Deployment Instructions

There are **two easy ways** to upload this game to your web server via FTP:

---

### Option 1 (Recommended — Cleanest & Fastest)
1. Open the folder named **`ready_for_ftp/`** (or **`dist/`**).
2. Upload **all files and folders inside `ready_for_ftp/`** directly to your FTP directory (e.g., `/public_html/flippycar/`):
   ```
   /public_html/flippycar/
     ├── assets/
     ├── audio/
     │    └── FlippyRoadster1.mp3
     ├── images/
     │    └── FlippyRoadster-PixelLogo.png
     ├── .htaccess
     ├── favicon.png
     ├── favicon.svg
     └── index.html
   ```
3. Open `http://tristanvogt.com/flippycar/` in your browser. It will load immediately!

---

### Option 2 (Upload entire unzipped folder as-is)
If you already uploaded the whole unzipped project folder to your server:
- The root `index.html` has an auto-loader that detects static FTP servers and automatically forwards visitors to `./ready_for_ftp/index.html`.
- Alternatively, you can browse directly to:
  `http://tristanvogt.com/flippycar/ready_for_ftp/`
