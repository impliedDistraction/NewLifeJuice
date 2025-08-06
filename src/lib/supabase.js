// Supabase client configuration
// Multi-tenant architecture utilities

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    console.log('Required: SUPABASE_URL, SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
})

// Platform owner utilities
export const platformOwnerAPI = {
    // Get all clients (platform owner only)
    async getAllClients() {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return data
    },

    // Create new client
    async createClient(clientData) {
        const { data, error } = await supabase
            .from('clients')
            .insert(clientData)
            .select()
            .single()
        
        if (error) throw error
        return data
    },

    // Get client by domain
    async getClientByDomain(domain) {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('domain', domain)
            .single()
        
        if (error) throw error
        return data
    }
}

// Client-specific utilities
export const clientAPI = {
    // Get current client context (based on auth or domain)
    async getCurrentClient() {
        // This will be enhanced based on subdomain or auth context
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return null

        // Get client_id from user metadata or client_users table
        const { data, error } = await supabase
            .from('client_users')
            .select('client_id, clients(*)')
            .eq('id', user.id)
            .single()
        
        if (error) return null
        return data?.clients
    },

    // Get client products
    async getProducts(clientId) {
        const { data, error } = await supabase
            .from('client_products')
            .select('*')
            .eq('client_id', clientId)
            .eq('status', 'active')
            .order('sort_order', { ascending: true })
        
        if (error) throw error
        return data
    },

    // Add/update product
    async saveProduct(clientId, productData) {
        const productPayload = {
            ...productData,
            client_id: clientId,
            updated_at: new Date().toISOString()
        }

        if (productData.id) {
            // Update existing
            const { data, error } = await supabase
                .from('client_products')
                .update(productPayload)
                .eq('id', productData.id)
                .eq('client_id', clientId) // Security: ensure client can only update their products
                .select()
                .single()
            
            if (error) throw error
            return data
        } else {
            // Create new
            const { data, error } = await supabase
                .from('client_products')
                .insert(productPayload)
                .select()
                .single()
            
            if (error) throw error
            return data
        }
    }
}

// AI Content utilities
export const aiContentAPI = {
    // Save AI generation
    async saveGeneration(clientId, userId, generationData) {
        const { data, error } = await supabase
            .from('ai_generations')
            .insert({
                client_id: clientId,
                user_id: userId,
                content_type: generationData.contentType,
                prompt: generationData.prompt,
                content: generationData.content,
                metadata: generationData.metadata || {},
                created_at: new Date().toISOString()
            })
            .select()
            .single()
        
        if (error) throw error
        return data
    },

    // Get client's AI generations
    async getGenerations(clientId, limit = 50) {
        const { data, error } = await supabase
            .from('ai_generations')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })
            .limit(limit)
        
        if (error) throw error
        return data
    },

    // Mark generation as used
    async markAsUsed(generationId, clientId) {
        const { data, error } = await supabase
            .from('ai_generations')
            .update({ used: true, used_at: new Date().toISOString() })
            .eq('id', generationId)
            .eq('client_id', clientId) // Security check
            .select()
            .single()
        
        if (error) throw error
        return data
    }
}

// Authentication utilities
export const authAPI = {
    // Sign in user
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        
        if (error) throw error
        return data
    },

    // Sign up new user
    async signUp(email, password, metadata = {}) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        })
        
        if (error) throw error
        return data
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    // Get current session
    async getSession() {
        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    // Get current user
    async getUser() {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    }
}

// File storage utilities
export const storageAPI = {
    // Upload file to client's folder
    async uploadFile(clientId, file, folder = 'images') {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `client-${clientId}/${folder}/${fileName}`

        const { data, error } = await supabase.storage
            .from('client-assets')
            .upload(filePath, file)

        if (error) throw error

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('client-assets')
            .getPublicUrl(filePath)

        return {
            path: filePath,
            url: publicUrl,
            fileName: fileName
        }
    },

    // Get file URL
    getFileUrl(filePath) {
        const { data: { publicUrl } } = supabase.storage
            .from('client-assets')
            .getPublicUrl(filePath)
        
        return publicUrl
    },

    // Delete file
    async deleteFile(filePath) {
        const { error } = await supabase.storage
            .from('client-assets')
            .remove([filePath])
        
        if (error) throw error
    }
}

// Business type templates
export const businessTypes = {
    'juice-bar': {
        name: 'Juice Bar / Health Food',
        components: ['products', 'ordering', 'seasonal-menu'],
        fields: ['ingredients', 'nutritional-info', 'seasonal-availability'],
        aiPrompts: [
            'Write a compelling product description for a healthy juice blend',
            'Create catchy marketing copy for a juice delivery service',
            'Generate social media content about juice health benefits'
        ]
    },
    'insurance': {
        name: 'Insurance Agency',
        components: ['services', 'quote-calculator', 'client-portal'],
        fields: ['coverage-types', 'premium-calculator', 'policy-documents'],
        aiPrompts: [
            'Write clear explanations of insurance coverage options',
            'Create content comparing different insurance policies',
            'Generate client communication about policy benefits'
        ]
    },
    'restaurant': {
        name: 'Restaurant / Food Service',
        components: ['menu', 'reservations', 'ordering'],
        fields: ['allergen-info', 'seasonal-items', 'specials'],
        aiPrompts: [
            'Write appetizing descriptions for menu items',
            'Create content for daily specials and promotions',
            'Generate social media posts about new dishes'
        ]
    },
    'generic': {
        name: 'Generic Business',
        components: ['services', 'contact', 'about'],
        fields: ['service-description', 'pricing', 'contact-info'],
        aiPrompts: [
            'Write professional service descriptions',
            'Create compelling about us content',
            'Generate marketing copy for business services'
        ]
    }
}

// Helper function to get business type configuration
export function getBusinessTypeConfig(businessType) {
    return businessTypes[businessType] || businessTypes.generic
}

export default supabase
