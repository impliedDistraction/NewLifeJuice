// Supabase Data Management for Dashboard
// This handles all database operations for products, content, and clients

import { supabase } from './supabase.js';

class DataManager {
    constructor() {
        this.currentUser = null;
        this.currentClient = null;
        this.cache = {
            products: [],
            content: [],
            clients: []
        };
    }

    // Initialize and authenticate
    async initialize() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            
            this.currentUser = user;
            
            // Check if user is platform owner or get their client
            if (user?.user_metadata?.role === 'platform_owner') {
                await this.loadAllClients();
            } else {
                await this.loadUserClient();
            }
            
            return true;
        } catch (error) {
            console.error('Failed to initialize data manager:', error);
            return false;
        }
    }

    // Client Management
    async loadAllClients() {
        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .order('name');
            
            if (error) throw error;
            
            this.cache.clients = data || [];
            return data;
        } catch (error) {
            console.error('Failed to load clients:', error);
            return [];
        }
    }

    async loadUserClient() {
        try {
            // Get user's client association
            const { data: userData, error: userError } = await supabase
                .from('client_users')
                .select('client_id, clients(*)')
                .eq('auth_user_id', this.currentUser.id)
                .single();
            
            if (userError) throw userError;
            
            this.currentClient = userData.clients;
            this.cache.clients = [userData.clients];
            return userData.clients;
        } catch (error) {
            console.error('Failed to load user client:', error);
            return null;
        }
    }

    async createClient(clientData) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .insert([clientData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Update cache
            this.cache.clients.push(data);
            return { success: true, data };
        } catch (error) {
            console.error('Failed to create client:', error);
            return { success: false, error: error.message };
        }
    }

    async updateClient(clientId, updates) {
        try {
            const { data, error } = await supabase
                .from('clients')
                .update(updates)
                .eq('id', clientId)
                .select()
                .single();
            
            if (error) throw error;
            
            // Update cache
            const index = this.cache.clients.findIndex(c => c.id === clientId);
            if (index !== -1) {
                this.cache.clients[index] = data;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Failed to update client:', error);
            return { success: false, error: error.message };
        }
    }

    // Product Management
    async loadProducts(clientId) {
        try {
            const { data, error } = await supabase
                .from('client_products')
                .select('*')
                .eq('client_id', clientId)
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            
            this.cache.products = data || [];
            return data;
        } catch (error) {
            console.error('Failed to load products:', error);
            return [];
        }
    }

    async createProduct(productData) {
        try {
            const { data, error } = await supabase
                .from('client_products')
                .insert([productData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Update cache
            this.cache.products.push(data);
            return { success: true, data };
        } catch (error) {
            console.error('Failed to create product:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProduct(productId, updates) {
        try {
            const { data, error } = await supabase
                .from('client_products')
                .update(updates)
                .eq('id', productId)
                .select()
                .single();
            
            if (error) throw error;
            
            // Update cache
            const index = this.cache.products.findIndex(p => p.id === productId);
            if (index !== -1) {
                this.cache.products[index] = data;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Failed to update product:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(productId) {
        try {
            const { error } = await supabase
                .from('client_products')
                .delete()
                .eq('id', productId);
            
            if (error) throw error;
            
            // Update cache
            this.cache.products = this.cache.products.filter(p => p.id !== productId);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete product:', error);
            return { success: false, error: error.message };
        }
    }

    // Content Management
    async loadContent(clientId) {
        try {
            const { data, error } = await supabase
                .from('client_content')
                .select('*')
                .eq('client_id', clientId)
                .order('sort_order', { ascending: true });
            
            if (error) throw error;
            
            this.cache.content = data || [];
            return data;
        } catch (error) {
            console.error('Failed to load content:', error);
            return [];
        }
    }

    async createContent(contentData) {
        try {
            const { data, error } = await supabase
                .from('client_content')
                .insert([contentData])
                .select()
                .single();
            
            if (error) throw error;
            
            // Update cache
            this.cache.content.push(data);
            return { success: true, data };
        } catch (error) {
            console.error('Failed to create content:', error);
            return { success: false, error: error.message };
        }
    }

    async updateContent(contentId, updates) {
        try {
            const { data, error } = await supabase
                .from('client_content')
                .update(updates)
                .eq('id', contentId)
                .select()
                .single();
            
            if (error) throw error;
            
            // Update cache
            const index = this.cache.content.findIndex(c => c.id === contentId);
            if (index !== -1) {
                this.cache.content[index] = data;
            }
            
            return { success: true, data };
        } catch (error) {
            console.error('Failed to update content:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteContent(contentId) {
        try {
            const { error } = await supabase
                .from('client_content')
                .delete()
                .eq('id', contentId);
            
            if (error) throw error;
            
            // Update cache
            this.cache.content = this.cache.content.filter(c => c.id !== contentId);
            return { success: true };
        } catch (error) {
            console.error('Failed to delete content:', error);
            return { success: false, error: error.message };
        }
    }

    // AI Content Generation
    async generateContent(type, prompt, clientId) {
        try {
            const response = await fetch('/api/ai-assistant.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'generate_content',
                    content_type: type,
                    prompt: prompt,
                    client_id: clientId
                })
            });
            
            if (!response.ok) throw new Error('AI generation failed');
            
            const result = await response.json();
            return { success: true, data: result };
        } catch (error) {
            console.error('Failed to generate content:', error);
            return { success: false, error: error.message };
        }
    }

    // Utility methods
    getClientById(id) {
        return this.cache.clients.find(c => c.id === id);
    }

    getProductById(id) {
        return this.cache.products.find(p => p.id === id);
    }

    getContentById(id) {
        return this.cache.content.find(c => c.id === id);
    }

    isPlatformOwner() {
        return this.currentUser?.user_metadata?.role === 'platform_owner';
    }
}

// Create global instance
window.dataManager = new DataManager();

export default DataManager;
