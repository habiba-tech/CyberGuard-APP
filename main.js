// Main JavaScript file for navigation and shared functionality

// Navigation function
function navigateToTool(page) {
    window.location.href = page;
}

// Utility functions
function showError(message, container = null) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #fee2e2;
        color: #991b1b;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px solid #fecaca;
    `;
    errorDiv.textContent = message;
    
    if (container) {
        container.appendChild(errorDiv);
    } else {
        document.body.appendChild(errorDiv);
    }
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function showSuccess(message, container = null) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #dcfce7;
        color: #166534;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
        border: 1px solid #bbf7d0;
    `;
    successDiv.textContent = message;
    
    if (container) {
        container.appendChild(successDiv);
    } else {
        document.body.appendChild(successDiv);
    }
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showLoading(resultsSection, loadingSpinner) {
    resultsSection.classList.add('active');
    loadingSpinner.style.display = 'block';
    
    const resultsContent = resultsSection.querySelector('.results-content');
    if (resultsContent) {
        resultsContent.classList.remove('active');
    }
}

function hideLoading(loadingSpinner, resultsContent) {
    loadingSpinner.style.display = 'none';
    if (resultsContent) {
        resultsContent.classList.add('active');
    }
}

// Common validation functions
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status on protected pages
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const protectedPages = ['index.html', 'text-abuse.html', 'phishing-detection.html', 'ai-image-check.html', 'email-breach.html'];
    
    if (protectedPages.includes(currentPage)) {
        const isLoggedIn = localStorage.getItem('cyberguard_logged_in');
        if (isLoggedIn !== 'true') {
            window.location.href = 'login.html';
            return;
        }
        
        // Add logout functionality to navbar
        addLogoutButton();
    }
    
    // Set active navigation link
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Handle mobile navigation
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && window.innerWidth <= 768) {
        navMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('nav-link')) {
                // Close mobile menu after clicking a link
                navMenu.classList.remove('active');
            }
        });
    }
});

function addLogoutButton() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && !document.querySelector('.logout-button')) {
        const logoutButton = document.createElement('button');
        logoutButton.className = 'logout-button';
        logoutButton.innerHTML = '🚪 Logout';
        logoutButton.style.cssText = `
            background: var(--error-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-left: 1rem;
        `;
        
        logoutButton.addEventListener('click', logout);
        logoutButton.addEventListener('mouseenter', function() {
            this.style.background = '#dc2626';
            this.style.transform = 'translateY(-1px)';
        });
        logoutButton.addEventListener('mouseleave', function() {
            this.style.background = 'var(--error-color)';
            this.style.transform = 'translateY(0)';
        });
        
        navMenu.appendChild(logoutButton);
    }
}

function logout() {
    // Clear authentication data
    localStorage.removeItem('cyberguard_logged_in');
    localStorage.removeItem('cyberguard_user_email');
    localStorage.removeItem('cyberguard_remember_me');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Export functions for use in other modules
window.CyberGuard = {
    navigateToTool,
    showError,
    showSuccess,
    showLoading,
    hideLoading,
    validateEmail,
    validateURL
};
