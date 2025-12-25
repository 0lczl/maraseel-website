// ============================================
// MARASEEL - Main JavaScript
// ============================================

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = navMenu.contains(event.target);
            const isClickOnHamburger = hamburger.contains(event.target);
            
            if (!isClickInsideNav && !isClickOnHamburger && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
    
    // Set active nav link based on current page
    setActiveNavLink();
    
    // Initialize FAQ accordion
    initFAQ();
    
    // Initialize tracking form
    initTrackingForm();
    
    // Initialize contact form
    initContactForm();
});

// Set Active Navigation Link
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// FAQ Accordion
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        if (question) {
            question.addEventListener('click', function() {
                // Close other items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Toggle current item
                item.classList.toggle('active');
            });
        }
    });
}

// Tracking Form Handler
function initTrackingForm() {
    const trackingForm = document.getElementById('trackingForm');
    
    if (trackingForm) {
        trackingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const trackingNumber = document.getElementById('trackingNumber').value.trim();
            const trackingResults = document.getElementById('trackingResults');
            const trackingError = document.getElementById('trackingError');
            
            // Hide error initially
            trackingError.classList.remove('show');
            
            // Show loading
            trackingResults.innerHTML = '<p class="loading">Searching for your shipment...</p>';
            trackingResults.style.display = 'block';
            
            try {
                // Call REAL backend API
                const response = await fetch('/api/tracking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ trackingNumber })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Display REAL shipment details from database
                    const shipment = data.shipment;
                    trackingResults.innerHTML = `
                        <div class="shipment-card">
                            <h3>Shipment Found! ✅</h3>
                            <p><strong>Tracking Number:</strong> ${shipment.tracking_number}</p>
                            <p><strong>Status:</strong> <span class="status-${shipment.status.toLowerCase().replace(' ', '-')}">${shipment.status}</span></p>
                            <p><strong>Origin:</strong> ${shipment.origin_city}, ${shipment.origin_country}</p>
                            <p><strong>Destination:</strong> ${shipment.destination_city}, ${shipment.destination_country}</p>
                            <p><strong>Weight:</strong> ${shipment.weight} kg</p>
                            <p><strong>Last Updated:</strong> ${new Date(shipment.updated_at).toLocaleString()}</p>
                        </div>
                    `;
                } else {
                    // Show error message
                    trackingError.textContent = data.error || 'Shipment not found';
                    trackingError.classList.add('show');
                    trackingResults.innerHTML = '';
                }
            } catch (error) {
                console.error('Tracking error:', error);
                trackingError.textContent = 'Network error. Please check your connection.';
                trackingError.classList.add('show');
                trackingResults.innerHTML = '';
            }
        });
    }
}

// Format Date
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}


// Contact/Quote Form Handler
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form fields
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const shipmentType = document.getElementById('shipmentType')?.value || '';
            const origin = document.getElementById('origin')?.value.trim() || '';
            const destination = document.getElementById('destination')?.value.trim() || '';
            const weight = document.getElementById('weight')?.value || '';
            const message = document.getElementById('message')?.value.trim() || '';
            
            // Reset all errors
            const errorElements = document.querySelectorAll('.form-error');
            errorElements.forEach(error => error.classList.remove('show'));
            
            let isValid = true;
            
            // Validate name
            if (!name) {
                showError('nameError', 'Please enter your name');
                isValid = false;
            }
            
            // Validate email
            if (!email) {
                showError('emailError', 'Please enter your email address');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate phone
            if (!phone) {
                showError('phoneError', 'Please enter your phone number');
                isValid = false;
            } else if (!isValidPhone(phone)) {
                showError('phoneError', 'Please enter a valid phone number');
                isValid = false;
            }
            
            // Check if this is a quote form or simple contact form
            const isQuoteForm = shipmentType || origin || destination || weight;
            
            if (isQuoteForm) {
                // Additional validation for quote form
                if (!shipmentType) {
                    showError('shipmentTypeError', 'Please select a shipment type');
                    isValid = false;
                }
                
                if (!origin) {
                    showError('originError', 'Please enter origin location');
                    isValid = false;
                }
                
                if (!destination) {
                    showError('destinationError', 'Please enter destination location');
                    isValid = false;
                }
                
                if (!weight || parseFloat(weight) <= 0) {
                    showError('weightError', 'Please enter a valid weight');
                    isValid = false;
                }
            } else {
                // Simple contact form - validate message
                if (!message) {
                    showError('messageError', 'Please enter a message');
                    isValid = false;
                }
            }
            
            if (!isValid) {
                return;
            }
            
            // Disable submit button
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = isQuoteForm ? 'Calculating...' : 'Sending...';
            
            try {
                // Determine which API to call
                const apiUrl = isQuoteForm ? '/api/quotes' : '/api/contact';
                const formData = isQuoteForm ? {
                    name,
                    email,
                    phone,
                    shipmentType,
                    origin,
                    destination,
                    weight: parseFloat(weight)
                } : {
                    name,
                    email,
                    phone,
                    message
                };
                
                // Call backend API
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Show success message
                    if (isQuoteForm && data.estimatedPrice) {
                        alert(`✅ Quote Generated!\n\nEstimated Price: ${data.estimatedPrice} ${data.currency || 'SAR'}\n\n${data.message}`);
                    } else {
                        showSuccessMessage();
                    }
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error
                    alert('❌ Error: ' + (data.error || 'Failed to submit form'));
                }
            } catch (error) {
                console.error('Form submission error:', error);
                alert('❌ Network error. Please check your connection and try again.');
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
}


// Show Error Message
function showError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

// Show Success Message
function showSuccessMessage() {
    const successElement = document.getElementById('formSuccess');
    if (successElement) {
        successElement.classList.add('show');
        
        // Scroll to success message
        successElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            successElement.classList.remove('show');
        }, 5000);
    }
}

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone Validation
function isValidPhone(phone) {
    // Basic phone validation - accepts various formats
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Smooth Scroll for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});


