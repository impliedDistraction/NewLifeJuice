// Client Onboarding API - Business Registration System
// Handles new business sign-up and client creation

import { supabase } from '../../lib/supabase.js';

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { 
            businessName,
            businessType, 
            domain,
            ownerEmail,
            ownerName,
            phone,
            description,
            userId // From authenticated user
        } = body;

        // Validate required fields
        if (!businessName || !businessType || !ownerEmail || !userId) {
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['businessName', 'businessType', 'ownerEmail', 'userId']
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create new client
        const { data: client, error: clientError } = await supabase
            .from('clients')
            .insert([
                {
                    name: businessName,
                    domain: domain || null,
                    business_type: businessType,
                    status: 'active',
                    business_info: {
                        tagline: `Fresh ${businessType} services`,
                        phone: phone || '',
                        email: ownerEmail,
                        description: description || `Welcome to ${businessName}`,
                        owner_name: ownerName
                    },
                    branding: {
                        primary_color: getBusinessTypeColors(businessType).primary,
                        secondary_color: getBusinessTypeColors(businessType).secondary,
                        accent_color: getBusinessTypeColors(businessType).accent
                    },
                    settings: {
                        features: getBusinessTypeFeatures(businessType),
                        template: businessType,
                        onboarding_completed: true
                    }
                }
            ])
            .select()
            .single();

        if (clientError) {
            console.error('Client creation error:', clientError);
            return new Response(JSON.stringify({ 
                error: 'Failed to create business profile',
                message: clientError.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update the user's client_users record to link them to this client
        const { error: linkError } = await supabase
            .from('client_users')
            .update({ client_id: client.id })
            .eq('id', userId);

        if (linkError) {
            console.error('User linking error:', linkError);
            // Don't fail the whole operation, but log it
        }

        // Create starter products based on business type
        await createStarterProducts(client.id, businessType);

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Business profile created successfully!',
            client: client,
            nextSteps: [
                'Customize your products and services',
                'Upload your business images',
                'Configure your branding colors',
                'Set up your domain (optional)'
            ]
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Onboarding error:', error);
        return new Response(JSON.stringify({ 
            error: 'Business registration failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to get business type colors
function getBusinessTypeColors(businessType) {
    const colorSchemes = {
        'juice-bar': {
            primary: '#10B981', // Green
            secondary: '#F59E0B', // Orange  
            accent: '#EF4444' // Red
        },
        'insurance': {
            primary: '#3B82F6', // Blue
            secondary: '#6366F1', // Indigo
            accent: '#8B5CF6' // Purple
        },
        'restaurant': {
            primary: '#DC2626', // Red
            secondary: '#F59E0B', // Orange
            accent: '#10B981' // Green
        },
        'generic': {
            primary: '#6B7280', // Gray
            secondary: '#3B82F6', // Blue
            accent: '#10B981' // Green
        }
    };

    return colorSchemes[businessType] || colorSchemes.generic;
}

// Helper function to get business type features
function getBusinessTypeFeatures(businessType) {
    const featuresSets = {
        'juice-bar': ['online_ordering', 'seasonal_menu', 'nutrition_info', 'delivery_tracking'],
        'insurance': ['quote_calculator', 'policy_management', 'claims_tracking', 'appointment_booking'],
        'restaurant': ['online_ordering', 'reservation_system', 'menu_management', 'loyalty_program'],
        'generic': ['contact_forms', 'service_booking', 'portfolio_gallery', 'testimonials']
    };

    return featuresSets[businessType] || featuresSets.generic;
}

// Helper function to create starter products
async function createStarterProducts(clientId, businessType) {
    const starterProducts = {
        'juice-bar': [
            {
                name: 'Green Detox',
                description: 'Refreshing blend of spinach, cucumber, apple, and lemon',
                price: 18.00,
                category: 'signature',
                image_url: '/images/placeholder-green-juice.jpg',
                is_active: true,
                sort_order: 1
            },
            {
                name: 'Citrus Burst',
                description: 'Energizing mix of orange, grapefruit, and ginger',
                price: 18.00,
                category: 'signature', 
                image_url: '/images/placeholder-orange-juice.jpg',
                is_active: true,
                sort_order: 2
            }
        ],
        'insurance': [
            {
                name: 'Auto Insurance Quote',
                description: 'Comprehensive auto insurance coverage',
                price: 0.00, // Quote-based
                category: 'auto',
                image_url: '/images/placeholder-auto.jpg',
                is_active: true,
                sort_order: 1
            }
        ],
        'restaurant': [
            {
                name: 'House Special',
                description: 'Our signature dish made with fresh, local ingredients',
                price: 24.99,
                category: 'entrees',
                image_url: '/images/placeholder-dish.jpg',
                is_active: true,
                sort_order: 1
            }
        ]
    };

    const products = starterProducts[businessType] || [];
    
    if (products.length > 0) {
        const productsWithClientId = products.map(product => ({
            ...product,
            client_id: clientId
        }));

        const { error } = await supabase
            .from('client_products')
            .insert(productsWithClientId);

        if (error) {
            console.error('Starter products creation error:', error);
        }
    }
}

// GET endpoint for business type options
export async function GET() {
    const businessTypes = [
        {
            value: 'juice-bar',
            label: 'Juice Bar / Health Food',
            description: 'Fresh juices, smoothies, and healthy food options',
            features: ['Seasonal menus', 'Online ordering', 'Nutrition tracking']
        },
        {
            value: 'insurance',
            label: 'Insurance Agency',
            description: 'Auto, home, life, and business insurance services',
            features: ['Quote calculator', 'Policy management', 'Claims tracking']
        },
        {
            value: 'restaurant',
            label: 'Restaurant / Food Service',
            description: 'Dining, takeout, and catering services',
            features: ['Menu management', 'Online ordering', 'Reservations']
        },
        {
            value: 'generic',
            label: 'Other Business Type',
            description: 'Professional services, consulting, or other business',
            features: ['Service booking', 'Portfolio', 'Contact management']
        }
    ];

    return new Response(JSON.stringify({
        businessTypes,
        message: 'Available business types for onboarding'
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
