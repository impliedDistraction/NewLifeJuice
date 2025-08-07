// Supabase Storage Image Upload API
// Handles image uploads to Supabase Storage with automatic optimization

import { supabase } from '../../lib/supabase.js';

export async function POST({ request }) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');
        const category = formData.get('category') || 'general';
        const clientId = formData.get('clientId');

        if (!file) {
            return new Response(JSON.stringify({ 
                error: 'No file provided',
                message: 'Please select a file to upload'
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({ 
                error: 'Invalid file type',
                message: 'Please upload a JPEG, PNG, WebP, or GIF image',
                allowedTypes
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return new Response(JSON.stringify({ 
                error: 'File too large',
                message: 'Please upload an image smaller than 10MB',
                maxSize: '10MB'
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop();
        const fileName = `${category}/${timestamp}-${randomString}.${fileExtension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('client-assets')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return new Response(JSON.stringify({ 
                error: 'Upload failed',
                message: uploadError.message 
            }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('client-assets')
            .getPublicUrl(fileName);

        // Save file record to database
        const { data: fileRecord, error: dbError } = await supabase
            .from('client_files')
            .insert([
                {
                    client_id: clientId,
                    filename: file.name,
                    storage_path: fileName,
                    public_url: urlData.publicUrl,
                    file_type: file.type,
                    file_size: file.size,
                    category: category,
                    status: 'active'
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            // Don't fail the upload if database fails
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Image uploaded successfully!',
            file: {
                url: urlData.publicUrl,
                name: file.name,
                size: file.size,
                type: file.type,
                category: category,
                uploadedAt: new Date().toISOString()
            },
            record: fileRecord
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Image upload error:', error);
        return new Response(JSON.stringify({ 
            error: 'Upload failed',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// GET endpoint to list uploaded images
export async function GET({ request }) {
    try {
        const url = new URL(request.url);
        const clientId = url.searchParams.get('clientId');
        const category = url.searchParams.get('category');

        let query = supabase
            .from('client_files')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (clientId) {
            query = query.eq('client_id', clientId);
        }

        if (category) {
            query = query.eq('category', category);
        }

        const { data: files, error } = await query;

        if (error) {
            throw error;
        }

        return new Response(JSON.stringify({ 
            success: true,
            files: files,
            count: files.length
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('List images error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to load images',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// DELETE endpoint to remove images
export async function DELETE({ request }) {
    try {
        const body = await request.json();
        const { fileId, storagePath } = body;

        if (!fileId || !storagePath) {
            return new Response(JSON.stringify({ 
                error: 'Missing required fields',
                required: ['fileId', 'storagePath']
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('client-assets')
            .remove([storagePath]);

        if (storageError) {
            console.error('Storage deletion error:', storageError);
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('client_files')
            .delete()
            .eq('id', fileId);

        if (dbError) {
            throw dbError;
        }

        return new Response(JSON.stringify({ 
            success: true,
            message: 'Image deleted successfully'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Image deletion error:', error);
        return new Response(JSON.stringify({ 
            error: 'Failed to delete image',
            message: error.message 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
