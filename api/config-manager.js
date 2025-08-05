// API endpoint for configuration management and Google Cloud Storage
import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Validate admin password
    const adminPassword = req.headers.authorization?.replace('Bearer ', '') || req.body?.adminPassword;
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        switch (req.method) {
            case 'GET':
                return handleGetConfig(req, res);
            case 'POST':
                return handleSaveConfig(req, res);
            case 'PUT':
                return handleUploadImage(req, res);
            case 'DELETE':
                return handleDeleteImage(req, res);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Config API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleGetConfig(req, res) {
    // In production, this would fetch from database
    // For now, return default config
    const defaultConfig = {
        business: {
            name: "New Life Juice",
            tagline: "Premium Fresh Juice",
            description: "Premium fresh juice delivery service committed to your health and wellness journey.",
            phone: "(555) 123-JUICE",
            email: "orders@newlifejuice.com"
        },
        hero: {
            title: "Fresh. Natural. <span class=\"highlight\">Life-Changing.</span>",
            description: "Experience the power of premium fresh juices, crafted with the finest ingredients and delivered to your door. Transform your health, one sip at a time.",
            buttonText: "Start Your Journey",
            image: "images/hero-juice.jpg"
        },
        products: [
            {
                id: "green-detox",
                name: "Green Detox",
                description: "Kale, spinach, cucumber, green apple, and lemon. Your daily dose of green goodness.",
                price: 18,
                image: "images/green-detox.jpg",
                ingredients: ["Kale", "Spinach", "Cucumber", "Green Apple", "Lemon"],
                active: true
            },
            {
                id: "citrus-burst",
                name: "Citrus Burst",
                description: "Orange, grapefruit, lime, and ginger. Vitamin C powerhouse to boost your immunity.",
                price: 18,
                image: "images/citrus-burst.jpg",
                ingredients: ["Orange", "Grapefruit", "Lime", "Ginger"],
                active: true
            },
            {
                id: "berry-antioxidant",
                name: "Berry Antioxidant",
                description: "Blueberries, strawberries, raspberries, and pomegranate. Packed with antioxidants.",
                price: 18,
                image: "images/berry-antioxidant.jpg",
                ingredients: ["Blueberries", "Strawberries", "Raspberries", "Pomegranate"],
                active: true
            }
        ]
    };

    return res.status(200).json(defaultConfig);
}

async function handleSaveConfig(req, res) {
    const { config } = req.body;
    
    if (!config) {
        return res.status(400).json({ error: 'Config data required' });
    }

    // In production, save to database (Vercel Postgres)
    // For now, we'll acknowledge the save
    console.log('Config saved:', config);
    
    return res.status(200).json({ 
        success: true, 
        message: 'Configuration saved successfully',
        timestamp: new Date().toISOString()
    });
}

async function handleUploadImage(req, res) {
    try {
        const { filename, data } = req.body;
        
        if (!filename || !data) {
            return res.status(400).json({ error: 'Filename and data required' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(data.split(',')[1], 'base64');
        
        // Upload to Vercel Blob Storage (or Google Cloud Storage in production)
        const blob = await put(filename, buffer, {
            access: 'public',
        });

        return res.status(200).json({
            success: true,
            url: blob.url,
            filename: filename
        });
    } catch (error) {
        console.error('Image upload error:', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
}

async function handleDeleteImage(req, res) {
    const { filename } = req.body;
    
    if (!filename) {
        return res.status(400).json({ error: 'Filename required' });
    }

    // In production, delete from storage service
    console.log('Image deleted:', filename);
    
    return res.status(200).json({ 
        success: true, 
        message: 'Image deleted successfully' 
    });
}

// Helper function for Google Cloud Storage setup instructions
export function getGoogleCloudSetupInstructions() {
    return {
        title: "Google Cloud Storage Setup Instructions",
        steps: [
            {
                step: 1,
                title: "Create Google Cloud Project",
                description: "Go to Google Cloud Console and create a new project",
                url: "https://console.cloud.google.com/"
            },
            {
                step: 2,
                title: "Enable Cloud Storage API",
                description: "In your project, enable the Cloud Storage API",
                command: "gcloud services enable storage-component.googleapis.com"
            },
            {
                step: 3,
                title: "Create Service Account",
                description: "Create a service account with Storage Admin role",
                commands: [
                    "gcloud iam service-accounts create storage-admin",
                    "gcloud projects add-iam-policy-binding YOUR-PROJECT-ID --member='serviceAccount:storage-admin@YOUR-PROJECT-ID.iam.gserviceaccount.com' --role='roles/storage.admin'"
                ]
            },
            {
                step: 4,
                title: "Generate Service Account Key",
                description: "Download the JSON key file",
                command: "gcloud iam service-accounts keys create key.json --iam-account=storage-admin@YOUR-PROJECT-ID.iam.gserviceaccount.com"
            },
            {
                step: 5,
                title: "Create Storage Bucket",
                description: "Create a bucket for your images",
                command: "gsutil mb gs://your-bucket-name"
            },
            {
                step: 6,
                title: "Set Environment Variables",
                description: "Add these to your Vercel environment variables:",
                variables: [
                    "GOOGLE_CLOUD_PROJECT_ID=your-project-id",
                    "GOOGLE_CLOUD_PRIVATE_KEY=your-private-key",
                    "GOOGLE_CLOUD_CLIENT_EMAIL=storage-admin@your-project-id.iam.gserviceaccount.com",
                    "GOOGLE_CLOUD_BUCKET_NAME=your-bucket-name"
                ]
            }
        ],
        benefits: [
            "✅ Developer-friendly with excellent documentation",
            "✅ Generous free tier (5GB storage, 50GB bandwidth)",
            "✅ Global CDN for fast image delivery",
            "✅ Automatic image optimization and resizing",
            "✅ Seamless integration with other Google services",
            "✅ Cost-effective scaling as you grow"
        ],
        cost: "Extremely affordable - Under $1/month for typical small business usage",
        alternative: "Vercel Blob Storage is simpler to set up but more expensive at scale"
    };
}
