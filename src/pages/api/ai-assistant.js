// AI Assistant API - OpenAI Integration with Supabase Authentication
// Handles content generation requests from admin dashboard

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { prompt, type, userId, test } = body;

        // Authentication check - now supports both old password and new Supabase auth
        const authHeader = request.headers.get('authorization');
        const supabaseToken = authHeader?.replace('Bearer ', '');
        
        if (!supabaseToken && !body.adminPassword) {
            return new Response(JSON.stringify({
                error: 'Authentication required',
                message: 'Please provide authentication credentials'
            }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Legacy password auth support for backward compatibility
        if (body.adminPassword) {
            const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'NewLife2025!';
            if (body.adminPassword !== ADMIN_PASSWORD) {
                return new Response(JSON.stringify({
                    error: 'Invalid credentials',
                    message: 'Authentication failed'
                }), {
                    status: 401,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Test endpoint for authentication
        if (test) {
            return new Response(JSON.stringify({ 
                status: 'authenticated',
                message: 'AI Assistant API is ready',
                userId: userId || 'legacy_admin'
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!prompt || !type) {
            return new Response(JSON.stringify({
                error: 'Missing required fields',
                message: 'Please provide both prompt and type'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // OpenAI API integration
        const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
        
        if (!OPENAI_API_KEY) {
            return new Response(JSON.stringify({
                error: 'OpenAI API key not configured',
                message: 'Please configure OPENAI_API_KEY environment variable'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Enhance prompt based on content type
        let enhancedPrompt = getSystemPrompt(type) + "\n\n" + prompt;

        console.log('Calling OpenAI API with prompt:', enhancedPrompt.substring(0, 100) + '...');

        // Call OpenAI API
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
                        content: getSystemPrompt(type)
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.7,
            }),
        });

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json();
            console.error('OpenAI API error:', errorData);
            return new Response(JSON.stringify({
                error: 'OpenAI API error',
                message: errorData.error?.message || 'Failed to generate content'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const openaiData = await openaiResponse.json();
        const generatedContent = openaiData.choices[0]?.message?.content;

        if (!generatedContent) {
            return new Response(JSON.stringify({
                error: 'No content generated',
                message: 'OpenAI did not return any content'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Generated content:', generatedContent.substring(0, 100) + '...');

        return new Response(JSON.stringify({
            success: true,
            content: generatedContent,
            suggestion: generatedContent, // Legacy field name
            type: type,
            userId: userId,
            timestamp: new Date().toISOString()
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('AI Assistant API error:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

function getSystemPrompt(type) {
    const prompts = {
        'social-media': `You are a social media expert for New Life Juice, a premium fresh juice delivery company. \n        Create engaging, authentic social media content that highlights health benefits, freshness, and convenience. \n        Use a friendly, energetic tone. Include relevant emojis and hashtags.`,
        
        'product-description': `You are a product copywriter for New Life Juice. Create compelling product descriptions \n        that emphasize premium quality, health benefits, fresh ingredients, and the convenience of delivery. \n        Use persuasive but authentic language.`,
        
        'blog-content': `You are a health and wellness content writer for New Life Juice. Create informative, \n        engaging blog content about nutrition, juicing benefits, healthy lifestyle tips, and seasonal wellness advice. \n        Write in an expert but approachable tone.`,
        
        'email-marketing': `You are an email marketing specialist for New Life Juice. Create compelling email content \n        that drives engagement and conversions while maintaining a personal, friendly tone. Focus on value for customers.`,
        
        'website-copy': `You are a web copywriter for New Life Juice. Create clear, persuasive website copy that \n        converts visitors into customers. Emphasize benefits, build trust, and include clear calls-to-action.`,
        
        'promotional': `You are a promotional content creator for New Life Juice. Create exciting promotional content \n        for special offers, new products, or seasonal campaigns. Use urgency and value to drive action.`,
        
        'seasonal': `You are a seasonal content creator for New Life Juice. Create content that ties into current \n        seasons, holidays, or health trends. Make it relevant and timely for maximum engagement.`,
        
        'health-tips': `You are a health and nutrition expert creating content for New Life Juice customers. \n        Share practical, science-based health tips that relate to juicing, nutrition, and wellness.`
    };

    return prompts[type] || prompts['social-media'];
}

// Health check endpoint
export async function GET() {
    return new Response(JSON.stringify({ 
        status: 'AI Assistant API is running',
        version: '2.0 - Supabase Integration',
        endpoints: {
            'POST /api/ai-assistant': 'Generate AI content with Supabase or legacy authentication',
            'GET /api/ai-assistant': 'Health check'
        },
        authentication: {
            supabase: 'Bearer token in Authorization header',
            legacy: 'adminPassword in request body'
        }
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
