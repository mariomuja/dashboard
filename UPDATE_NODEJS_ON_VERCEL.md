# 🔧 Update Node.js to v22 on Vercel

## ✅ Good News

Your `package.json` files **already specify Node.js 22**:

```json
"engines": {
  "node": ">=22.0.0",
  "npm": ">=10.0.0"
}
```

Both frontend and backend are configured correctly in the code.

---

## 🚀 Update Node.js Version in Vercel (2 minutes)

### Option 1: Via Vercel Dashboard (Easiest)

1. **Go to your Vercel dashboard:**  
   👉 https://vercel.com/dashboard

2. **Click on your `kpi-dashboard` project**

3. **Go to Settings** (top navigation)

4. **Scroll down to "Node.js Version"**

5. **Change from:** `18.x` or older  
   **Change to:** `22.x` (latest)

6. **Click "Save"**

7. **Redeploy the project:**
   - Go back to "Deployments" tab
   - Click the ⋯ (three dots) on the latest deployment
   - Click "Redeploy"
   - Check "Use existing Build Cache"
   - Click "Redeploy"

8. **Done!** The warning will disappear.

---

### Option 2: Force New Deployment (Automatic)

Since your `package.json` already has `"node": ">=22.0.0"`, you can force Vercel to use it:

```bash
cd C:\Users\mario\dashboard\dashboard-frontend

# Make a small change to trigger deployment
echo. >> package.json
git add package.json
git commit --allow-empty -m "Trigger Vercel to use Node.js 22"
git push
```

This will trigger a new deployment that reads your `engines` field and uses Node.js 22.

---

### Option 3: Add `.node-version` File

Create this file to explicitly tell Vercel which Node version to use:

```bash
cd C:\Users\mario\dashboard\dashboard-frontend
echo 22 > .node-version
git add .node-version
git commit -m "Specify Node.js 22 for Vercel"
git push
```

---

## 🎯 Verification

After updating, verify it worked:

1. **Check the deployment log** in Vercel:
   - Look for: `Node.js Version: 22.x.x`
   - Should be near the top of the build log

2. **The warning should disappear** from your dashboard

---

## 📊 Why This Warning Appeared

Vercel is deprecating Node.js 18 and older because:
- Node.js 18 reaches End of Life in April 2025
- Node.js 22 is the current LTS (Long Term Support) version
- Better performance and security

Your code is **already prepared** with the correct version specified!

---

## ✅ What Happens Next

- Vercel will use Node.js 22 for all new builds
- Warning will disappear from your dashboard
- Your app will continue working (Node.js 22 is backward compatible)
- You're future-proofed until at least 2027 (Node.js 22 LTS)

---

## 🆘 If You Still See the Warning

1. **Clear Vercel cache:**
   - Redeploy without cache
   - Settings → "Clear Build Cache" → Redeploy

2. **Check both projects:**
   - Make sure BOTH frontend and backend are on Node.js 22
   - Dashboard frontend and Dashboard backend

3. **Verify package.json was committed:**
   ```bash
   git log --oneline | head -5
   ```
   Should show recent commits with Node.js updates

---

**Recommended:** Use **Option 1** (Vercel Dashboard) - it's the quickest and most reliable!

