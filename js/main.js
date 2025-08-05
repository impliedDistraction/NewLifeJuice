// New Life Juice Website JavaScript
// Modern ES6+ JavaScript for enhanced user experience

class NewLifeJuiceApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupOrderForm();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupFormValidation();
        this.setupAccessibility();
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
        const quantityInputs = document.querySelectorAll('.quantity-input');
        const orderTotal = document.getElementById('orderTotal');
        const form = document.querySelector('.order-form');
        const pricePerItem = 18;

        // Calculate total when quantities change
        const calculateTotal = () => {
            let total = 0;
            quantityInputs.forEach(input => {
                const quantity = parseInt(input.value) || 0;
                total += quantity * pricePerItem;
            });
            
            orderTotal.textContent = `$${total.toFixed(2)}`;
            
            // Update hidden input for form submission
            let existingTotalInput = form.querySelector('input[name="order_total"]');
            if (existingTotalInput) {
                existingTotalInput.value = total.toFixed(2);
            } else {
                const totalInput = document.createElement('input');
                totalInput.type = 'hidden';
                totalInput.name = 'order_total';
                totalInput.value = total.toFixed(2);
                form.appendChild(totalInput);
            }
        };

        // Add event listeners to quantity inputs
        quantityInputs.forEach(input => {
            input.addEventListener('input', calculateTotal);
            input.addEventListener('change', calculateTotal);
            
            // Ensure valid input
            input.addEventListener('blur', () => {
                const value = parseInt(input.value);
                if (isNaN(value) || value < 0) {
                    input.value = 0;
                } else if (value > 20) {
                    input.value = 20;
                }
                calculateTotal();
            });
        });

        // Initial calculation
        calculateTotal();

        // Form submission handling
        form?.addEventListener('submit', (e) => {
            const total = parseFloat(orderTotal.textContent.replace('$', ''));
            
            if (total === 0) {
                e.preventDefault();
                this.showNotification('Please select at least one juice to order.', 'error');
                return;
            }

            // Show loading state
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Placing Order...';
            submitBtn.disabled = true;

            // Reset button after a delay (in case form submission fails)
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 10000);

            this.showNotification('Order submitted! We\'ll contact you within 24 hours.', 'success');
        });
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
