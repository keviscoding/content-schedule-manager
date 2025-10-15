# Storage Setup Guide - DigitalOcean Spaces

## 🚨 Upload Error: Storage Not Configured

If you're seeing this error when uploading videos:
```
"Storage (S3/Spaces) is not configured"
```

You need to set up DigitalOcean Spaces (or AWS S3) for video storage.

## Why Do We Need This?

Videos are **too large** to store in MongoDB. Instead:
- **MongoDB**: Stores metadata (title, description, status, URL)
- **Spaces/S3**: Stores actual video files (MP4, MOV, etc.)

## 🚀 Quick Setup - DigitalOcean Spaces

### Step 1: Create a Space

1. Go to [DigitalOcean Spaces](https://cloud.digitalocean.com/spaces)
2. Click **"Create a Space"**
3. Choose settings:
   - **Region**: Choose closest to you (e.g., `nyc3`, `sfo3`)
   - **Name**: `content-manager-videos` (or any name)
   - **File Listing**: Choose "Restrict File Listing" (more secure)
   - **CDN**: Optional (can enable later)
4. Click **"Create a Space"**

### Step 2: Get Access Keys

1. In DigitalOcean, go to **API** → **Spaces Keys**
2. Click **"Generate New Key"**
3. Give it a name: `content-manager-upload`
4. Click **"Generate Key"**
5. **IMPORTANT**: Copy both:
   - **Access Key** (looks like: `DO00ABCDEFGHIJKLMNOP`)
   - **Secret Key** (looks like: `abc123def456...`) ← Save this! You can't see it again!

### Step 3: Add to DigitalOcean Environment Variables

1. Go to your app in DigitalOcean App Platform
2. Click **"Settings"** → **"App-Level Environment Variables"**
3. Add these variables:

```bash
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=us-east-1
S3_BUCKET=content-manager-videos
S3_ACCESS_KEY=DO00ABCDEFGHIJKLMNOP
S3_SECRET_KEY=your_secret_key_here
```

**Important Notes:**
- Replace `nyc3` with your region (e.g., `sfo3`, `sgp1`, `fra1`)
- Replace `content-manager-videos` with your Space name
- Replace the keys with your actual keys
- Keep `S3_REGION=us-east-1` (it's for compatibility)

### Step 4: Redeploy

1. After adding environment variables, click **"Save"**
2. DigitalOcean will automatically redeploy
3. Wait for deployment to complete
4. Try uploading again!

## 📋 Environment Variables Reference

### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `S3_ENDPOINT` | `https://nyc3.digitaloceanspaces.com` | Your Spaces endpoint |
| `S3_REGION` | `us-east-1` | Keep as is (for compatibility) |
| `S3_BUCKET` | `content-manager-videos` | Your Space name |
| `S3_ACCESS_KEY` | `DO00ABCDEFGHIJKLMNOP` | Your Spaces access key |
| `S3_SECRET_KEY` | `abc123def456...` | Your Spaces secret key |

### Spaces Endpoints by Region

| Region | Endpoint |
|--------|----------|
| New York 3 | `https://nyc3.digitaloceanspaces.com` |
| San Francisco 3 | `https://sfo3.digitaloceanspaces.com` |
| Amsterdam 3 | `https://ams3.digitaloceanspaces.com` |
| Singapore 1 | `https://sgp1.digitaloceanspaces.com` |
| Frankfurt 1 | `https://fra1.digitaloceanspaces.com` |

## 🔍 Verify Setup

After adding environment variables and redeploying:

1. **Check Backend Logs**:
   - Go to DigitalOcean → Your App → Runtime Logs
   - Look for any S3/Spaces errors

2. **Test Upload**:
   - Try uploading a small video
   - If it works, you'll see the video in your Space
   - Go to Spaces → Your Space → Files

3. **Check Environment Variables**:
   - Go to Settings → Environment Variables
   - Verify all 5 variables are set
   - Make sure there are no typos

## 🐛 Troubleshooting

### Error: "Storage credentials are invalid"

**Cause**: Wrong access key or secret key

**Solution**:
1. Go to DigitalOcean → API → Spaces Keys
2. Generate a new key
3. Update `S3_ACCESS_KEY` and `S3_SECRET_KEY`
4. Redeploy

### Error: "The specified bucket does not exist"

**Cause**: Wrong bucket name or endpoint

**Solution**:
1. Check your Space name in DigitalOcean Spaces
2. Update `S3_BUCKET` to match exactly
3. Verify `S3_ENDPOINT` matches your region
4. Redeploy

### Error: "Access Denied"

**Cause**: Spaces key doesn't have permission

**Solution**:
1. Delete the old Spaces key
2. Generate a new one
3. Make sure it has "Read and Write" permissions
4. Update environment variables
5. Redeploy

### Upload works but can't view video

**Cause**: CORS not configured

**Solution**:
1. Go to your Space in DigitalOcean
2. Click **"Settings"** → **"CORS Configurations"**
3. Add this configuration:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3000
  }
]
```

4. Save and try again

## 💰 Pricing

**DigitalOcean Spaces Pricing** (as of 2024):
- **Storage**: $5/month for 250GB
- **Bandwidth**: $0.01/GB after 1TB
- **Requests**: Free

**Example Costs**:
- 100 videos (50GB): $5/month
- 500 videos (250GB): $5/month
- 1000 videos (500GB): $10/month

## 🔐 Security Best Practices

### 1. Restrict File Listing
- In Space settings, choose "Restrict File Listing"
- Prevents public browsing of files

### 2. Use Presigned URLs
- Already implemented in the code
- Videos are private by default
- Access only through temporary URLs

### 3. Rotate Keys Regularly
- Generate new Spaces keys every 3-6 months
- Delete old keys after updating

### 4. Separate Spaces for Environments
- Production: `content-manager-prod`
- Staging: `content-manager-staging`
- Development: `content-manager-dev`

## 🌐 Alternative: AWS S3

If you prefer AWS S3 instead of DigitalOcean Spaces:

### Environment Variables for S3:
```bash
# Remove S3_ENDPOINT (or leave empty)
S3_REGION=us-east-1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### S3 Setup:
1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Create a bucket
3. Go to IAM → Users → Create user
4. Attach policy: `AmazonS3FullAccess`
5. Create access key
6. Use the keys in environment variables

## 📝 Quick Checklist

Before uploading videos, make sure:

- [ ] DigitalOcean Space created
- [ ] Spaces access key generated
- [ ] All 5 environment variables added to DigitalOcean
- [ ] App redeployed after adding variables
- [ ] CORS configured (if needed)
- [ ] Test upload successful

## 🆘 Still Having Issues?

### Check Backend Logs:
```bash
# In DigitalOcean App Platform
Go to: Your App → Runtime Logs → backend

Look for:
- "Storage credentials are invalid"
- "The specified bucket does not exist"
- "Access Denied"
```

### Test Locally:
```bash
# In backend/.env
S3_ENDPOINT=https://nyc3.digitaloceanspaces.com
S3_REGION=us-east-1
S3_BUCKET=content-manager-videos
S3_ACCESS_KEY=your_key
S3_SECRET_KEY=your_secret

# Run backend
npm run dev --workspace=backend

# Try uploading
```

### Verify Environment Variables:
```bash
# In DigitalOcean App Platform
Settings → Environment Variables

Should see:
✓ S3_ENDPOINT
✓ S3_REGION
✓ S3_BUCKET
✓ S3_ACCESS_KEY
✓ S3_SECRET_KEY
```

---

**Once configured, uploads will work and videos will be stored in your Space!** 🎉

Need help? Check the backend logs for specific error messages.
