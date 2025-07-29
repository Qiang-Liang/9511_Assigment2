// Global state management
const state = {
    language: 'en',
    highContrast: false,
    largeFont: false
};

// DOM Elements
let languageBtn, contrastBtn, fontSizeBtn;

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeControls();
    loadSavedPreferences();
    attachEventListeners();
});

// Initialize control elements
function initializeControls() {
    languageBtn = document.getElementById('languageBtn');
    contrastBtn = document.getElementById('contrastBtn');
    fontSizeBtn = document.getElementById('fontSizeBtn');
}

// Load saved preferences from localStorage
function loadSavedPreferences() {
    const savedContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('largeFont') === 'true';
    const savedLanguage = localStorage.getItem('language') || 'en';

    if (savedContrast) {
        toggleHighContrast();
    }
    if (savedFontSize) {
        toggleLargeFont();
    }
    state.language = savedLanguage;
}

// Attach event listeners
function attachEventListeners() {
    if (languageBtn) {
        languageBtn.addEventListener('click', toggleLanguage);
    }
    if (contrastBtn) {
        contrastBtn.addEventListener('click', toggleHighContrast);
    }
    if (fontSizeBtn) {
        fontSizeBtn.addEventListener('click', toggleLargeFont);
    }

    // Keyboard navigation for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });

    // Form validation and submission
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmission);
    });

    // File upload handling
    const uploadAreas = document.querySelectorAll('.upload-area');
    uploadAreas.forEach(area => {
        setupFileUpload(area);
    });
}

// Navigation functions
function navigateTo(service) {
    switch(service) {
        case 'license-renewal':
            window.location.href = 'license-renewal-1.html';
            break;
        case 'subsidy-application':
            window.location.href = 'subsidy-application-1.html';
            break;
        case 'seniors-card':
            window.location.href = 'seniors-card-1.html';
            break;
        case 'consumer-complaints':
            window.location.href = 'consumer-complaints-1.html';
            break;
        default:
            console.error('Unknown service:', service);
    }
}

function goHome() {
    window.location.href = 'index.html';
}

function goToNextStep(service, step) {
    window.location.href = `${service}-${step}.html`;
}

function goToPreviousStep(service, step) {
    if (step === 1) {
        goHome();
    } else {
        window.location.href = `${service}-${step - 1}.html`;
    }
}

// Accessibility functions
function toggleLanguage() {
    state.language = state.language === 'en' ? 'zh' : 'en';
    localStorage.setItem('language', state.language);
    
    if (languageBtn) {
        languageBtn.classList.toggle('active');
    }
    
    // In a real application, this would trigger language switching
    showNotification('Language switched successfully');
}

function toggleHighContrast() {
    state.highContrast = !state.highContrast;
    document.body.classList.toggle('high-contrast', state.highContrast);
    localStorage.setItem('highContrast', state.highContrast);
    
    if (contrastBtn) {
        contrastBtn.classList.toggle('active', state.highContrast);
    }
    
    showNotification(state.highContrast ? 'High contrast mode enabled' : 'High contrast mode disabled');
}

function toggleLargeFont() {
    state.largeFont = !state.largeFont;
    document.body.classList.toggle('large-font', state.largeFont);
    localStorage.setItem('largeFont', state.largeFont);
    
    if (fontSizeBtn) {
        fontSizeBtn.classList.toggle('active', state.largeFont);
    }
    
    showNotification(state.largeFont ? 'Large font size enabled' : 'Large font size disabled');
}

// Progress bar management
function updateProgressBar(currentStep, totalSteps = 3) {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// Form handling
function handleFormSubmission(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    }
    
    // Simulate API call
    setTimeout(() => {
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
        
        // Get next step from form data or button
        const nextStep = form.dataset.nextStep;
        if (nextStep) {
            const [service, step] = nextStep.split('-');
            goToNextStep(service, parseInt(step));
        } else {
            showNotification('Form submitted successfully');
        }
    }, 1500);
}

// File upload handling
function setupFileUpload(uploadArea) {
    const input = uploadArea.querySelector('input[type="file"]') || createFileInput(uploadArea);
    
    uploadArea.addEventListener('click', () => input.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFileSelection(files, uploadArea);
    });
    
    input.addEventListener('change', (e) => {
        handleFileSelection(e.target.files, uploadArea);
    });
}

function createFileInput(uploadArea) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.style.display = 'none';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    uploadArea.appendChild(input);
    return input;
}

function handleFileSelection(files, uploadArea) {
    if (files.length === 0) return;
    
    const fileList = uploadArea.querySelector('.file-list') || createFileList(uploadArea);
    
    Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
            return;
        }
        
        const fileItem = createFileItem(file);
        fileList.appendChild(fileItem);
    });
    
    updateUploadAreaText(uploadArea, files.length);
}

function createFileList(uploadArea) {
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    uploadArea.appendChild(fileList);
    return fileList;
}

function createFileItem(file) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatFileSize(file.size)}</span>
        <button type="button" class="remove-file" onclick="removeFile(this)">✕</button>
    `;
    return fileItem;
}

function removeFile(button) {
    const fileItem = button.closest('.file-item');
    const uploadArea = button.closest('.upload-area');
    fileItem.remove();
    
    const remainingFiles = uploadArea.querySelectorAll('.file-item').length;
    updateUploadAreaText(uploadArea, remainingFiles);
}

function updateUploadAreaText(uploadArea, fileCount) {
    const text = uploadArea.querySelector('.upload-text');
    if (text) {
        if (fileCount > 0) {
            text.textContent = `${fileCount} file(s) selected. Click or drag to add more.`;
        } else {
            text.textContent = 'Click or drag files here to upload';
        }
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        backgroundColor: type === 'error' ? '#ef4444' : '#10b981',
        color: 'white',
        borderRadius: '8px',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Utility functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Export functions for use in other scripts
window.navigateTo = navigateTo;
window.goHome = goHome;
window.goToNextStep = goToNextStep;
window.goToPreviousStep = goToPreviousStep;
window.updateProgressBar = updateProgressBar;
window.showNotification = showNotification;
window.removeFile = removeFile; 