import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET({ request }) {
  try {
    // Get client_id from query params or headers
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    
    let query = supabase.from('products').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    const { data: products, error } = await query.order('name');
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { user } = request.locals || {};
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Get user's client context
    const { data: userClient } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', user.id)
      .single();
    
    const productData = {
      ...body,
      client_id: userClient?.client_id || body.client_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function PUT({ request }) {
  try {
    const body = await request.json();
    const { user } = request.locals || {};
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { id, ...updateData } = body;
    updateData.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const { user } = request.locals || {};
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleCreateProduct(req, res) {
    const {
        name,
        description,
        price,
        image,
        ingredients,
        nutritionalInfo,
        benefits,
        category,
        featured = false,
        generateAIContent = false
    } = req.body;

    // Validate required fields
    if (!name || !price) {
        return res.status(400).json({ error: 'Name and price are required' });
    }

    let finalDescription = description;
    let finalBenefits = benefits;

    // Generate AI content if requested
    if (generateAIContent && ingredients) {
        try {
            // Generate description using AI
            const descriptionResponse = await fetch(`${req.headers.origin || 'https://www.newlifejuice.com'}/api/ai-assistant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Create a compelling product description for a juice called "${name}" with ingredients: ${ingredients.join(', ')}`,
                    type: 'product-description',
                    adminPassword: req.body.adminPassword
                })
            });

            if (descriptionResponse.ok) {
                const descData = await descriptionResponse.json();
                finalDescription = descData.suggestion;
            }

            // Generate benefits using AI
            const benefitsResponse = await fetch(`${req.headers.origin || 'https://www.newlifejuice.com'}/api/ai-assistant`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `List 3-5 key health benefits of a juice with these ingredients: ${ingredients.join(', ')}. Return as a comma-separated list.`,
                    type: 'marketing-copy',
                    adminPassword: req.body.adminPassword
                })
            });

            if (benefitsResponse.ok) {
                const benefitsData = await benefitsResponse.json();
                finalBenefits = benefitsData.suggestion.split(',').map(b => b.trim());
            }
        } catch (error) {
            console.error('AI content generation error:', error);
            // Continue with manual content
        }
    }

    const newProduct = {
        id: Date.now().toString(),
        name,
        description: finalDescription,
        price: parseFloat(price),
        image: image || '/images/placeholder-product.jpg',
        ingredients: ingredients || [],
        nutritionalInfo: nutritionalInfo || {},
        benefits: finalBenefits || [],
        category: category || 'general',
        featured,
        inStock: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // TODO: Save to database
    return res.status(201).json({
        success: true,
        product: newProduct,
        message: 'Product created successfully'
    });
}

async function handleUpdateProduct(req, res) {
    const { productId, ...updateData } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // TODO: Update in database
    const updatedProduct = {
        id: productId,
        ...updateData,
        updatedAt: new Date().toISOString()
    };

    return res.status(200).json({
        success: true,
        product: updatedProduct,
        message: 'Product updated successfully'
    });
}

async function handleDeleteProduct(req, res) {
    const { productId } = req.body;

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    // TODO: Delete from database
    return res.status(200).json({
        success: true,
        message: `Product ${productId} deleted successfully`
    });
}

/* 
PRODUCT CATALOG FEATURES:

✅ Current Implementation:
- Full CRUD operations for products
- AI-powered content generation
- Rich product data structure
- Authentication for modifications
- Nutritional information support
- Category and benefit management

🚀 Next Phase Features:
- Database integration (Vercel Postgres)
- Image upload integration
- Inventory management
- Price history tracking
- Seasonal product management
- Bulk operations
- Product analytics
- Search and filtering
- Product variants (sizes, flavors)
- Customer reviews integration

🎯 Multi-Client Considerations:
- Client-specific product catalogs
- White-label product templates
- Cross-client product sharing
- Client-specific pricing
- Custom branding per client
*/
