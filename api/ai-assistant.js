// Serverless function for AI assistance - Deploy to Vercel/Netlify
export default async function handler(req, res) {
    // Add CORS headers for GitHub Pages domain
    res.setHeader('Access-Control-Allow-Origin', 'https://impliedDistraction.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, type, adminPassword, test } = req.body;

    // Handle test requests
    if (test) {
        return res.status(200).json({ status: 'AI service available' });
    }

    // Validate admin password (stored as environment variable)
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized access' });
    }

    if (!prompt || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: getSystemPrompt(type)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            throw new Error('AI service temporarily unavailable');
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('Invalid response from AI service');
        }

        return res.status(200).json({ 
            suggestion: data.choices[0].message.content.trim(),
            usage: data.usage
        });

    } catch (error) {
        console.error('AI Assistant Error:', error);
        return res.status(500).json({ 
            error: 'AI service temporarily unavailable. Please try again later.' 
        });
    }
}

function getSystemPrompt(type) {
    const prompts = {
        'product-description': `You are a marketing expert for New Life Juice, a premium fresh juice delivery company. 
        Write compelling, health-focused product descriptions that are 2-3 sentences long. 
        Focus on ingredients, health benefits, taste, and energy. 
        Use an engaging, professional tone that appeals to health-conscious customers. 
        Include sensory details and specific benefits.`,

        'hero-copy': `You are a copywriter for New Life Juice, a premium health-focused juice company. 
        Create engaging hero section copy that converts visitors into customers. 
        Keep headlines under 8 words and descriptions under 25 words. 
        Focus on freshness, health transformation, convenience, and premium quality. 
        Use action-oriented language that inspires healthy lifestyle choices.`,

        'marketing-text': `You are a marketing expert for New Life Juice, a wellness-focused business. 
        Create professional, health-conscious copy that builds trust and encourages healthy lifestyle choices. 
        Use warm, approachable language that emphasizes natural ingredients, health benefits, and convenience. 
        Avoid overly salesy language and focus on authentic wellness messaging.`,

        'seasonal-promo': `You are creating seasonal promotional content for New Life Juice. 
        Write engaging copy that highlights seasonal ingredients, limited-time offerings, and seasonal health benefits. 
        Keep the tone exciting but professional, emphasizing freshness and seasonal wellness themes. 
        Include a subtle call-to-action and seasonal urgency.`,

        'business-copy': `You are writing business copy for New Life Juice, a premium juice delivery service. 
        Create professional, trustworthy content for business information, about sections, or service descriptions. 
        Emphasize quality, reliability, health expertise, and customer service. 
        Use confident, professional language that builds credibility.`,

        'feature-benefit': `You are highlighting features and benefits for New Life Juice services. 
        Write concise, benefit-focused copy that explains how features improve the customer's life. 
        Focus on convenience, health benefits, quality, and customer experience. 
        Use clear, compelling language that connects features to real customer value.`
    };

    return prompts[type] || prompts['marketing-text'];
}
