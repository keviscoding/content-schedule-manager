# Deployment Checklist ✅

## Before Pushing to GitHub

- [x] Backend .env configured with MongoDB Atlas
- [x] Frontend .env configured
- [x] .gitignore includes .env files
- [ ] Test locally one more time
- [ ] Generate new JWT secrets for production

## Generate Production Secrets

Run these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate JWT_REFRESH_SECRET  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Save these for Digital Ocean environment variables!

## GitHub Setup

- [ ] Create repo: https://github.com/keviscoding/content-schedule-manager
- [ ] Push code to GitHub
- [ ] Verify all files are there

## Digital Ocean Setup

- [ ] Create app on Digital Ocean
- [ ] Configure backend component
- [ ] Add backend environment variables
- [ ] Configure frontend component
- [ ] Add frontend environment variables
- [ ] Deploy!

## Post-Deployment

- [ ] Test registration
- [ ] Test login
- [ ] Create a channel
- [ ] Add inspiration channel
- [ ] Verify everything works

## MongoDB Atlas

- [ ] Whitelist Digital Ocean IPs (or 0.0.0.0/0)
- [ ] Verify connection works

---

## Quick Commands

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/keviscoding/content-schedule-manager.git
git push -u origin main

# Generate secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Environment Variables for Digital Ocean

**Backend:**
```
MONGODB_URI=mongodb+srv://contentmanagerkevis:2m6fsKG3ecPproYq@cluster0.xtw7jcq.mongodb.net/content-schedule-manager?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<generated-secret-here>
JWT_REFRESH_SECRET=<generated-secret-here>
PORT=3001
FRONTEND_URL=${frontend.PUBLIC_URL}
```

**Frontend:**
```
VITE_API_URL=${backend.PUBLIC_URL}
```

---

**Ready to deploy!** Follow DEPLOY_DIGITAL_OCEAN.md for step-by-step instructions.
