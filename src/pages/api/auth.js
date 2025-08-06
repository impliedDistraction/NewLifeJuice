// Supabase Authentication API
// Handles user registration, login, logout, and session management

import { supabase } from '../../lib/supabase.js';

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
    const url = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
    const key = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    return url && url !== 'https://placeholder.supabase.co' && key && key !== 'placeholder-key';
};

export async function POST({ request }) {
    try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
            return new Response(JSON.stringify({ 
                error: 'Authentication service not configured',
                message: 'Supabase environment variables are missing' 
            }), { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json();
        const { action, email, password, firstName, lastName, role = 'admin' } = body;

        switch (action) {
            case 'register':
                return await handleRegister(email, password, firstName, lastName, role);
            
            case 'login':
                return await handleLogin(email, password);
            
            case 'logout':
                return await handleLogout();
            
            case 'getUser':
                return await handleGetUser(body.accessToken);
            
            case 'refreshSession':
                return await handleRefreshSession(body.refreshToken);
            
            default:
                return new Response(JSON.stringify({ 
                    error: 'Invalid action',
                    validActions: ['register', 'login', 'logout', 'getUser', 'refreshSession']
                }), { 
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                });
        }

    } catch (error) {
        console.error('Auth API Error:', error);
        return new Response(JSON.stringify({ 
            error: 'Authentication failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleRegister(email, password, firstName, lastName, role) {
    try {
        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: role,
                    full_name: `${firstName} ${lastName}`
                }
            }
        });

        if (authError) {
            return new Response(JSON.stringify({ 
                error: 'Registration failed',
                message: authError.message 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // If user creation was successful, create client_user record
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('client_users')
                .insert([
                    {
                        id: authData.user.id,
                        client_id: null, // Will be set when user is assigned to a client
                        role: role,
                        email: email,
                        first_name: firstName,
                        last_name: lastName,
                        full_name: `${firstName} ${lastName}`,
                        profile_data: {
                            created_via: 'dashboard_registration',
                            initial_role: role
                        }
                    }
                ]);

            if (profileError) {
                console.error('Profile creation error:', profileError);
                // Don't fail the registration if profile creation fails
            }
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            user: {
                id: authData.user?.id,
                email: authData.user?.email,
                emailConfirmed: authData.user?.email_confirmed_at != null
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return new Response(JSON.stringify({ 
            error: 'Registration failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleLogin(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return new Response(JSON.stringify({ 
                error: 'Login failed',
                message: error.message 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user profile information
        const { data: profileData, error: profileError } = await supabase
            .from('client_users')
            .select(`
                *,
                clients (
                    id,
                    business_info,
                    subscription_tier,
                    status
                )
            `)
            .eq('id', data.user.id)
            .single();

        return new Response(JSON.stringify({ 
            success: true,
            user: data.user,
            session: data.session,
            profile: profileData,
            profileError: profileError?.message
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({ 
            error: 'Login failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            return new Response(JSON.stringify({ 
                error: 'Logout failed',
                message: error.message 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Logged out successfully'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Logout error:', error);
        return new Response(JSON.stringify({ 
            error: 'Logout failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleGetUser(accessToken) {
    try {
        const { data: { user }, error } = await supabase.auth.getUser(accessToken);

        if (error) {
            return new Response(JSON.stringify({ 
                error: 'Failed to get user',
                message: error.message 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get user profile
        const { data: profileData } = await supabase
            .from('client_users')
            .select(`
                *,
                clients (
                    id,
                    business_info,
                    subscription_tier,
                    status
                )
            `)
            .eq('id', user.id)
            .single();

        return new Response(JSON.stringify({ 
            success: true,
            user,
            profile: profileData
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Get user error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to get user',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

async function handleRefreshSession(refreshToken) {
    try {
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error) {
            return new Response(JSON.stringify({ 
                error: 'Session refresh failed',
                message: error.message 
            }), { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({ 
            success: true,
            session: data.session,
            user: data.user
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Refresh session error:', error);
        return new Response(JSON.stringify({ 
            error: 'Session refresh failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Health check endpoint
export async function GET() {
    const configured = isSupabaseConfigured();
    
    return new Response(JSON.stringify({ 
        status: 'Supabase Authentication API is running',
        configured: configured,
        endpoints: {
            'POST /api/auth': 'Authentication operations',
            'actions': ['register', 'login', 'logout', 'getUser', 'refreshSession']
        },
        supabaseConnected: configured ? !!supabase : false
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
