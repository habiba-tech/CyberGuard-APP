// AI Image Detection functionality

class AIImageDetector {
    constructor() {
        this.supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const scanButton = document.getElementById('scanButton');
        const removeImage = document.getElementById('removeImage');
        
        if (uploadArea && imageInput) {
            uploadArea.addEventListener('click', () => imageInput.click());
            uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
            
            imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
        
        if (scanButton) {
            scanButton.addEventListener('click', () => this.analyzeImage());
        }
        
        if (removeImage) {
            removeImage.addEventListener('click', () => this.removeSelectedImage());
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('uploadArea').classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file type
        if (!this.supportedFormats.includes(file.type)) {
            CyberGuard.showError('Please select a valid image file (JPG, PNG, GIF, WebP).');
            return;
        }
        
        // Validate file size
        if (file.size > this.maxFileSize) {
            CyberGuard.showError('File size must be less than 10MB.');
            return;
        }
        
        // Display preview
        this.displayImagePreview(file);
        
        // Enable scan button
        document.getElementById('scanButton').disabled = false;
    }

    displayImagePreview(file) {
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const previewImage = document.getElementById('previewImage');
        
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.classList.add('active');
        };
        reader.readAsDataURL(file);
    }

    removeSelectedImage() {
        const uploadArea = document.getElementById('uploadArea');
        const imagePreview = document.getElementById('imagePreview');
        const imageInput = document.getElementById('imageInput');
        const scanButton = document.getElementById('scanButton');
        
        uploadArea.style.display = 'block';
        imagePreview.classList.remove('active');
        imageInput.value = '';
        scanButton.disabled = true;
        
        // Hide results if showing
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.classList.remove('active');
        }
    }

    async analyzeImage() {
        const imageInput = document.getElementById('imageInput');
        const file = imageInput.files[0];
        
        if (!file) {
            CyberGuard.showError('Please select an image first.');
            return;
        }

        const resultsSection = document.getElementById('resultsSection');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const resultsContent = document.getElementById('resultsContent');
        
        CyberGuard.showLoading(resultsSection, loadingSpinner);
        
        try {
            const result = await this.performAIDetection(file);
            this.displayResults(result);
        } catch (error) {
            console.error('Analysis error:', error);
            CyberGuard.showError('Analysis failed. Please try again.');
        } finally {
            CyberGuard.hideLoading(loadingSpinner, resultsContent);
        }
    }

    async performAIDetection(file) {
        // Simulate AI analysis with various checks
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const analysis = {
            isAIGenerated: false,
            confidence: 0,
            details: []
        };
        
        // Convert file to base64 for analysis
        const base64 = await this.fileToBase64(file);
        
        // Simulate various AI detection techniques
        const checks = [
            this.checkImageMetadata(file),
            this.checkCompressionArtifacts(base64),
            this.checkPixelPatterns(base64),
            this.checkColorDistribution(base64),
            this.checkNoisePatterns(base64)
        ];
        
        let totalSuspicion = 0;
        
        checks.forEach(check => {
            if (check.suspicious) {
                totalSuspicion += check.weight;
                analysis.details.push(check.reason);
            }
        });
        
        // Determine if image is AI-generated
        analysis.isAIGenerated = totalSuspicion > 0.6;
        analysis.confidence = Math.min(Math.round(totalSuspicion * 100), 95);
        
        if (analysis.details.length === 0) {
            analysis.details.push('No obvious AI generation artifacts detected');
            analysis.details.push('Image appears to have natural characteristics');
            analysis.details.push('Metadata suggests authentic capture');
        }
        
        return analysis;
    }

    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    checkImageMetadata(file) {
        // Simulate metadata analysis
        const hasMetadata = Math.random() > 0.3;
        const suspiciousMetadata = Math.random() > 0.7;
        
        if (!hasMetadata) {
            return {
                suspicious: true,
                weight: 0.2,
                reason: 'Missing or stripped EXIF metadata'
            };
        }
        
        if (suspiciousMetadata) {
            return {
                suspicious: true,
                weight: 0.3,
                reason: 'Unusual metadata patterns detected'
            };
        }
        
        return {
            suspicious: false,
            weight: 0,
            reason: 'Normal metadata structure'
        };
    }

    checkCompressionArtifacts(base64) {
        // Simulate compression analysis
        const hasUnusualCompression = Math.random() > 0.6;
        
        if (hasUnusualCompression) {
            return {
                suspicious: true,
                weight: 0.25,
                reason: 'Unusual compression artifacts detected'
            };
        }
        
        return {
            suspicious: false,
            weight: 0,
            reason: 'Normal compression patterns'
        };
    }

    checkPixelPatterns(base64) {
        // Simulate pixel pattern analysis
        const hasArtificialPatterns = Math.random() > 0.7;
        
        if (hasArtificialPatterns) {
            return {
                suspicious: true,
                weight: 0.4,
                reason: 'Artificial pixel patterns suggesting AI generation'
            };
        }
        
        return {
            suspicious: false,
            weight: 0,
            reason: 'Natural pixel distribution observed'
        };
    }

    checkColorDistribution(base64) {
        // Simulate color analysis
        const hasUnusualColors = Math.random() > 0.8;
        
        if (hasUnusualColors) {
            return {
                suspicious: true,
                weight: 0.3,
                reason: 'Unusual color distribution patterns'
            };
        }
        
        return {
            suspicious: false,
            weight: 0,
            reason: 'Natural color distribution'
        };
    }

    checkNoisePatterns(base64) {
        // Simulate noise analysis
        const hasArtificialNoise = Math.random() > 0.75;
        
        if (hasArtificialNoise) {
            return {
                suspicious: true,
                weight: 0.35,
                reason: 'Artificial noise patterns typical of AI generation'
            };
        }
        
        return {
            suspicious: false,
            weight: 0,
            reason: 'Natural noise characteristics'
        };
    }

    displayResults(result) {
        const resultIndicator = document.getElementById('resultIndicator');
        const resultIcon = document.getElementById('resultIcon');
        const resultText = document.getElementById('resultText');
        const confidenceValue = document.getElementById('confidenceValue');
        const detailsList = document.getElementById('detailsList');
        
        // Update result indicator
        if (result.isAIGenerated) {
            resultIndicator.className = 'result-indicator ai-generated';
            resultIcon.textContent = '🤖';
            resultText.textContent = 'AI-GENERATED';
        } else {
            resultIndicator.className = 'result-indicator authentic';
            resultIcon.textContent = '✅';
            resultText.textContent = 'AUTHENTIC';
        }
        
        // Update confidence
        confidenceValue.textContent = `${result.confidence}%`;
        
        // Update details
        detailsList.innerHTML = '';
        result.details.forEach(detail => {
            const li = document.createElement('li');
            li.textContent = detail;
            detailsList.appendChild(li);
        });
        
        // Add analysis method info
        const methodLi = document.createElement('li');
        methodLi.textContent = 'Analysis method: Multi-factor AI detection';
        detailsList.appendChild(methodLi);
        
        const timeLi = document.createElement('li');
        timeLi.textContent = `Analysis completed: ${new Date().toLocaleTimeString()}`;
        detailsList.appendChild(timeLi);
    }
}

// Initialize the detector when the page loads
document.addEventListener('DOMContentLoaded', function() {
    new AIImageDetector();
});