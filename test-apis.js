// API Connection Test Script
// Run this in browser console on the dashboard to test all endpoints

async function testAPIs() {
    console.log('🧪 Testing API Connections...\n');
    
    const results = {
        auth: { endpoint: '/api/auth', status: '⏳', message: '' },
        images: { endpoint: '/api/image-upload', status: '⏳', message: '' },
        products: { endpoint: '/api/product-catalog', status: '⏳', message: '' },
        onboarding: { endpoint: '/api/client-onboarding', status: '⏳', message: '' }
    };

    // Test Auth API health check
    try {
        const authResponse = await fetch('/api/auth');
        const authData = await authResponse.json();
        
        if (authResponse.ok && authData.status) {
            results.auth.status = '✅';
            results.auth.message = `Configured: ${authData.configured}`;
        } else {
            results.auth.status = '❌';
            results.auth.message = 'Health check failed';
        }
    } catch (error) {
        results.auth.status = '❌';
        results.auth.message = error.message;
    }

    // Test Image Upload API
    try {
        const imageResponse = await fetch('/api/image-upload');
        const imageData = await imageResponse.json();
        
        if (imageResponse.ok) {
            results.images.status = '✅';
            results.images.message = 'Endpoint accessible';
        } else {
            results.images.status = '⚠️';
            results.images.message = 'POST only endpoint';
        }
    } catch (error) {
        results.images.status = '❌';
        results.images.message = error.message;
    }

    // Test Products API
    try {
        const productsResponse = await fetch('/api/product-catalog');
        const productsData = await productsResponse.json();
        
        if (productsResponse.ok && Array.isArray(productsData)) {
            results.products.status = '✅';
            results.products.message = `Found ${productsData.length} products`;
        } else {
            results.products.status = '❌';  
            results.products.message = 'Invalid response format';
        }
    } catch (error) {
        results.products.status = '❌';
        results.products.message = error.message;
    }

    // Test Client Onboarding API health
    try {
        const onboardResponse = await fetch('/api/client-onboarding');
        
        if (onboardResponse.status === 405) {
            results.onboarding.status = '✅';
            results.onboarding.message = 'POST only endpoint (correct)';
        } else {
            results.onboarding.status = '⚠️';
            results.onboarding.message = `Unexpected status: ${onboardResponse.status}`;
        }
    } catch (error) {
        results.onboarding.status = '❌';
        results.onboarding.message = error.message;
    }

    // Display Results
    console.log('📊 API Connection Results:\n');
    
    Object.entries(results).forEach(([key, result]) => {
        console.log(`${result.status} ${result.endpoint}`);
        console.log(`   ${result.message}\n`);
    });

    // Summary
    const working = Object.values(results).filter(r => r.status === '✅').length;
    const total = Object.keys(results).length;
    
    console.log(`\n🎯 Summary: ${working}/${total} APIs are working`);
    
    if (working === total) {
        console.log('✨ All backend APIs are connected and ready!');
    } else {
        console.log('⚠️ Some APIs need attention');
    }
    
    return results;
}

// Auto-run test when script is loaded
testAPIs();
