# Google Cloud Storage Setup Guide

## Why Google Cloud Storage?

🌟 **Developer-Friendly Features:**
- Excellent documentation and SDKs
- Simple REST API integration
- Powerful CLI tools for management
- Seamless integration with other Google services

💰 **Cost-Effective:**
- **Free Tier**: 5GB storage + 50GB bandwidth per month
- **Pricing**: $0.02/GB/month for standard storage
- **Bandwidth**: $0.12/GB for egress (very reasonable)
- **Typical Cost**: Under $1/month for small businesses

🚀 **Performance Benefits:**
- Global CDN with edge caching
- Automatic image optimization
- Resizing and format conversion on-the-fly
- 99.9% uptime SLA

## Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name your project (e.g., "new-life-juice-platform")
4. Note your Project ID (will be auto-generated)

### Step 2: Enable Required APIs

```bash
# Install Google Cloud CLI first
# https://cloud.google.com/sdk/docs/install

# Enable Cloud Storage API
gcloud services enable storage-component.googleapis.com

# Enable Cloud Storage JSON API (for better performance)
gcloud services enable storage.googleapis.com
```

### Step 3: Create Service Account

```bash
# Create service account
gcloud iam service-accounts create storage-admin \
  --display-name="Storage Admin for New Life Juice Platform"

# Grant Storage Admin role
gcloud projects add-iam-policy-binding YOUR-PROJECT-ID \
  --member="serviceAccount:storage-admin@YOUR-PROJECT-ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

# Generate key file
gcloud iam service-accounts keys create gcs-key.json \
  --iam-account=storage-admin@YOUR-PROJECT-ID.iam.gserviceaccount.com
```

### Step 4: Create Storage Bucket

```bash
# Create bucket with global access
gsutil mb -p YOUR-PROJECT-ID -c STANDARD -l US gs://your-platform-images

# Make bucket publicly readable (for website images)
gsutil iam ch allUsers:objectViewer gs://your-platform-images

# Set CORS for web uploads
echo '[{"origin":["*"],"method":["GET","POST","PUT"],"responseHeader":["Content-Type"],"maxAgeSeconds":3600}]' | gsutil cors set /dev/stdin gs://your-platform-images
```

### Step 5: Configure Environment Variables

Add these to your Vercel environment variables:

```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_BUCKET_NAME=your-platform-images
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLOUD_CLIENT_EMAIL=storage-admin@your-project-id.iam.gserviceaccount.com
```

### Step 6: Install Dependencies

```bash
npm install @google-cloud/storage
```

## Implementation Example

```javascript
// /api/upload-image.js
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename, data, clientId } = req.body;
    
    // Create unique filename with client prefix
    const uniqueFilename = `${clientId}/${Date.now()}-${filename}`;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(data.split(',')[1], 'base64');
    
    // Upload to Google Cloud Storage
    const file = bucket.file(uniqueFilename);
    await file.save(buffer, {
      metadata: {
        contentType: 'image/jpeg', // or detect from filename
      },
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${uniqueFilename}`;
    
    return res.status(200).json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
```

## Advanced Features

### Image Optimization
```javascript
// Automatic image resizing and optimization
const optimizedUrl = `https://storage.googleapis.com/${bucketName}/${filename}=s400-c`; // 400px width, cropped
```

### CDN Integration
```javascript
// Use Google Cloud CDN for global distribution
const cdnUrl = `https://cdn.yourdomain.com/${filename}`;
```

### Batch Operations
```javascript
// Upload multiple files efficiently
const promises = files.map(file => uploadToGCS(file));
await Promise.all(promises);
```

## Security Best Practices

1. **Use signed URLs** for sensitive uploads
2. **Validate file types** before upload
3. **Implement rate limiting** to prevent abuse
4. **Use IAM policies** for fine-grained access control
5. **Monitor usage** with Cloud Monitoring

## Alternative: Vercel Blob Storage

If you prefer simplicity over cost optimization:

```bash
npm install @vercel/blob
```

```javascript
import { put } from '@vercel/blob';

const blob = await put(filename, buffer, {
  access: 'public',
});
```

**Comparison:**
- **Google Cloud**: More setup, better pricing at scale, more features
- **Vercel Blob**: Easier setup, more expensive ($0.15/GB vs $0.02/GB), simpler integration

## Next Steps

1. Set up the Google Cloud project
2. Configure environment variables in Vercel
3. Test image upload functionality
4. Implement automatic image optimization
5. Add image management to admin dashboard

This setup will scale beautifully as we add more clients to the platform! 🚀
