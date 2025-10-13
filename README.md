# Content Schedule Manager

Never miss a YouTube shorts deadline again! Manage multiple channels, track posting schedules, and collaborate with editors.

## 🚀 Quick Start

```bash
# 1. Install everything
npm run install:all

# 2. Start the app (MongoDB must be running)
npm run dev
```

Open http://localhost:5173 and register!

**That's it!** The `.env` files are already configured for local development.

## 📚 Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
- **[SETUP.md](SETUP.md)** - Complete setup & deployment guide
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - What's built and what's next

## ✨ Features

### ✅ Working Now
- 🔐 User authentication (owner/editor roles)
- 📺 Channel management with posting schedules
- 💡 Inspiration channels (save model channels)
- 👥 Editor assignments per channel
- 📹 Video upload with approval workflow
- ✅ **Video task assignments** - Assign editing tasks to editors
- 📊 Posting timeline and history
- ⏰ Deadline tracking

### 🚧 Coming Soon
- 🔔 Automatic deadline notifications
- 📱 Real-time dashboard updates
- 📧 Email alerts
- 🎨 Full frontend UI

## 🎯 How It Works

1. **Add your channels** with target posting times
2. **Assign editors** to upload videos
3. **Review and approve** videos
4. **Mark as posted** when you publish
5. **Track deadlines** - app shows time since last post

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT, S3/R2
**Frontend:** React, TypeScript, Tailwind CSS
**Deployment:** Digital Ocean, Nginx, PM2

## 📖 API Examples

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"pass123","name":"Your Name","role":"owner"}'
```

### Create Channel
```bash
curl -X POST http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Channel","youtubeUrl":"https://youtube.com/@me","targetPostingTime":"14:00"}'
```

See [QUICKSTART.md](QUICKSTART.md) for more examples.

## 🌐 Deployment

### Digital Ocean App Platform (Easiest)
1. Push to GitHub
2. Connect to DO App Platform
3. Deploy backend + frontend
4. Done!

### Digital Ocean Droplet (More Control)
```bash
# On your droplet
git clone your-repo
cd content-schedule-manager
npm run install:all
cd backend && npm run build
pm2 start dist/index.js --name content-schedule-api
```

Full instructions in [SETUP.md](SETUP.md).

## 🎨 Current Status

**Backend:** 70% complete - All core APIs working
**Frontend:** 5% complete - Basic login page only

The backend is production-ready! You can:
- Use the APIs directly
- Build your own frontend
- Deploy and start using it

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for details.

## 🤝 Contributing

Check `.kiro/specs/content-schedule-manager/tasks.md` for remaining tasks.

## 📝 License

MIT

---

**Need help?** Check the docs or open an issue!
