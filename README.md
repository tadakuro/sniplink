# 🔗 Snip Link — URL Shortener

A production-ready URL shortener built with **Next.js** + **Upstash Redis**, deployable to Vercel in minutes.

## Features
- ✂️ Shorten any URL instantly
- ✏️ Custom aliases (e.g. `yoursite.com/my-link`)
- 📊 Click tracking per link
- 📱 QR code for every link
- 🗑️ Delete links
- 💾 Persistent storage via Upstash Redis (free tier)
- 🔁 Real server-side redirects (302)

---

## 🚀 Deploy to Vercel — Step by Step

### Step 1 — Create a free Upstash Redis database

1. Go to **https://console.upstash.com** and sign up (free)
2. Click **"Create Database"**
3. Name it anything (e.g. `snip-link`), pick the region closest to you
4. Click **Create**
5. On the database page, scroll to **REST API** section
6. Copy your **`UPSTASH_REDIS_REST_URL`** and **`UPSTASH_REDIS_REST_TOKEN`**

---

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
gh repo create snip-link --public --push
# or manually create a repo on github.com and push
```

---

### Step 3 — Deploy to Vercel

1. Go to **https://vercel.com** → **"Add New Project"**
2. Import your GitHub repo
3. In the **"Environment Variables"** section, add:

| Name | Value |
|---|---|
| `UPSTASH_REDIS_REST_URL` | (from Step 1) |
| `UPSTASH_REDIS_REST_TOKEN` | (from Step 1) |
| `NEXT_PUBLIC_BASE_URL` | `https://your-project.vercel.app` ← use your actual Vercel URL |

4. Click **"Deploy"** ✅

> **Tip:** After your first deploy, Vercel shows your URL (e.g. `snip-link-abc123.vercel.app`).
> Go to **Settings → Environment Variables**, update `NEXT_PUBLIC_BASE_URL` with the real URL, then redeploy.

---

### Step 4 — (Optional) Add a custom domain

In Vercel → Project Settings → Domains → Add your domain.
Then update `NEXT_PUBLIC_BASE_URL` to your custom domain and redeploy.

---

## 🛠 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.local.example .env.local
# Fill in your Upstash credentials and set:
# NEXT_PUBLIC_BASE_URL=http://localhost:3000

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
snip-link/
├── lib/
│   ├── redis.js          # Upstash Redis client
│   └── utils.js          # URL validation, alias sanitizer
├── pages/
│   ├── index.js          # Main UI
│   ├── [code].js         # Redirect handler (server-side)
│   ├── 404.js            # Not found page
│   └── api/
│       ├── shorten.js    # POST /api/shorten
│       ├── links.js      # GET  /api/links
│       └── links/
│           └── [code].js # DELETE /api/links/:code
├── .env.local.example
├── next.config.js
└── package.json
```

---

## 🔧 Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 |
| Database | Upstash Redis (serverless) |
| Hosting | Vercel |
| ID generation | nanoid |
