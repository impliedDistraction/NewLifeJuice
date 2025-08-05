// New Life Juice Website JavaScript
// Modern ES6+ JavaScript for enhanced user experience

class NewLifeJuiceApp {
    constructor() {
        this.config = null;
        this.init();
    }

    async init() {
        try {
            await this.loadConfig();
            this.renderContent();
            this.setupNavigation();
            this.setupOrderForm();
            this.setupSmoothScrolling();
            this.setupIntersectionObserver();
            this.setupFormValidation();
            this.setupAccessibility();
        } catch (error) {
            console.error('Failed to initialize app:', error);
            // Fallback to static content if config fails to load
            this.setupNavigation();
            this.setupOrderForm();
            this.setupSmoothScrolling();
            this.setupIntersectionObserver();
            this.setupFormValidation();
            this.setupAccessibility();
        }
    }

    // Load configuration from JSON file
    async loadConfig() {
        try {
            const response = await fetch('./config.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
        } catch (error) {
            console.warn('Could not load config.json, using static content:', error);
            // Fallback to null config - static content will be used
            this.config = null;
        }
    }

    // Render dynamic content from config
    renderContent() {
        if (!this.config) return;

        this.renderBusinessInfo();
        this.renderHeroSection();
        this.renderSectionTitles();
        this.renderProducts();
        this.renderFeatures();
        this.renderPaymentInfo();
        this.renderSocialLinks();
    }

    renderBusinessInfo() {
        if (!this.config?.business) return;

        const { name, tagline, email, phone } = this.config.business;
        
        // Update navigation logo
        const logoH1 = document.querySelector('.nav-logo h1');
        const logoTagline = document.querySelector('.nav-logo .tagline');
        if (logoH1) logoH1.textContent = name;
        if (logoTagline) logoTagline.textContent = tagline;

        // Update footer
        const footerTitle = document.querySelector('.footer-section h3');
        const footerEmail = document.querySelector('.footer-section p:nth-of-type(1)');
        const footerPhone = document.querySelector('.footer-section p:nth-of-type(2)');
        if (footerTitle) footerTitle.textContent = name;
        if (footerEmail) footerEmail.textContent = `Email: ${email}`;
        if (footerPhone) footerPhone.textContent = `Phone: ${phone}`;
    }

    renderHeroSection() {
        if (!this.config?.hero) return;

        const { title, description, buttonText, image } = this.config.hero;
        
        const heroTitle = document.querySelector('.hero-title');
        const heroDescription = document.querySelector('.hero-description');
        const heroButton = document.querySelector('.hero-content .btn');
        const heroImage = document.querySelector('.hero-img');

        if (heroTitle) heroTitle.innerHTML = title;
        if (heroDescription) heroDescription.textContent = description;
        if (heroButton) heroButton.textContent = buttonText;
        if (heroImage) heroImage.src = image;
    }

    renderProducts() {
        if (!this.config?.products) return;

        const activeProducts = this.config.products.filter(product => product.active);
        
        // Render product showcase
        this.renderProductShowcase(activeProducts);
        
        // Render order form products
        this.renderOrderFormProducts(activeProducts);
    }

    renderProductShowcase(products) {
        const productsGrid = document.querySelector('.products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = '';

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.style.cursor = 'pointer';
            productCard.innerHTML = `
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">$${product.price}</div>
                    <div class="order-hint">Click to order →</div>
                </div>
            `;
            
            // Add click handler to scroll to order form and highlight product
            productCard.addEventListener('click', () => {
                this.scrollToOrderAndHighlight(product.id);
            });
            
            productsGrid.appendChild(productCard);
        });
    }

    renderOrderFormProducts(products) {
        const productsSelection = document.querySelector('.products-selection');
        if (!productsSelection) return;

        productsSelection.innerHTML = '';

        products.forEach(product => {
            const productSelector = document.createElement('div');
            productSelector.className = 'product-selector';
            productSelector.id = `order-${product.id}`;
            productSelector.innerHTML = `
                <label for="${product.id}" class="product-label">
                    <span class="product-name">${product.name} - $${product.price}</span>
                    <input type="number" id="${product.id}" name="${product.id}_quantity" min="0" max="20" value="0" class="quantity-input" data-price="${product.price}">
                </label>
            `;
            productsSelection.appendChild(productSelector);
        });
    }

    // Scroll to order form and highlight specific product
    scrollToOrderAndHighlight(productId) {
        const orderSection = document.getElementById('order');
        const targetProduct = document.getElementById(`order-${productId}`);
        
        if (orderSection && targetProduct) {
            // Scroll to order section
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = orderSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Wait for scroll to complete, then highlight
            setTimeout(() => {
                this.highlightProduct(targetProduct);
            }, 800);
        }
    }

    // Highlight and blink effect for product
    highlightProduct(productElement) {
        // Remove any existing highlights
        document.querySelectorAll('.product-selector').forEach(el => {
            el.classList.remove('highlight-product');
        });
        
        // Add highlight class
        productElement.classList.add('highlight-product');
        
        // Remove highlight after animation
        setTimeout(() => {
            productElement.classList.remove('highlight-product');
        }, 3000);
        
        // Focus on the quantity input for better UX
        const quantityInput = productElement.querySelector('.quantity-input');
        if (quantityInput) {
            setTimeout(() => {
                quantityInput.focus();
                quantityInput.select();
            }, 1000);
        }
    }

    renderFeatures() {
        if (!this.config?.features) return;

        const featuresContainer = document.querySelector('.features');
        if (!featuresContainer) return;

        featuresContainer.innerHTML = '';

        this.config.features.forEach(feature => {
            const featureDiv = document.createElement('div');
            featureDiv.className = 'feature';
            featureDiv.innerHTML = `
                <div class="feature-icon">${feature.icon}</div>
                <div class="feature-content">
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
            `;
            featuresContainer.appendChild(featureDiv);
        });
    }

    renderPaymentInfo() {
        if (!this.config?.payment) return;

        const paymentInfo = document.querySelector('.payment-info');
        if (!paymentInfo) return;

        const methodsList = this.config.payment.methods.map(method => `<li>${method}</li>`).join('');
        
        paymentInfo.innerHTML = `
            <p>${this.config.payment.contactMessage}</p>
            <ul>${methodsList}</ul>
        `;
    }

    renderSectionTitles() {
        if (!this.config?.sections) return;

        const { products, about, order } = this.config.sections;
        
        // Update section titles
        if (products?.title) {
            const productTitle = document.querySelector('.products .section-title');
            if (productTitle) productTitle.textContent = products.title;
        }
        
        if (products?.description) {
            const productDesc = document.querySelector('.products .section-description');
            if (productDesc) productDesc.textContent = products.description;
        }
        
        if (about?.title) {
            const aboutTitle = document.querySelector('.about .section-title');
            if (aboutTitle) aboutTitle.textContent = about.title;
        }
        
        if (order?.title) {
            const orderTitle = document.querySelector('.order-section .section-title');
            if (orderTitle) orderTitle.textContent = order.title;
        }
        
        if (order?.description) {
            const orderDesc = document.querySelector('.order-section .section-description');
            if (orderDesc) orderDesc.textContent = order.description;
        }
    }

    renderSocialLinks() {
        if (!this.config?.social) return;

        const { facebook, instagram, twitter } = this.config.social;
        
        const socialLinks = {
            'facebook': facebook,
            'instagram': instagram,
            'twitter': twitter
        };
        
        Object.entries(socialLinks).forEach(([platform, url]) => {
            const link = document.querySelector(`[data-social="${platform}"]`);
            if (link && url && url !== '#') {
                link.href = url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });
    }

    // Navigation functionality
    setupNavigation() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Toggle mobile menu
        hamburger?.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger?.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger?.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger?.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Header scroll effect
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            if (window.scrollY > 100) {
                header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                header.style.backdropFilter = 'blur(10px)';
            } else {
                header.style.backgroundColor = '#ffffff';
                header.style.backdropFilter = 'none';
            }
        });
    }

    // Order form functionality
    setupOrderForm() {
        const form = document.querySelector('.order-form');
        const orderTotal = document.getElementById('orderTotal');

        // Setup delivery method toggle
        this.setupDeliveryToggle();

        // Calculate total when quantities change
        const calculateTotal = () => {
            let total = 0;
            const quantityInputs = document.querySelectorAll('.quantity-input');
            
            quantityInputs.forEach(input => {
                const quantity = parseInt(input.value) || 0;
                const price = parseFloat(input.dataset.price) || 18; // fallback to $18
                total += quantity * price;
            });
            
            if (orderTotal) {
                orderTotal.textContent = `$${total.toFixed(2)}`;
            }
            
            // Update hidden input for form submission
            let existingTotalInput = form?.querySelector('input[name="order_total"]');
            if (existingTotalInput) {
                existingTotalInput.value = total.toFixed(2);
            } else if (form) {
                const totalInput = document.createElement('input');
                totalInput.type = 'hidden';
                totalInput.name = 'order_total';
                totalInput.value = total.toFixed(2);
                form.appendChild(totalInput);
            }
        };

        // Setup event listeners for quantity inputs (using event delegation for dynamic content)
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                calculateTotal();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                // Ensure valid input
                const value = parseInt(e.target.value);
                if (isNaN(value) || value < 0) {
                    e.target.value = 0;
                } else if (value > 20) {
                    e.target.value = 20;
                }
                calculateTotal();
            }
        });

        // Initial calculation
        setTimeout(calculateTotal, 100); // Small delay to ensure dynamic content is loaded

        // Form submission handling
        form?.addEventListener('submit', (e) => {
            const total = parseFloat(orderTotal?.textContent.replace('$', '') || '0');
            
            if (total === 0) {
                e.preventDefault();
                this.showNotification('Please select at least one juice to order.', 'error');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn?.textContent || 'Place Order';
            if (submitBtn) {
                submitBtn.textContent = 'Placing Order...';
                submitBtn.disabled = true;
            }

            // Reset button after a delay (in case form submission fails)
            setTimeout(() => {
                if (submitBtn) {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }, 10000);

            this.showNotification('Order submitted! We\'ll contact you within 24 hours.', 'success');
        });
    }

    // Setup delivery method toggle
    setupDeliveryToggle() {
        const deliveryRadios = document.querySelectorAll('input[name="delivery_method"]');
        const addressField = document.querySelector('.delivery-only');
        const addressInput = document.getElementById('address');
        const formSectionTitle = document.querySelector('.form-section:nth-of-type(3) h3');
        
        // Update form based on selected delivery method
        const updateDeliveryMethod = () => {
            const selectedMethod = document.querySelector('input[name="delivery_method"]:checked')?.value;
            
            if (selectedMethod === 'pickup') {
                addressField?.classList.add('hidden');
                if (addressInput) {
                    addressInput.removeAttribute('required');
                }
                if (formSectionTitle) {
                    formSectionTitle.textContent = 'Contact Information';
                }
            } else {
                addressField?.classList.remove('hidden');
                if (addressInput) {
                    addressInput.setAttribute('required', 'required');
                }
                if (formSectionTitle) {
                    formSectionTitle.textContent = 'Contact & Delivery Information';
                }
            }
        };

        // Add event listeners to radio buttons
        deliveryRadios.forEach(radio => {
            radio.addEventListener('change', updateDeliveryMethod);
        });

        // Initial setup
        updateDeliveryMethod();
    }

    // Smooth scrolling for anchor links
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                
                if (target) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = target.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Intersection Observer for animations
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.product-card, .feature, .form-section').forEach(el => {
            observer.observe(el);
        });
    }

    // Form validation
    setupFormValidation() {
        const form = document.querySelector('.order-form');
        const inputs = form?.querySelectorAll('input[required], textarea[required]');

        inputs?.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearValidationErrors(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error styling
        this.clearValidationErrors(field);

        if (!value) {
            isValid = false;
            errorMessage = 'This field is required.';
        } else {
            switch (field.type) {
                case 'email':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address.';
                    }
                    break;
                case 'tel':
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    const cleanPhone = value.replace(/\D/g, '');
                    if (cleanPhone.length < 10) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number.';
                    }
                    break;
            }
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearValidationErrors(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Accessibility enhancements
    setupAccessibility() {
        // Skip to content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-green);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1001;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add main content ID
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            heroSection.id = 'main-content';
        }

        // Keyboard navigation for mobile menu
        const hamburger = document.querySelector('.hamburger');
        hamburger?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                hamburger.click();
            }
        });

        // ARIA labels for quantity inputs
        document.querySelectorAll('.quantity-input').forEach(input => {
            const productName = input.closest('.product-selector').querySelector('.product-name').textContent;
            input.setAttribute('aria-label', `Quantity for ${productName}`);
        });
    }

    // Notification system
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1002;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        // Set colors based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 5000);

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });
    }

    // Utility methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Format phone number as user types
    formatPhoneNumber(value) {
        const phoneNumber = value.replace(/\D/g, '');
        const phoneNumberLength = phoneNumber.length;
        
        if (phoneNumberLength < 4) return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
}

// Performance optimization: Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NewLifeJuiceApp();
    });
} else {
    new NewLifeJuiceApp();
}

// Service Worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewLifeJuiceApp;
}
