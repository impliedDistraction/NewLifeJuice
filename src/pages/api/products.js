// Products Management API
// Handles CRUD operations for client products

import { supabase } from '../../lib/supabase.js';

export async function GET({ url }) {
    try {
        const searchParams = new URLSearchParams(url.search);
        const clientId = searchParams.get('clientId');

        let query = supabase
            .from('client_products')
            .select('*')
            .order('sort_order', { ascending: true });

        // Filter by client if specified
        if (clientId) {
            query = query.eq('client_id', clientId);
        }

        const { data: products, error } = await query;

        if (error) {
            return new Response(JSON.stringify({ 
                error: 'Failed to fetch products',
                message: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true,
            products: products || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Fetch products error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to fetch products',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function POST({ request }) {
    try {
        const body = await request.json();
        const { 
            name, 
            description, 
            price, 
            category, 
            imageUrl, 
            status = 'active',
            clientId,
            userId 
        } = body;

        // Validate required fields
        if (!name || !price || !clientId) {
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['name', 'price', 'clientId']
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get the highest sort order for this client
        const { data: maxOrder } = await supabase
            .from('client_products')
            .select('sort_order')
            .eq('client_id', clientId)
            .order('sort_order', { ascending: false })
            .limit(1)
            .single();

        const nextSortOrder = (maxOrder?.sort_order || 0) + 1;

        // Create product
        const { data: product, error } = await supabase
            .from('client_products')
            .insert([
                {
                    name,
                    description,
                    price: parseFloat(price),
                    category: category || 'signature',
                    image_url: imageUrl,
                    status,
                    client_id: clientId,
                    sort_order: nextSortOrder,
                    created_by: userId
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Product creation error:', error);
            return new Response(JSON.stringify({ 
                error: 'Failed to create product',
                message: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Product created successfully',
            product
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Product creation error:', error);
        return new Response(JSON.stringify({ 
            error: 'Product creation failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function PUT({ request }) {
    try {
        const body = await request.json();
        const { 
            id,
            name, 
            description, 
            price, 
            category, 
            imageUrl, 
            status,
            clientId,
            userId 
        } = body;

        // Validate required fields
        if (!id || !name || !price || !clientId) {
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['id', 'name', 'price', 'clientId']
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Update product
        const { data: product, error } = await supabase
            .from('client_products')
            .update({
                name,
                description,
                price: parseFloat(price),
                category,
                image_url: imageUrl,
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('client_id', clientId) // Security: ensure user can only update their client's products
            .select()
            .single();

        if (error) {
            console.error('Product update error:', error);
            return new Response(JSON.stringify({ 
                error: 'Failed to update product',
                message: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (!product) {
            return new Response(JSON.stringify({ 
                error: 'Product not found',
                message: 'Product not found or access denied' 
            }), { 
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Product updated successfully',
            product
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Product update error:', error);
        return new Response(JSON.stringify({ 
            error: 'Product update failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function DELETE({ url }) {
    try {
        const searchParams = new URLSearchParams(url.search);
        const id = searchParams.get('id');
        const clientId = searchParams.get('clientId');

        if (!id || !clientId) {
            return new Response(JSON.stringify({ 
                error: 'Missing required parameters',
                required: ['id', 'clientId']
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete product
        const { error } = await supabase
            .from('client_products')
            .delete()
            .eq('id', id)
            .eq('client_id', clientId); // Security: ensure user can only delete their client's products

        if (error) {
            console.error('Product deletion error:', error);
            return new Response(JSON.stringify({ 
                error: 'Failed to delete product',
                message: error.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Product deleted successfully'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Product deletion error:', error);
        return new Response(JSON.stringify({ 
            error: 'Product deletion failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
