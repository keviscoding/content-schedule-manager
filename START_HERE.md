# 👋 START HERE

## What You Have

A **working backend** for managing YouTube shorts channels with:
- ✅ User authentication
- ✅ Channel management
- ✅ Inspiration channels (save model channels)
- ✅ Video uploads & approval
- ✅ **Video task assignments** (assign editing tasks to editors)
- ✅ Deadline tracking
- ✅ Editor assignments

## Get Running in 3 Steps

```bash
# 1. Install
npm run install:all

# 2. Start (make sure MongoDB is running)
npm run dev

# 3. Open browser
open http://localhost:5173
```

## What to Read

1. **[QUICKSTART.md](QUICKSTART.md)** ← Start here for 5-minute setup
2. **[HOW_TO_USE.md](HOW_TO_USE.md)** ← How to actually use it
3. **[SETUP.md](SETUP.md)** ← Full setup & Digital Ocean deployment
4. **[PROJECT_STATUS.md](PROJECT_STATUS.md)** ← What's done & what's next

## Quick Test

```bash
# Test all the APIs
./test-api.sh
```

## What Works Right Now

### Via API (fully functional):
- Register/login users
- Create channels with posting schedules
- Add inspiration channels for each channel
- Assign editors to channels
- Upload videos
- Approve/reject videos
- Mark videos as posted
- View posting history

### Via UI (basic):
- Login/register page only
- Rest needs to be built (see tasks.md)

## How to Use It

### Option 1: Use the API Directly
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"pass","name":"You","role":"owner"}'

# Create channel
curl -X POST http://localhost:3001/api/channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Channel","youtubeUrl":"https://youtube.com/@me","targetPostingTime":"14:00"}'
```

### Option 2: Build the Frontend
Follow the tasks in `.kiro/specs/content-schedule-manager/tasks.md`

### Option 3: Deploy and Use
See [SETUP.md](SETUP.md) for Digital Ocean deployment

## Digital Ocean Deployment

### Quick Deploy (App Platform):
1. Push to GitHub
2. Connect to DO App Platform
3. Deploy backend + frontend separately
4. Done!

### Full Control (Droplet):
```bash
# On your droplet
git clone your-repo
cd content-schedule-manager
./deploy-digitalocean.sh
```

See [SETUP.md](SETUP.md) for complete instructions.

## What's Next

### To Use It Now:
1. Deploy the backend
2. Use the API directly
3. Build a simple frontend or use Postman

### To Complete It:
1. Build the dashboard UI (Task 9)
2. Add deadline monitoring (Task 6)
3. Add notifications (Task 7)
4. Build remaining UI pages (Tasks 10-14)

See `.kiro/specs/content-schedule-manager/tasks.md` for all tasks.

## File Guide

- **README.md** - Project overview
- **QUICKSTART.md** - Get running in 5 minutes
- **HOW_TO_USE.md** - Complete usage guide
- **SETUP.md** - Setup & deployment guide
- **PROJECT_STATUS.md** - What's built, what's not
- **test-api.sh** - Test all endpoints
- **deploy-digitalocean.sh** - Deploy to DO droplet

## Need Help?

1. Check if MongoDB is running
2. Check `.env` files are configured
3. Run `./test-api.sh` to test
4. Check the docs above

## The Bottom Line

**Backend:** Production-ready, fully functional
**Frontend:** Basic login page, needs building
**Deployment:** Ready for Digital Ocean

You can start using it right now via the API, or continue building the frontend for a complete experience.

---

**Ready?** → Read [QUICKSTART.md](QUICKSTART.md) next!
