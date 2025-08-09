// Login functionality

class LoginManager {
    constructor() {
        this.demoCredentials = {
            email: 'demo@cyberguard.com',
            password: 'CyberGuard2025!'
        };
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const passwordToggle = document.getElementById('passwordToggle');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (passwordToggle) {
            passwordToggle.addEventListener('click', () => this.togglePassword());
        }

        // Add demo credential auto-fill
        const demoCredentials = document.querySelector('.demo-credentials');
        if (demoCredentials) {
            demoCredentials.addEventListener('click', () => this.fillDemoCredentials());
        }
    }

    checkAuthStatus() {
        // Check if user is already logged in
        const isLoggedIn = localStorage.getItem('cyberguard_logged_in');
        if (isLoggedIn === 'true') {
            this.redirectToDashboard();
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        const loginButton = document.getElementById('loginButton');
        
        if (!email || !password) {
            this.showError('Please fill in all fields.');
            return;
        }

        if (!CyberGuard.validateEmail(email)) {
            this.showError('Please enter a valid email address.');
            return;
        }

        // Show loading state
        this.setLoadingState(loginButton, true);
        
        try {
            const result = await this.authenticateUser(email, password);
            
            if (result.success) {
                // Store authentication state
                localStorage.setItem('cyberguard_logged_in', 'true');
                localStorage.setItem('cyberguard_user_email', email);
                
                if (rememberMe) {
                    localStorage.setItem('cyberguard_remember_me', 'true');
                }
                
                this.showSuccess('Login successful! Redirecting...');
                
                // Redirect after short delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
                
            } else {
                this.showError(result.message);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            this.setLoadingState(loginButton, false);
        }
    }

    async authenticateUser(email, password) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check demo credentials
        if (email === this.demoCredentials.email && password === this.demoCredentials.password) {
            return { success: true, message: 'Login successful' };
        }
        
        // Accept any valid email format with password length >= 6
        if (CyberGuard.validateEmail(email) && password.length >= 6) {
            return { success: true, message: 'Login successful' };
        }
        
        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters long' };
        }
        
        return { success: false, message: 'Please enter a valid email address' };
    }

    togglePassword() {
        const passwordInput = document.getElementById('password');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            toggleIcon.textContent = '👁️';
        }
    }

    fillDemoCredentials() {
        document.getElementById('email').value = this.demoCredentials.email;
        document.getElementById('password').value = this.demoCredentials.password;
        
        // Add visual feedback
        const demoCredentials = document.querySelector('.demo-credentials');
        demoCredentials.style.background = '#dcfce7';
        demoCredentials.style.borderColor = '#10b981';
        
        setTimeout(() => {
            demoCredentials.style.background = '';
            demoCredentials.style.borderColor = '';
        }, 1000);
    }

    redirectToDashboard() {
        window.location.href = 'index.html';
    }

    setLoadingState(button, isLoading) {
        const buttonText = button.querySelector('.button-text');
        const buttonIcon = button.querySelector('.button-icon');
        
        if (isLoading) {
            button.disabled = true;
            buttonText.textContent = 'Signing In...';
            buttonIcon.textContent = '⏳';
            button.style.opacity = '0.7';
        } else {
            button.disabled = false;
            buttonText.textContent = 'Sign In';
            buttonIcon.textContent = '🔐';
            button.style.opacity = '1';
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.login-message');
        existingMessages.forEach(msg => msg.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `login-message ${type}`;
        messageDiv.textContent = message;
        
        const loginForm = document.getElementById('loginForm');
        loginForm.insertBefore(messageDiv, loginForm.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize login manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    new LoginManager();
});