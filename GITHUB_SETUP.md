# GitHub Setup Instructions

## Step 1: Create Repository on GitHub

1. Go to https://github.com/keviscoding
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository name: `content-schedule-manager`
4. Description: `YouTube shorts channel management system with deadline tracking`
5. Keep it **Public** (or Private if you prefer)
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

## Step 2: Push Your Code

Run these commands in your terminal:

```bash
# Add GitHub as remote
git remote add origin https://github.com/keviscoding/content-schedule-manager.git

# Push to GitHub
git branch -M main
git push -u origin main
```

If you get an authentication error, you may need to:
1. Use a Personal Access Token instead of password
2. Or use SSH (if you have SSH keys set up)

### Using Personal Access Token:

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "Content Schedule Manager"
4. Select scopes: `repo` (full control)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)
7. When pushing, use the token as your password

## Step 3: Verify

1. Go to https://github.com/keviscoding/content-schedule-manager
2. You should see all your files!
3. Check that README.md displays nicely

## Step 4: Deploy to Digital Ocean

Now follow **DEPLOY_DIGITAL_OCEAN.md** to deploy your app!

---

## Quick Commands

```bash
# If you haven't committed yet
git add .
git commit -m "Initial commit"

# Add remote and push
git remote add origin https://github.com/keviscoding/content-schedule-manager.git
git branch -M main
git push -u origin main
```

## Troubleshooting

**"remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/keviscoding/content-schedule-manager.git
```

**Authentication failed**
- Use a Personal Access Token (see above)
- Or set up SSH keys

**"Updates were rejected"**
```bash
git pull origin main --rebase
git push -u origin main
```

---

**Next:** Once pushed, go to Digital Ocean and deploy! 🚀
