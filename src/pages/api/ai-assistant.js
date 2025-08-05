// AI Assistant API - OpenAI Integration
// Handles content generation requests from admin dashboard

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { prompt, type, adminPassword, test } = body;

        // Admin authentication
        const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'NewLife2025!';
        
        if (adminPassword !== ADMIN_PASSWORD) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Test endpoint for authentication
        if (test) {
            return new Response(JSON.stringify({ status: 'AI service available' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // OpenAI API integration
        const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
        
        if (!OPENAI_API_KEY) {
            return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Enhance prompt based on content type
        let enhancedPrompt = prompt;
        
        switch (type) {
            case 'product-description':
                enhancedPrompt = `Create a compelling product description for a premium juice product. Focus on health benefits, taste, and quality. Make it engaging and sales-oriented. Request: ${prompt}`;
                break;
            case 'marketing-copy':
                enhancedPrompt = `Write persuasive marketing copy for a premium juice brand. Focus on health, wellness, and lifestyle benefits. Make it compelling and action-oriented. Request: ${prompt}`;
                break;
            case 'social-media':
                enhancedPrompt = `Create an engaging social media post for a health-focused juice brand. Include relevant hashtags and make it shareable. Keep it concise and visually appealing. Request: ${prompt}`;
                break;
            case 'blog-post':
                enhancedPrompt = `Write a blog post section about health and wellness related to premium juices. Make it informative, engaging, and SEO-friendly. Request: ${prompt}`;
                break;
            case 'email-campaign':
                enhancedPrompt = `Create email marketing content for a premium juice brand. Make it personal, engaging, and include a clear call-to-action. Request: ${prompt}`;
                break;
        }

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional copywriter specializing in health and wellness brands. Create compelling, engaging content that converts readers into customers.'
                    },
                    {
                        role: 'user',
                        content: enhancedPrompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('OpenAI API error:', error);
            return new Response(JSON.stringify({ error: 'Failed to generate content' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();
        const suggestion = data.choices[0]?.message?.content?.trim();

        if (!suggestion) {
            return new Response(JSON.stringify({ error: 'No content generated' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ suggestion }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI Assistant API error:', error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Health check endpoint
export async function GET() {
    return new Response(JSON.stringify({ 
        status: 'AI Assistant API is running',
        endpoints: {
            'POST /api/ai-assistant': 'Generate AI content with authentication'
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
