# Quick Fix: MongoDB Connection Error

## The Problem
MongoDB isn't running locally on your machine.

## Easiest Solution: Use MongoDB Atlas (Free Cloud Database)

### Step 1: Create Free MongoDB Database (2 minutes)

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up (it's free)
3. Click "Build a Database"
4. Choose "M0 FREE" tier
5. Click "Create"
6. Create a database user:
   - Username: `admin`
   - Password: (create a password, save it!)
7. Click "Create User"
8. Add your IP address:
   - Click "Add My Current IP Address"
   - Or add `0.0.0.0/0` to allow from anywhere
9. Click "Finish and Close"

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password

### Step 3: Update Your Config

Edit `backend/.env` and replace the MONGODB_URI line:

```env
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/content-schedule-manager?retryWrites=true&w=majority
```

Make sure to:
- Replace `YOUR_PASSWORD` with your actual password
- Add `/content-schedule-manager` before the `?` (this is your database name)

### Step 4: Restart the Server

Stop the server (Ctrl+C) and start again:
```bash
npm run dev
```

Now try registering again! ✅

---

## Alternative: Install MongoDB Locally

If you prefer to run MongoDB on your machine:

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Restart your app
npm run dev
```

---

## Verify It's Working

Once connected, you should see:
```
Connected to MongoDB
Server running on port 3001
```

Then registration will work! 🎉
