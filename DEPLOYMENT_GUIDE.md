# SubHub Deployment Guide

This guide provides step-by-step instructions for deploying SubHub to Vercel using GitHub integration.

## 🚀 Automatic Deployment with Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- SubHub repository pushed to GitHub

### Step 1: Prepare Repository for GitHub

1. **Initialize Git repository** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: SubHub React app with Supabase integration"
```

2. **Create GitHub repository** and push:
```bash
git remote add origin https://github.com/yourusername/SubHub.git
git branch -M main
git push -u origin main
```

### Step 2: Connect Vercel to GitHub

1. **Visit Vercel**: Go to [vercel.com](https://vercel.com)
2. **Sign up/Login**: Use your GitHub account for easy integration
3. **Import Project**: Click "New Project" → "Import Git Repository"
4. **Select Repository**: Choose your SubHub repository
5. **Configure Project**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: Leave as default (Vercel will use our `vercel.json` config)
   - **Build Command**: `cd app && npm run build` (configured in vercel.json)
   - **Output Directory**: `app/dist` (configured in vercel.json)
   - **Install Command**: `cd app && npm install` (configured in vercel.json)

### Step 3: Deploy

1. **Click Deploy**: Vercel will automatically build and deploy
2. **Wait for Build**: Usually takes 2-3 minutes
3. **Get URL**: Vercel provides a production URL (e.g., `subhub-xyz.vercel.app`)

### Step 4: Verify Deployment

1. **Test Authentication**: Login with `test@subhub.com` / `test123456`
2. **Test Functionality**: 
   - Dashboard loads with real data
   - Subscription CRUD operations work
   - Admin dashboard accessible
   - Responsive design on mobile

## 🔧 Manual Deployment with Vercel CLI

### Install Vercel CLI

```bash
# Install globally
npm install -g vercel

# Or use npx (no installation required)
npx vercel
```

### Deploy Commands

```bash
# Navigate to project root
cd /path/to/SubHub

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### CLI Configuration

The project includes a `vercel.json` file with the following configuration:

```json
{
  "version": 2,
  "name": "subhub",
  "builds": [
    {
      "src": "app/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "app/dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/app/dist/$1"
    }
  ],
  "installCommand": "cd app && npm install",
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/dist",
  "framework": "vite"
}
```

## 🌐 Alternative Deployment Platforms

### Netlify

1. **Build the project**:
```bash
cd app
npm run build
```

2. **Deploy**:
   - Drag and drop the `app/dist` folder to Netlify
   - Or connect GitHub repository with build settings:
     - **Build command**: `cd app && npm run build`
     - **Publish directory**: `app/dist`

### GitHub Pages

1. **Install gh-pages**:
```bash
cd app
npm install --save-dev gh-pages
```

2. **Add deploy script** to `app/package.json`:
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

3. **Deploy**:
```bash
npm run deploy
```

## 🔒 Environment Variables

The SubHub application has Supabase configuration embedded in the code, so no additional environment variables are required for deployment. However, for production security, consider:

1. **Moving Supabase config to environment variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Adding to Vercel**:
   - Go to Project Settings → Environment Variables
   - Add the variables for Production, Preview, and Development

## 🧪 Testing Deployment

### Pre-deployment Checklist

- [ ] Build completes without errors: `cd app && npm run build`
- [ ] All tests pass: `cd app && npm run test`
- [ ] No console errors in development
- [ ] Authentication works with test credentials
- [ ] Supabase integration functional
- [ ] Responsive design verified

### Post-deployment Verification

- [ ] Application loads at production URL
- [ ] Login with `test@subhub.com` / `test123456` works
- [ ] Dashboard shows real data from Supabase
- [ ] Subscription CRUD operations function
- [ ] Admin dashboard accessible (admin users only)
- [ ] Mobile responsiveness confirmed
- [ ] No console errors in production

## 🔄 Continuous Deployment

With GitHub integration, Vercel automatically:

1. **Builds and deploys** on every push to main branch
2. **Creates preview deployments** for pull requests
3. **Provides deployment status** in GitHub commits
4. **Rolls back** if deployment fails

## 🆘 Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check build logs in Vercel dashboard
   - Verify all dependencies in `app/package.json`
   - Test build locally: `cd app && npm run build`

2. **App Loads but Features Don't Work**:
   - Check browser console for errors
   - Verify Supabase connection
   - Check network requests in browser dev tools

3. **Routing Issues**:
   - Ensure `vercel.json` routes are configured correctly
   - Check React Router configuration

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Supabase Documentation](https://supabase.com/docs)

---

**Ready for deployment! 🚀**
