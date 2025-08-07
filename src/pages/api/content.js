import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET({ request }) {
  try {
    const url = new URL(request.url);
    const clientId = url.searchParams.get('client_id');
    const contentType = url.searchParams.get('content_type');
    
    let query = supabase.from('content').select('*');
    
    if (clientId) {
      query = query.eq('client_id', clientId);
    }
    
    if (contentType) {
      query = query.eq('content_type', contentType);
    }
    
    const { data: content, error } = await query.order('updated_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify(content), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
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
    
    const contentData = {
      ...body,
      client_id: userClient?.client_id || body.client_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('content')
      .insert([contentData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify(data), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating content:', error);
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
      .from('content')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating content:', error);
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
      .from('content')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
