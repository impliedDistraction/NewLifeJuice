// Advanced Admin Dashboard with AI Integration
class AdminDashboard {
    constructor() {
        this.config = null;
        this.products = [];
        this.init();
    }

    async init() {
        await this.loadConfig();
        this.setupEventListeners();
        this.loadProducts();
        this.loadSiteContent();
        this.setupImageManagement();
    }

    async loadConfig() {
        try {
            const response = await fetch('/config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Error loading config:', error);
            this.config = { products: [], business: {}, hero: {} };
        }
    }

    setupEventListeners() {
        // AI Assistant
        document.getElementById('aiAssistantBtn').addEventListener('click', () => this.openAIModal());
        document.getElementById('closeAIModal').addEventListener('click', () => this.closeAIModal());
        document.getElementById('sendAIMessage').addEventListener('click', () => this.sendAIMessage());
        document.getElementById('aiChatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendAIMessage();
        });

        // Content Generation
        document.getElementById('generateAIContent').addEventListener('click', () => this.generateAIContent());

        // Product Management
        document.getElementById('addProductBtn').addEventListener('click', () => this.openProductModal());
        document.getElementById('closeProductModal').addEventListener('click', () => this.closeProductModal());
        document.getElementById('cancelProduct').addEventListener('click', () => this.closeProductModal());
        document.getElementById('productForm').addEventListener('submit', (e) => this.saveProduct(e));

        // Site Content
        document.getElementById('saveChanges').addEventListener('click', () => this.saveSiteContent());
        document.getElementById('previewChanges').addEventListener('click', () => this.previewChanges());

        // Image Upload
        document.getElementById('imageUpload').addEventListener('change', (e) => this.handleImageUpload(e));
    }

    // AI Integration Methods
    openAIModal() {
        document.getElementById('aiModal').classList.remove('hidden');
    }

    closeAIModal() {
        document.getElementById('aiModal').classList.add('hidden');
    }

    async sendAIMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        if (!message) return;

        const chatHistory = document.getElementById('aiChatHistory');
        
        // Add user message
        this.addChatMessage('user', message);
        input.value = '';

        // Add loading message
        const loadingId = this.addChatMessage('assistant', 'Thinking...');

        try {
            const response = await this.callAIAPI(message, 'chat');
            this.updateChatMessage(loadingId, response);
        } catch (error) {
            this.updateChatMessage(loadingId, 'Sorry, I encountered an error. Please try again.');
        }
    }

    addChatMessage(sender, message) {
        const chatHistory = document.getElementById('aiChatHistory');
        const messageId = 'msg_' + Date.now();
        
        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
        
        messageDiv.innerHTML = `
            <div class="max-w-[70%] p-3 rounded-lg ${
                sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
            }">
                ${message}
            </div>
        `;
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        
        return messageId;
    }

    updateChatMessage(messageId, newMessage) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            const messageContent = messageElement.querySelector('div');
            messageContent.innerHTML = newMessage;
        }
    }

    async generateAIContent() {
        const contentType = document.getElementById('aiContentType').value;
        const prompt = document.getElementById('aiPrompt').value.trim();
        
        if (!prompt) {
            alert('Please enter a prompt for AI content generation.');
            return;
        }

        const button = document.getElementById('generateAIContent');
        const originalText = button.textContent;
        button.textContent = 'Generating...';
        button.disabled = true;

        try {
            const response = await this.callAIAPI(prompt, contentType);
            
            // Apply the generated content based on type
            this.applyGeneratedContent(contentType, response);
            
            alert('Content generated successfully!');
        } catch (error) {
            alert('Error generating content. Please try again.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    applyGeneratedContent(type, content) {
        switch (type) {
            case 'product-description':
                if (this.currentEditingProduct) {
                    document.getElementById('productDescription').value = content;
                }
                break;
            case 'hero-content':
                const lines = content.split('\n');
                document.getElementById('heroTitle').value = lines[0] || '';
                document.getElementById('heroDescription').value = lines.slice(1).join('\n') || '';
                break;
            case 'marketing-copy':
                // Could be applied to various fields
                break;
        }
    }

    async callAIAPI(prompt, type) {
        const adminPassword = localStorage.getItem('adminPassword') || 
            prompt('Enter admin password:');
        
        if (adminPassword) {
            localStorage.setItem('adminPassword', adminPassword);
        }

        const response = await fetch('/api/ai-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                type,
                adminPassword
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.response;
    }

    // Product Management Methods
    loadProducts() {
        const productsList = document.getElementById('productsList');
        productsList.innerHTML = '';

        this.config.products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsList.appendChild(productCard);
        });

        // Update product count
        document.getElementById('activeProductCount').textContent = 
            this.config.products.filter(p => p.active).length;
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow';
        
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-900">${product.name}</h3>
                    <p class="text-sm text-gray-600 mt-1">${product.description}</p>
                    <p class="text-lg font-semibold text-green-600 mt-2">$${product.price}</p>
                </div>
                <div class="flex items-center space-x-2 ml-4">
                    <label class="flex items-center">
                        <input 
                            type="checkbox" 
                            ${product.active ? 'checked' : ''} 
                            onchange="adminDashboard.toggleProductActive('${product.id}')"
                            class="rounded text-green-600 focus:ring-green-500"
                        >
                        <span class="ml-2 text-sm text-gray-600">Active</span>
                    </label>
                    <button 
                        onclick="adminDashboard.editProduct('${product.id}')"
                        class="text-blue-600 hover:text-blue-700 text-sm"
                    >
                        Edit
                    </button>
                    <button 
                        onclick="adminDashboard.deleteProduct('${product.id}')"
                        class="text-red-600 hover:text-red-700 text-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    openProductModal(productId = null) {
        this.currentEditingProduct = productId;
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        
        if (productId) {
            const product = this.config.products.find(p => p.id === productId);
            title.textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productPrice').value = product.price;
        } else {
            title.textContent = 'Add Product';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
        }
        
        modal.classList.remove('hidden');
    }

    closeProductModal() {
        document.getElementById('productModal').classList.add('hidden');
        this.currentEditingProduct = null;
    }

    async saveProduct(e) {
        e.preventDefault();
        
        const productData = {
            id: document.getElementById('productId').value || this.generateProductId(),
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            active: true,
            image: `/images/${document.getElementById('productName').value.toLowerCase().replace(/\s+/g, '-')}.jpg`
        };

        if (this.currentEditingProduct) {
            // Edit existing product
            const index = this.config.products.findIndex(p => p.id === this.currentEditingProduct);
            this.config.products[index] = { ...this.config.products[index], ...productData };
        } else {
            // Add new product
            this.config.products.push(productData);
        }

        await this.saveConfig();
        this.loadProducts();
        this.closeProductModal();
    }

    generateProductId() {
        return 'product_' + Date.now();
    }

    toggleProductActive(productId) {
        const product = this.config.products.find(p => p.id === productId);
        if (product) {
            product.active = !product.active;
            this.saveConfig();
            this.loadProducts();
        }
    }

    editProduct(productId) {
        this.openProductModal(productId);
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.config.products = this.config.products.filter(p => p.id !== productId);
            this.saveConfig();
            this.loadProducts();
        }
    }

    // Site Content Management
    loadSiteContent() {
        document.getElementById('heroTitle').value = this.config.hero.title || '';
        document.getElementById('heroDescription').value = this.config.hero.description || '';
        document.getElementById('businessName').value = this.config.business.name || '';
        document.getElementById('businessPhone').value = this.config.business.phone || '';
        document.getElementById('businessEmail').value = this.config.business.email || '';
    }

    async saveSiteContent() {
        this.config.hero.title = document.getElementById('heroTitle').value;
        this.config.hero.description = document.getElementById('heroDescription').value;
        this.config.business.name = document.getElementById('businessName').value;
        this.config.business.phone = document.getElementById('businessPhone').value;
        this.config.business.email = document.getElementById('businessEmail').value;

        await this.saveConfig();
        alert('Site content saved successfully!');
    }

    previewChanges() {
        // Open main site in new tab to preview changes
        window.open('/', '_blank');
    }

    // Image Management
    setupImageManagement() {
        // Set up drag and drop
        const uploadArea = document.querySelector('.border-dashed');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-blue-400', 'bg-blue-50');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
            const files = e.dataTransfer.files;
            this.handleImageFiles(files);
        });
    }

    handleImageUpload(e) {
        const files = e.target.files;
        this.handleImageFiles(files);
    }

    async handleImageFiles(files) {
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                await this.uploadImage(file);
            }
        }
        this.loadImageGallery();
    }

    async uploadImage(file) {
        // For now, we'll simulate upload with local storage
        // In production, this would upload to Google Cloud Storage
        const reader = new FileReader();
        
        return new Promise((resolve) => {
            reader.onload = (e) => {
                const imageName = file.name;
                const imageData = e.target.result;
                
                // Store in localStorage for demo (in production: upload to GCS)
                const images = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
                images[imageName] = imageData;
                localStorage.setItem('uploadedImages', JSON.stringify(images));
                
                resolve(imageName);
            };
            reader.readAsDataURL(file);
        });
    }

    loadImageGallery() {
        const gallery = document.getElementById('imageGallery');
        const images = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
        
        gallery.innerHTML = '';
        
        Object.entries(images).forEach(([name, data]) => {
            const imageDiv = document.createElement('div');
            imageDiv.className = 'relative group cursor-pointer';
            imageDiv.innerHTML = `
                <img src="${data}" alt="${name}" class="w-full h-16 object-cover rounded">
                <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                    <button onclick="adminDashboard.deleteImage('${name}')" class="text-white text-xs">
                        Delete
                    </button>
                </div>
            `;
            gallery.appendChild(imageDiv);
        });
    }

    deleteImage(imageName) {
        const images = JSON.parse(localStorage.getItem('uploadedImages') || '{}');
        delete images[imageName];
        localStorage.setItem('uploadedImages', JSON.stringify(images));
        this.loadImageGallery();
    }

    // Configuration Management
    async saveConfig() {
        try {
            // In a real implementation, this would save to a database
            // For now, we'll simulate with localStorage
            localStorage.setItem('siteConfig', JSON.stringify(this.config));
            
            // Also update the public config.json (would need server endpoint in production)
            console.log('Config saved to localStorage:', this.config);
            
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            return false;
        }
    }
}

// Initialize the admin dashboard
let adminDashboard;
document.addEventListener('DOMContentLoaded', () => {
    adminDashboard = new AdminDashboard();
});
