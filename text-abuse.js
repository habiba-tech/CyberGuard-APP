// Text Abuse Detection functionality

class TextAbuseDetector {
    constructor() {
        this.perspectiveAPI = 'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';
        this.apiKey = null; // Will need to be set by user
        this.fallbackAnalyzer = new FallbackToxicityAnalyzer();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const scanButton = document.getElementById('scanButton');
        const textInput = document.getElementById('textInput');
        
        if (scanButton && textInput) {
            scanButton.addEventListener('click', () => this.analyzeText());
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    this.analyzeText();
                }
            });
        }
    }

    async analyzeText() {
        const textInput = document.getElementById('textInput');
        const text = textInput.value.trim();
        
        if (!text) {
            CyberGuard.showError('Please enter some text to analyze.');
            return;
        }

        const resultsSection = document.getElementById('resultsSection');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const resultsContent = document.getElementById('resultsContent');
        
        CyberGuard.showLoading(resultsSection, loadingSpinner);
        
        try {
            // Try Perspective API first, fallback to local analysis
            let result;
            if (this.apiKey) {
                result = await this.analyzePerspective(text);
            } else {
                result = await this.fallbackAnalyzer.analyze(text);
            }
            
            this.displayResults(result);
        } catch (error) {
            console.error('Analysis error:', error);
            CyberGuard.showError('Analysis failed. Please try again.');
        } finally {
            CyberGuard.hideLoading(loadingSpinner, resultsContent);
        }
    }

    async analyzePerspective(text) {
        const requestData = {
            comment: { text: text },
            requestedAttributes: {
                TOXICITY: {},
                SEVERE_TOXICITY: {},
                IDENTITY_ATTACK: {},
                INSULT: {},
                PROFANITY: {},
                THREAT: {}
            }
        };

        const response = await fetch(`${this.perspectiveAPI}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error('Perspective API request failed');
        }

        const data = await response.json();
        return this.parsePerspectiveResults(data);
    }

    parsePerspectiveResults(data) {
        const attributes = data.attributeScores;
        const toxicity = attributes.TOXICITY?.summaryScore?.value || 0;
        const severeToxicity = attributes.SEVERE_TOXICITY?.summaryScore?.value || 0;
        const identityAttack = attributes.IDENTITY_ATTACK?.summaryScore?.value || 0;
        const insult = attributes.INSULT?.summaryScore?.value || 0;
        const profanity = attributes.PROFANITY?.summaryScore?.value || 0;
        const threat = attributes.THREAT?.summaryScore?.value || 0;

        const maxScore = Math.max(toxicity, severeToxicity, identityAttack, insult, profanity, threat);
        
        return {
            toxicityScore: Math.round(maxScore * 100),
            details: [
                `Toxicity: ${Math.round(toxicity * 100)}%`,
                `Severe Toxicity: ${Math.round(severeToxicity * 100)}%`,
                `Identity Attack: ${Math.round(identityAttack * 100)}%`,
                `Insult: ${Math.round(insult * 100)}%`,
                `Profanity: ${Math.round(profanity * 100)}%`,
                `Threat: ${Math.round(threat * 100)}%`
            ]
        };
    }

    displayResults(result) {
        const scoreValue = document.getElementById('scoreValue');
        const scoreFill = document.getElementById('scoreFill');
        const verdictValue = document.getElementById('verdictValue');
        const detailsList = document.getElementById('detailsList');

        // Update score
        scoreValue.textContent = `${result.toxicityScore}%`;
        scoreFill.style.width = `${result.toxicityScore}%`;
        
        // Update score color based on level
        scoreFill.className = 'score-fill';
        if (result.toxicityScore >= 70) {
            scoreFill.classList.add('high');
        } else if (result.toxicityScore >= 40) {
            scoreFill.classList.add('medium');
        }

        // Update verdict
        verdictValue.className = 'verdict-value';
        if (result.toxicityScore >= 70) {
            verdictValue.textContent = 'High Risk';
            verdictValue.classList.add('danger');
        } else if (result.toxicityScore >= 40) {
            verdictValue.textContent = 'Moderate Risk';
            verdictValue.classList.add('warning');
        } else {
            verdictValue.textContent = 'Safe';
        }

        // Update details
        detailsList.innerHTML = '';
        result.details.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            detailsList.appendChild(li);
        });
    }
}

// Fallback analyzer for when Perspective API is not available
class FallbackToxicityAnalyzer {
    constructor() {
        this.toxicWords = [
            'hate', 'stupid', 'idiot', 'dumb', 'kill', 'die', 'death', 'hurt', 'pain',
            'ugly', 'fat', 'loser', 'failure', 'worthless', 'useless', 'trash',
            'scam', 'fraud', 'lie', 'liar', 'cheat', 'steal', 'criminal'
        ];
        
        this.severeToxicWords = [
            'murder', 'suicide', 'violence', 'abuse', 'assault', 'attack'
        ];
    }

    async analyze(text) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const lowerText = text.toLowerCase();
        let toxicCount = 0;
        let severeToxicCount = 0;
        let totalWords = text.split(/\s+/).length;
        
        // Count toxic words
        this.toxicWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = lowerText.match(regex);
            if (matches) {
                toxicCount += matches.length;
            }
        });
        
        // Count severe toxic words
        this.severeToxicWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            const matches = lowerText.match(regex);
            if (matches) {
                severeToxicCount += matches.length;
            }
        });
        
        // Calculate toxicity score
        const baseScore = (toxicCount / totalWords) * 100;
        const severeMultiplier = severeToxicCount * 20;
        const finalScore = Math.min(Math.round(baseScore + severeMultiplier), 100);
        
        return {
            toxicityScore: finalScore,
            details: [
                `Potentially harmful words detected: ${toxicCount}`,
                `Severe language detected: ${severeToxicCount}`,
                `Total words analyzed: ${totalWords}`,
                `Analysis method: Local pattern matching`,
                `Confidence: ${finalScore > 0 ? 'Medium' : 'High'}`
            ]
        };
    }
}

// Initialize the detector when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new TextAbuseDetector();
});
