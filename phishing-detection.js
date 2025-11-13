// Phishing Detection functionality

class PhishingDetector {
    constructor() {
        this.phishingPatterns = {
            urgentLanguage: [
                'urgent', 'immediate', 'expires today', 'act now', 'limited time',
                'verify immediately', 'suspend', 'suspended', 'locked'
            ],
            suspiciousLinks: [
                'bit.ly', 'tinyurl', 'goo.gl', 't.co', 'ow.ly', 'is.gd'
            ],
            commonPhishingDomains: [
                'paypal-security', 'amazon-security', 'microsoft-security',
                'google-security', 'apple-security', 'facebook-security'
            ],
            socialEngineering: [
                'congratulations', 'winner', 'prize', 'lottery', 'inheritance',
                'click here', 'download now', 'free gift', 'claim now'
            ],
            financialThreats: [
                'bank account', 'credit card', 'payment', 'billing', 'invoice',
                'refund', 'transaction', 'unauthorized', 'fraud alert'
            ]
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const scanButton = document.getElementById('scanButton');
        const tabButtons = document.querySelectorAll('.tab-button');
        
        if (scanButton) {
            scanButton.addEventListener('click', () => this.analyzeContent());
        }
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => this.switchTab(button.dataset.tab));
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    async analyzeContent() {
        const activeTab = document.querySelector('.tab-button.active').dataset.tab;
        let content = '';
        
        if (activeTab === 'email') {
            content = document.getElementById('emailInput').value.trim();
        } else {
            content = document.getElementById('urlInput').value.trim();
        }
        
        if (!content) {
            CyberGuard.showError('Please enter content to analyze.');
            return;
        }

        const resultsSection = document.getElementById('resultsSection');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const resultsContent = document.getElementById('resultsContent');
        
        CyberGuard.showLoading(resultsSection, loadingSpinner);
        
        try {
            let result;
            if (activeTab === 'email') {
                result = await this.analyzeEmail(content);
            } else {
                result = await this.analyzeURL(content);
            }
            
            this.displayResults(result);
        } catch (error) {
            console.error('Analysis error:', error);
            CyberGuard.showError('Analysis failed. Please try again.');
        } finally {
            CyberGuard.hideLoading(loadingSpinner, resultsContent);
        }
    }

    async analyzeEmail(content) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const warnings = [];
        let riskScore = 0;
        
        // Check for urgent language
        const urgentMatches = this.findPatterns(content, this.phishingPatterns.urgentLanguage);
        if (urgentMatches.length > 0) {
            warnings.push(`Urgent language detected: ${urgentMatches.join(', ')}`);
            riskScore += 25;
        }
        
        // Check for suspicious links
        const linkMatches = this.findPatterns(content, this.phishingPatterns.suspiciousLinks);
        if (linkMatches.length > 0) {
            warnings.push(`Suspicious short links found: ${linkMatches.join(', ')}`);
            riskScore += 30;
        }
        
        // Check for social engineering
        const socialMatches = this.findPatterns(content, this.phishingPatterns.socialEngineering);
        if (socialMatches.length > 0) {
            warnings.push(`Social engineering tactics: ${socialMatches.join(', ')}`);
            riskScore += 20;
        }
        
        // Check for financial threats
        const financialMatches = this.findPatterns(content, this.phishingPatterns.financialThreats);
        if (financialMatches.length > 0) {
            warnings.push(`Financial-related content: ${financialMatches.join(', ')}`);
            riskScore += 15;
        }
        
        // Check for poor grammar/spelling (simplified)
        const grammarIssues = this.checkGrammar(content);
        if (grammarIssues > 3) {
            warnings.push(`Multiple grammar/spelling issues detected (${grammarIssues})`);
            riskScore += 10;
        }
        
        return {
            riskScore: Math.min(riskScore, 100),
            warnings,
            type: 'email'
        };
    }

    async analyzeURL(url) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const warnings = [];
        let riskScore = 0;
        
        try {
            const urlObj = new URL(url);
            
            // Check for suspicious domains
            const suspiciousDomains = this.phishingPatterns.commonPhishingDomains;
            const domainMatch = suspiciousDomains.find(domain => 
                urlObj.hostname.toLowerCase().includes(domain.toLowerCase())
            );
            
            if (domainMatch) {
                warnings.push(`Suspicious domain pattern: ${domainMatch}`);
                riskScore += 40;
            }
            
            // Check for IP addresses instead of domains
            const ipPattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
            if (ipPattern.test(urlObj.hostname)) {
                warnings.push('URL uses IP address instead of domain name');
                riskScore += 35;
            }
            
            // Check for suspicious TLDs
            const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf'];
            const hostname = urlObj.hostname.toLowerCase();
            const suspiciousTld = suspiciousTlds.find(tld => hostname.endsWith(tld));
            if (suspiciousTld) {
                warnings.push(`Suspicious top-level domain: ${suspiciousTld}`);
                riskScore += 25;
            }
            
            // Check for URL shorteners
            const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co'];
            if (shorteners.includes(urlObj.hostname)) {
                warnings.push('URL shortener detected - destination unknown');
                riskScore += 20;
            }
            
            // Check for excessive subdomains
            const subdomains = urlObj.hostname.split('.');
            if (subdomains.length > 4) {
                warnings.push('Excessive subdomains detected');
                riskScore += 15;
            }
            
            // Check for suspicious URL patterns
            const suspiciousPatterns = [
                'secure-', 'verify-', 'account-', 'login-', 'update-'
            ];
            const pathMatch = suspiciousPatterns.find(pattern => 
                urlObj.pathname.toLowerCase().includes(pattern)
            );
            
            if (pathMatch) {
                warnings.push(`Suspicious URL pattern: ${pathMatch}`);
                riskScore += 20;
            }
            
        } catch (error) {
            warnings.push('Invalid URL format');
            riskScore += 30;
        }
        
        return {
            riskScore: Math.min(riskScore, 100),
            warnings,
            type: 'url'
        };
    }

    findPatterns(content, patterns) {
        const matches = [];
        const lowerContent = content.toLowerCase();
        
        patterns.forEach(pattern => {
            if (lowerContent.includes(pattern.toLowerCase())) {
                matches.push(pattern);
            }
        });
        
        return matches;
    }

    checkGrammar(content) {
        // Simple grammar check - count potential issues
        let issues = 0;
        
        // Check for multiple exclamation marks
        issues += (content.match(/!{2,}/g) || []).length;
        
        // Check for all caps words
        issues += (content.match(/\b[A-Z]{4,}\b/g) || []).length;
        
        // Check for excessive punctuation
        issues += (content.match(/[.,!?]{3,}/g) || []).length;
        
        // Check for missing spaces after punctuation
        issues += (content.match(/[.,!?][A-Za-z]/g) || []).length;
        
        return issues;
    }

    displayResults(result) {
        const riskLevel = document.getElementById('riskLevel');
        const riskIndicator = document.getElementById('riskIndicator');
        const riskIcon = document.getElementById('riskIcon');
        const riskText = document.getElementById('riskText');
        const warningList = document.getElementById('warningList');
        const recommendationsList = document.getElementById('recommendationsList');
        
        // Determine risk level
        let level, icon, text;
        if (result.riskScore >= 60) {
            level = 'high';
            icon = '🚨';
            text = 'HIGH RISK';
        } else if (result.riskScore >= 30) {
            level = 'medium';
            icon = '⚠️';
            text = 'MEDIUM RISK';
        } else {
            level = 'low';
            icon = '✅';
            text = 'LOW RISK';
        }
        
        // Update risk indicator
        riskIndicator.className = `risk-indicator ${level}`;
        riskIcon.textContent = icon;
        riskText.textContent = text;
        
        // Update warnings
        warningList.innerHTML = '';
        if (result.warnings.length > 0) {
            result.warnings.forEach(warning => {
                const li = document.createElement('li');
                li.textContent = warning;
                warningList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'No obvious warning signs detected';
            warningList.appendChild(li);
        }
        
        // Update recommendations
        recommendationsList.innerHTML = '';
        const recommendations = this.getRecommendations(result.riskScore, result.type);
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationsList.appendChild(li);
        });
    }

    getRecommendations(riskScore, type) {
        const recommendations = [];
        
        if (riskScore >= 60) {
            recommendations.push('Do not click any links or download attachments');
            recommendations.push('Do not provide any personal information');
            recommendations.push('Report this as phishing to your IT department');
            recommendations.push('Delete the email immediately');
        } else if (riskScore >= 30) {
            recommendations.push('Exercise caution when interacting with this content');
            recommendations.push('Verify the sender through alternative means');
            recommendations.push('Check URLs carefully before clicking');
        } else {
            recommendations.push('Content appears relatively safe');
            recommendations.push('Always verify sender identity for sensitive requests');
            recommendations.push('Keep your security software updated');
        }
        
        if (type === 'url') {
            recommendations.push('Consider using a URL scanner service');
            recommendations.push('Check the site\'s SSL certificate');
        }
        
        return recommendations;
    }
}

// Initialize the detector when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new PhishingDetector();
});
