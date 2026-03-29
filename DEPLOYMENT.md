# 🚀 Deploying Grow Carry MERN App

## Overview
- **Database**: MongoDB Atlas (free tier)
- **Backend**: Render.com (free tier)
- **Frontend**: Vercel (free tier)

---

## Step 1: Set Up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Click **"Build a Database"** → Choose **"Free Shared"** tier → Select a region.
3. Create a **Database User**:
   - Username: `groceryadmin`
   - Password: (choose a strong password, save it!)
4. Under **Network Access**, click **"Add IP Address"** → **"Allow Access from Anywhere"** (`0.0.0.0/0`).
5. Click **"Connect"** → **"Connect your application"** → Copy the connection string.
   - It looks like: `mongodb+srv://groceryadmin:<password>@cluster0.xxxxx.mongodb.net/grocery-db`

> Replace `<password>` with your actual password.

---

## Step 2: Seed Your Database

Once Atlas is connected, update `server/.env`:
```
MONGO_URI=mongodb+srv://groceryadmin:<password>@cluster0.xxxxx.mongodb.net/grocery-db
```

Then run:
```bash
cd server
node seed.js
```

This loads 20 sample products into MongoDB Atlas.

---

## Step 3: Deploy Backend to Render

1. Push your project to **GitHub** (separate `server/` folder or full repo).
2. Go to [render.com](https://render.com) → Create account → **"New Web Service"**.
3. Connect your GitHub repo.
4. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables** (under "Environment" tab):
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://...   ← your Atlas URI
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=production
   CLIENT_URL=https://your-app.vercel.app
   ```
6. Click **"Create Web Service"** — Render will build and deploy.
7. Copy the Render URL, e.g. `https://grocery-backend.onrender.com`

---

## Step 4: Configure Frontend for Production

In `client/src/api/axios.js`, the `baseURL` is `/api` which works via Vite proxy locally.
For production, create `client/.env.production`:
```
VITE_API_BASE_URL=https://grocery-backend.onrender.com/api
```

Update `client/src/api/axios.js`:
```js
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});
```

---

## Step 5: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub.
2. Click **"Add New Project"** → Import your GitHub repo.
3. Settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   ```
   VITE_API_BASE_URL = https://grocery-backend.onrender.com/api
   ```
5. Click **"Deploy"** — Vercel builds and deploys in ~60 seconds.
6. Your app is live at `https://your-app.vercel.app` 🎉

---

## Step 6: Update CORS on Backend

After your Vercel URL is known, update `CLIENT_URL` in Render's environment variables:
```
CLIENT_URL=https://your-app.vercel.app
```

Redeploy the Render service.

---

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| MongoDB Atlas | mongodb.com/atlas | Database hosting |
| Render | render.com | Backend (Node.js) |
| Vercel | vercel.com | Frontend (React) |

---

## Troubleshooting

- **CORS errors**: Ensure `CLIENT_URL` in Render matches your Vercel URL exactly.
- **MongoDB connection fails**: Verify IP `0.0.0.0/0` is whitelisted in Atlas Network Access.
- **Render cold start**: Free tier sleeps after 15 min of inactivity. First request may take ~30s.
- **Build fails on Vercel**: Make sure `VITE_API_BASE_URL` is set in Vercel's environment variables.
