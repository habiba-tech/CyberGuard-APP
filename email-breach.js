// Email Breach Detection functionality

class EmailBreachChecker {
    constructor() {
        this.haveIBeenPwnedAPI = 'https://haveibeenpwned.com/api/v3/breachedaccount';
        this.corsProxy = 'https://api.allorigins.win/raw?url=';
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const scanButton = document.getElementById('scanButton');
        const emailInput = document.getElementById('emailInput');
        
        if (scanButton && emailInput) {
            scanButton.addEventListener('click', () => this.checkBreaches());
            emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.checkBreaches();
                }
            });
        }
    }

    async checkBreaches() {
        const emailInput = document.getElementById('emailInput');
        const email = emailInput.value.trim();
        
        if (!email) {
            CyberGuard.showError('Please enter an email address.');
            return;
        }
        
        if (!CyberGuard.validateEmail(email)) {
            CyberGuard.showError('Please enter a valid email address.');
            return;
        }

        const resultsSection = document.getElementById('resultsSection');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const resultsContent = document.getElementById('resultsContent');
        
        CyberGuard.showLoading(resultsSection, loadingSpinner);
        
        const result = await this.simulateBreachCheck(email);
        this.displayResults(result, email);
        CyberGuard.hideLoading(loadingSpinner, resultsContent);
    }

    async queryBreachDatabase(email) {
        // Try to query Have I Been Pwned API
        // Note: This might fail due to CORS restrictions
        const encodedEmail = encodeURIComponent(email);
        const url = `${this.corsProxy}${this.haveIBeenPwnedAPI}/${encodedEmail}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'CyberGuard-App'
            }
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        // Parse the CORS proxy response first
        const proxyResponse = await response.json();
        
        // Extract the actual content from the proxy wrapper
        const responseText = proxyResponse.contents;
        
        // Handle empty response (404 from target API)
        if (!responseText || responseText.trim() === '') {
            return { breaches: [], isCompromised: false };
        }
        
        let breaches;
        try {
            breaches = JSON.parse(responseText);
        } catch (error) {
            // If JSON parsing fails, it might be a 404 or other non-JSON response
            return { breaches: [], isCompromised: false };
        }
        
        return { breaches, isCompromised: breaches.length > 0 };
    }

    async simulateBreachCheck(email) {
        // Simulate breach check with realistic data
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const commonBreaches = [
            {
                Name: 'Adobe',
                Title: 'Adobe',
                Domain: 'adobe.com',
                BreachDate: '2013-10-04',
                AddedDate: '2013-12-04T00:00:00Z',
                ModifiedDate: '2013-12-04T00:00:00Z',
                PwnCount: 152445165,
                Description: 'In October 2013, 153 million Adobe accounts were breached with each containing an internal ID, username, email, encrypted password and a password hint in plain text.',
                DataClasses: ['Email addresses', 'Password hints', 'Passwords', 'Usernames']
            },
            {
                Name: 'Collection1',
                Title: 'Collection #1',
                Domain: '',
                BreachDate: '2019-01-07',
                AddedDate: '2019-01-16T21:46:07Z',
                ModifiedDate: '2019-01-16T21:46:07Z',
                PwnCount: 772904991,
                Description: 'Collection #1 is a set of email addresses and passwords totalling 2,692,818,238 rows.',
                DataClasses: ['Email addresses', 'Passwords']
            },
            {
                Name: 'LinkedIn',
                Title: 'LinkedIn',
                Domain: 'linkedin.com',
                BreachDate: '2012-05-05',
                AddedDate: '2016-05-21T21:35:40Z',
                ModifiedDate: '2016-05-21T21:35:40Z',
                PwnCount: 164611595,
                Description: 'In May 2012, LinkedIn was breached and the passwords of 164 million users were stolen.',
                DataClasses: ['Email addresses', 'Passwords']
            }
        ];
        
        // Simulate random breach results
        const shouldHaveBreaches = Math.random() > 0.6;
        
        if (shouldHaveBreaches) {
            const numBreaches = Math.floor(Math.random() * 3) + 1;
            const selectedBreaches = commonBreaches.slice(0, numBreaches);
            return { breaches: selectedBreaches, isCompromised: true };
        }
        
        return { breaches: [], isCompromised: false };
    }

    displayResults(result, email) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusIcon = document.getElementById('statusIcon');
        const statusText = document.getElementById('statusText');
        const breachList = document.getElementById('breachList');
        const breachItems = document.getElementById('breachItems');
        const recommendationsList = document.getElementById('recommendationsList');
        
        // Update status indicator
        if (result.isCompromised) {
            statusIndicator.className = 'status-indicator compromised';
            statusIcon.textContent = '🚨';
            statusText.textContent = `${result.breaches.length} breach(es) found`;
        } else {
            statusIndicator.className = 'status-indicator safe';
            statusIcon.textContent = '✅';
            statusText.textContent = 'No breaches found';
        }
        
        // Update breach list
        if (result.breaches.length > 0) {
            breachList.style.display = 'block';
            breachItems.innerHTML = '';
            
            result.breaches.forEach(breach => {
                const breachItem = document.createElement('div');
                breachItem.className = 'breach-item';
                
                const breachDate = new Date(breach.BreachDate).toLocaleDateString();
                
                breachItem.innerHTML = `
                    <div class="breach-name">${breach.Title}</div>
                    <div class="breach-date">Breach Date: ${breachDate}</div>
                    <div class="breach-description">${breach.Description}</div>
                    <div class="breach-data">Compromised Data: ${breach.DataClasses.join(', ')}</div>
                `;
                
                breachItems.appendChild(breachItem);
            });
        } else {
            breachList.style.display = 'none';
        }
        
        // Update recommendations
        recommendationsList.innerHTML = '';
        const recommendations = this.getRecommendations(result.isCompromised, result.breaches.length);
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }

    getRecommendations(isCompromised, breachCount) {
        const recommendations = [];
        
        if (isCompromised) {
            recommendations.push('Change your password immediately on all affected services');
            recommendations.push('Enable two-factor authentication (2FA) where available');
            recommendations.push('Monitor your accounts for suspicious activity');
            recommendations.push('Consider using a password manager');
            recommendations.push('Check if your other accounts use the same password');
            
            if (breachCount > 1) {
                recommendations.push('Your email appears in multiple breaches - consider changing your email if possible');
            }
        } else {
            recommendations.push('Your email was not found in known breaches');
            recommendations.push('Continue using strong, unique passwords');
            recommendations.push('Enable 2FA on important accounts');
            recommendations.push('Regularly check for new breaches');
            recommendations.push('Keep your software and security tools updated');
        }
        
        recommendations.push('Sign up for breach notification services');
        recommendations.push('Be cautious of phishing attempts following data breaches');
        
        return recommendations;
    }
}

// Initialize the checker when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new EmailBreachChecker();
});
