// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Hide user account and contact sections on initial load
    const userAccountSection = document.querySelector('.user-account-section');
    const contactSection = document.querySelector('.contact-section');
    
    if (userAccountSection) {
        userAccountSection.style.display = 'none';
    }
    if (contactSection) {
        contactSection.style.display = 'block'; // Contact is always visible
    }
    
    // Wait a short moment for admin_script.js to load
    setTimeout(checkUserAuth, 100);
});

// User authentication variables
let isUserLoggedIn = false;
let currentUserEmail = null;

// Check user authentication
function checkUserAuth() {
    if (!window.userAuthSystem) {
        console.error('User authentication system not loaded');
        setTimeout(checkUserAuth, 100);
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    const userPassword = localStorage.getItem('userPassword');
    
    if (userEmail && userPassword) {
        const result = window.userAuthSystem.checkUserAccess(userEmail, userPassword);
        if (result.success) {
            isUserLoggedIn = true;
            currentUserEmail = userEmail;
            showValidatorInterface();
            // Add a small delay to ensure DOM elements are ready
            setTimeout(updateUserInfo, 100);
        } else {
            console.log('Auth failed:', result.message);
            isUserLoggedIn = false;
            currentUserEmail = null;
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userPassword');
            showLoginInterface();
        }
    } else {
        showLoginInterface();
    }
}

// Show login interface
function showLoginInterface() {
    const mainContent = document.querySelector('.main-content');
    const userAccountSection = document.querySelector('.user-account-section');
    const contactSection = document.querySelector('.contact-section');
    
    // Hide the user account section during login
    if (userAccountSection) {
        userAccountSection.style.display = 'none';
    }
    // Ensure contact section is visible
    if (contactSection) {
        contactSection.style.display = 'block';
    }

    if (!mainContent) return;

    mainContent.innerHTML = `
        <section class="checker-section card">
            <div class="section-header">
                <h2><i class="fas fa-user"></i> User Login</h2>
            </div>
            <div class="input-group">
                <div class="input-wrapper">
                    <i class="fas fa-at input-icon"></i>
                    <input type="email" id="userLoginEmail" placeholder="Enter your email">
                </div>
                <div class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" id="userLoginPassword" placeholder="Enter your password">
                </div>
                <button class="primary-btn" onclick="handleUserLogin()">
                    <i class="fas fa-sign-in-alt"></i> Login
                </button>
            </div>
        </section>
    `;
    showPlansPopup();
}

// Handle user login
async function handleUserLogin() {
    if (!window.userAuthSystem) {
        console.error('User authentication system not loaded');
        showToast('System error. Please try again in a moment.', 'error');
        return;
    }

    const email = document.getElementById('userLoginEmail').value;
    const password = document.getElementById('userLoginPassword').value;

    if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
    }

    const result = window.userAuthSystem.checkUserAccess(email, password);
    console.log('Login attempt result:', result);

    if (result.success) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userPassword', password);
        isUserLoggedIn = true;
        currentUserEmail = email;
        showValidatorInterface();
        setTimeout(updateUserInfo, 100);
        showToast('Welcome back! Successfully logged in', 'success');
        updateValidationLimitDisplay();
    } else {
        showToast(result.message || 'Login failed. Please check your credentials.', 'error');
    }
}

// Show validator interface
function showValidatorInterface() {
    const mainContent = document.querySelector('.main-content');
    const userAccountSection = document.querySelector('.user-account-section');
    const contactSection = document.querySelector('.contact-section');
    
    // Show the user account section after successful login
    if (userAccountSection) {
        userAccountSection.style.display = 'block';
    }
    // Ensure contact section is visible
    if (contactSection) {
        contactSection.style.display = 'block';
    }

    mainContent.innerHTML = `
        <!-- Validation Limit Display -->
        <div class="validation-limits-box mb-4">
            <div class="limits-header">
                <div class="limits-title">
                    <i class='fas fa-chart-bar me-2'></i>
                    Your Email Validation Limits
                </div>
                <button onclick="updateValidationLimitDisplay()" class="refresh-btn" title="Refresh Limits">
                    <i class='fas fa-sync-alt'></i>
                </button>
            </div>
            <div id="limitDetails" class="limits-content">Loading...</div>
        </div>

        <!-- Single Email Checker -->
        <section class="checker-section card">
            <div class="section-header">
                <h2><i class="fas fa-envelope"></i> Single Email Check</h2>
            </div>
            <div class="input-group">
                <div class="input-wrapper">
                    <i class="fas fa-at input-icon"></i>
                    <input type="email" id="emailInput" placeholder="Enter email address to check">
                </div>
                <button class="primary-btn" onclick="checkEmail()">
                    <i class="fas fa-search"></i> Check Email
                </button>
            </div>
            <div class="result" id="result"></div>
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Analyzing email...</p>
            </div>
        </section>

        <!-- Bulk Email Checker -->
        <section class="checker-section card">
            <div class="section-header">
                <h2><i class="fas fa-envelopes-bulk"></i> Bulk Email Check</h2>
                <p class="section-desc">Check multiple emails at once (one email per line)</p>
            </div>
            <div class="bulk-input-group">
                <div class="bulk-input-wrapper">
                    <i class="fas fa-envelope-bulk input-icon"></i>
                    <textarea id="bulkEmailInput" placeholder="Enter multiple email addresses&#10;example1@domain.com&#10;example2@domain.com"></textarea>
                </div>
                <div class="bulk-controls">
                    <button class="secondary-btn" onclick="clearBulkEmails()">
                        <i class="fas fa-eraser"></i> Clear
                    </button>
                    <button class="primary-btn" onclick="checkBulkEmails()">
                        <i class="fas fa-list-check"></i> Check All Emails
                    </button>
                </div>
            </div>
            <div class="bulk-results" id="bulkResults">
                <div class="results-header">
                    <h3>Results</h3>
                    <div class="stats" id="bulkStats"></div>
                </div>
                <div class="download-controls">
                    <div class="download-group">
                        <span class="download-label">Valid Emails:</span>
                        <button class="download-btn" onclick="downloadValidEmails('txt')">
                            <i class="fas fa-file-text"></i> Download TXT
                        </button>
                        <button class="download-btn" onclick="downloadValidEmails('excel')">
                            <i class="fas fa-file-excel"></i> Download Excel
                        </button>
                    </div>
                    <div class="download-group">
                        <span class="download-label">Invalid Emails:</span>
                        <button class="download-btn" onclick="downloadInvalidEmails('txt')">
                            <i class="fas fa-file-text"></i> Download TXT
                        </button>
                        <button class="download-btn" onclick="downloadInvalidEmails('excel')">
                            <i class="fas fa-file-excel"></i> Download Excel
                        </button>
                    </div>
                </div>
                <div class="results-table-container">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>Email Address</th>
                                <th>Status</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody id="resultsTableBody"></tbody>
                    </table>
                </div>
            </div>
            <div class="loading" id="bulkLoading">
                <div class="spinner"></div>
                <p>Analyzing emails... <span id="progressText">0/0</span></p>
            </div>
        </section>
    `;
    const emailInput = document.getElementById('emailInput');
    emailInput.focus();

    // Initialize validation limit display
    updateValidationLimitDisplay();
}

// Handle user logout
function handleUserLogout() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    isUserLoggedIn = false;
    currentUserEmail = null;
    showLoginInterface();
    showToast('Successfully logged out', 'success');
}

// Update validation limit display
function updateValidationLimitDisplay() {
    const limitDetails = document.getElementById('limitDetails');
    if (!limitDetails) return;

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        limitDetails.innerHTML = '<div class="limit-error">Please log in to view your limits</div>';
        return;
    }

    const userInfo = window.userAuthSystem.getUserInfo(userEmail);
    if (userInfo.success) {
        limitDetails.innerHTML = `
            <div class="limits-grid">
                <div class="limit-item">
                    <div class="limit-label">
                        <i class="fas fa-layer-group"></i>
                        Plan
                    </div>
                    <div class="limit-value">${userInfo.subscriptionPlan.toUpperCase()}</div>
                </div>
                <div class="limit-item">
                    <div class="limit-label">
                        <i class="fas fa-infinity"></i>
                        Total Limit
                    </div>
                    <div class="limit-value">${userInfo.validationLimit === Infinity ? 'Unlimited' : userInfo.validationLimit.toLocaleString()}</div>
                </div>
                <div class="limit-item">
                    <div class="limit-label">
                        <i class="fas fa-check-circle"></i>
                        Remaining
                    </div>
                    <div class="limit-value ${userInfo.validationsRemaining < 500 ? 'text-danger' : ''}">${userInfo.validationLimit === Infinity ? 'Unlimited' : userInfo.validationsRemaining.toLocaleString()}</div>
                </div>
            </div>`;
    } else {
        limitDetails.innerHTML = '<div class="limit-error">Error loading validation limits</div>';
    }
}

// Modify checkEmail function to handle validation limits
async function checkEmail() {
    const emailInput = document.getElementById('emailInput');
    const result = document.getElementById('result');
    const loading = document.getElementById('loading');
    const email = emailInput.value.trim();

    if (!email) {
        alert('Please enter an email address');
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('Please log in first');
        return;
    }

    // Check validation limit before proceeding
    const incrementResult = window.userAuthSystem.incrementValidationCount(userEmail);
    if (!incrementResult.success) {
        alert(incrementResult.message);
        return;
    }

    // Show loading
    loading.style.display = 'block';
    result.style.display = 'none';

    try {
        // Validate email
        const validationResult = await validateEmailWithDetails(email);

        // Hide loading
        loading.style.display = 'none';
        
        // Show result
        showResult(validationResult.message, validationResult.isValid);

        // Update validation limit display
        updateValidationLimitDisplay();
    } catch (error) {
        console.error('Error validating email:', error);
        loading.style.display = 'none';
        showResult('<i class="fas fa-times-circle"></i> Error validating email', false);
    }
}

// Modify checkBulkEmails function to handle validation limits
async function checkBulkEmails() {
    const bulkInput = document.getElementById('bulkEmailInput');
    const bulkLoading = document.getElementById('bulkLoading');
    const bulkResults = document.getElementById('bulkResults');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const progressText = document.getElementById('progressText');
    const bulkStats = document.getElementById('bulkStats');

    const emails = bulkInput.value
        .split(/[\n,]+/)
        .map(email => email.trim())
        .filter(email => email);

    if (emails.length === 0) {
        alert('Please enter at least one email address');
        return;
    }

    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
        alert('Please log in first');
        return;
    }

    // Check if user has enough validations remaining
    const userInfo = window.userAuthSystem.getUserInfo(userEmail);
    if (!userInfo.success) {
        alert('Error getting user information');
        return;
    }

    if (userInfo.validationLimit !== Infinity && emails.length > userInfo.validationsRemaining) {
        alert(`You don't have enough validations remaining. You have ${userInfo.validationsRemaining} validations left, but trying to validate ${emails.length} emails.`);
        return;
    }

    // Show loading
    bulkLoading.style.display = 'block';
    bulkResults.style.display = 'none';
    resultsTableBody.innerHTML = '';
    validationResults = [];

    let validCount = 0;
    let invalidCount = 0;
    const fragment = document.createDocumentFragment();

    try {
        for (let i = 0; i < emails.length; i++) {
            const email = emails[i];
            progressText.textContent = `${i + 1}/${emails.length}`;

            // Increment validation count before validating
            const incrementResult = window.userAuthSystem.incrementValidationCount(userEmail);
            if (!incrementResult.success) {
                alert(incrementResult.message);
                break;
            }

            const result = await validateEmailWithDetails(email);
            validationResults.push({ email, ...result });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${email}</td>
                <td>
                    <span class="status-${result.isValid ? 'valid' : 'invalid'}">
                        <i class="fas fa-${result.isValid ? 'check-circle' : 'times-circle'}"></i>
                        ${result.isValid ? 'Valid' : 'Invalid'}
                    </span>
                </td>
                <td>${result.details}</td>
            `;

            fragment.appendChild(row);

            if (result.isValid) validCount++;
            else invalidCount++;
        }

        // Update stats
        bulkStats.innerHTML = `
            <div class="stat-item stat-valid">
                <i class="fas fa-check-circle"></i>
                Valid: ${validCount}
            </div>
            <div class="stat-item stat-invalid">
                <i class="fas fa-times-circle"></i>
                Invalid: ${invalidCount}
            </div>
        `;

        // Update results
        resultsTableBody.innerHTML = '';
        resultsTableBody.appendChild(fragment);

        // Update validation limit display
        updateValidationLimitDisplay();
    } catch (error) {
        console.error('Error in bulk validation:', error);
        bulkStats.innerHTML = '<div class="alert alert-danger">Error processing emails</div>';
    } finally {
        // Hide loading and show results
        bulkLoading.style.display = 'none';
        bulkResults.style.display = 'block';
    }
}

function clearBulkEmails() {
    const bulkInput = document.getElementById('bulkEmailInput');
    const bulkResults = document.getElementById('bulkResults');
    bulkInput.value = '';
    bulkResults.style.display = 'none';
}

async function validateEmailWithDetails(email) {
    // Basic format validation
    const isValid = validateEmail(email);
    if (!isValid) {
        return {
            isValid: false,
            message: `<i class="fas fa-times-circle"></i> Invalid email format`,
            details: 'Email format is incorrect'
        };
    }

    // Domain validation
    const domain = email.split('@')[1];
    const hasMXRecord = await checkDomain(domain);
    if (!hasMXRecord) {
        return {
            isValid: false,
            message: `<i class="fas fa-times-circle"></i> Invalid domain`,
            details: 'Domain does not have valid email servers'
        };
    }

    // Additional checks
    const isActive = await checkEmailActive(email);
    if (!isActive) {
        return {
            isValid: false,
            message: `<i class="fas fa-times-circle"></i> Inactive email`,
            details: 'Email domain appears to be inactive or disposable'
        };
    }

    return {
        isValid: true,
        message: `<i class="fas fa-check-circle"></i> Email is valid and active`,
        details: 'All checks passed successfully'
    };
}

function validateEmail(email) {
    const emailRegex = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
    
    if (!emailRegex.test(email)) {
        return false;
    }

    const [localPart, domain] = email.split('@');

    if (localPart.length > 64) return false;
    if (/^[.-]|[.-]$/.test(localPart)) return false;
    if (/(\.{2,}|-{2,})/.test(localPart)) return false;

    if (domain.length > 255) return false;
    if (/^[.-]|[.-]$/.test(domain)) return false;
    
    const domainParts = domain.split('.');
    if (domainParts.some(part => part.length > 63)) return false;

    return true;
}

async function checkDomain(domain) {
    try {
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
        const data = await response.json();
        return data.Answer && data.Answer.length > 0;
    } catch (error) {
        console.error('Error checking domain:', error);
        return true;
    }
}

async function checkEmailActive(email) {
    const disposableDomains = [
        'tempmail.com', 'throwawaymail.com', '10minutemail.com',
        'guerrillamail.com', 'mailinator.com', 'temporary-mail.net'
    ];

    const domain = email.split('@')[1].toLowerCase();
    
    if (disposableDomains.includes(domain)) {
        return false;
    }

    try {
        const spfResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
        const spfData = await spfResponse.json();
        
        const hasSPF = spfData.Answer && spfData.Answer.some(record => 
            record.data.includes('v=spf1')
        );

        return hasSPF;
    } catch (error) {
        console.error('Error checking email active status:', error);
        return true;
    }
}

function showResult(message, isValid) {
    const result = document.getElementById('result');
    result.innerHTML = message;
    result.style.display = 'block';
    result.className = 'result ' + (isValid ? 'valid' : 'invalid');
}

// Store the validation results globally
let validationResults = [];

function downloadValidEmails(format) {
    const validEmails = validationResults
        .filter(result => result.isValid)
        .map(result => result.email);

    if (validEmails.length === 0) {
        alert('No valid emails to download');
        return;
    }

    if (format === 'txt') {
        downloadTxt(validEmails, 'valid_emails.txt');
    } else if (format === 'excel') {
        downloadExcel(validEmails, 'valid_emails.xlsx');
    }
}

function downloadInvalidEmails(format) {
    const invalidEmails = validationResults
        .filter(result => !result.isValid)
        .map(result => result.email);

    if (invalidEmails.length === 0) {
        alert('No invalid emails to download');
        return;
    }

    if (format === 'txt') {
        downloadTxt(invalidEmails, 'invalid_emails.txt');
    } else if (format === 'excel') {
        downloadExcel(invalidEmails, 'invalid_emails.xlsx');
    }
}

function downloadTxt(emails, filename) {
    const content = emails.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function downloadExcel(emails, filename) {
    // Create a workbook with a single worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
        ['Email Address'], // Header
        ...emails.map(email => [email]) // Data
    ]);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Emails');

    // Generate and download the file
    XLSX.writeFile(workbook, filename);
}

// Add scroll shadow effect
function handleTableScroll() {
    const container = document.querySelector('.results-table-container');
    if (!container) return;

    container.addEventListener('scroll', () => {
        if (container.scrollTop > 0) {
            container.classList.add('is-scrolled');
        } else {
            container.classList.remove('is-scrolled');
        }
    });
}

function toggleUserPanel() {
    const dropdown = document.getElementById('userPanelDropdown');
    dropdown.classList.toggle('active');

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
        const accountSection = document.querySelector('.user-account-section');
        if (!accountSection.contains(event.target)) {
            dropdown.classList.remove('active');
            document.removeEventListener('click', handleClickOutside);
        }
    };

    // Add click listener with a small delay to avoid immediate trigger
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 0);
}

function toggleContactPanel() {
    const dropdown = document.getElementById('contactPanelDropdown');
    dropdown.classList.toggle('active');

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
        const contactSection = document.querySelector('.contact-section');
        if (!contactSection.contains(event.target)) {
            dropdown.classList.remove('active');
            document.removeEventListener('click', handleClickOutside);
        }
    };

    // Add click listener with a small delay to avoid immediate trigger
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 0);
}

function updateUserInfo() {
    if (!window.userAuthSystem) {
        console.error('User authentication system not loaded');
        return;
    }

    const userGmail = document.getElementById('userGmail');
    const planDuration = document.getElementById('planDuration');
    const daysRemaining = document.getElementById('daysRemaining');

    if (!userGmail || !planDuration || !daysRemaining) {
        console.error('User info elements not found');
        return;
    }

    userGmail.textContent = currentUserEmail;

    const userInfo = window.userAuthSystem.getUserInfo(currentUserEmail);
    if (userInfo && userInfo.success) {
        planDuration.textContent = userInfo.planDuration;
        daysRemaining.textContent = userInfo.daysRemaining;
    } else {
        planDuration.textContent = 'N/A';
        daysRemaining.textContent = 'N/A';
    }
}

function togglePassword() {
    const passwordField = document.getElementById('userPassword');
    const toggleButton = document.querySelector('.toggle-password i');
    const userPassword = localStorage.getItem('userPassword');

    if (passwordField.textContent === '••••••••') {
        passwordField.textContent = userPassword;
        toggleButton.className = 'fas fa-eye-slash';
    } else {
        passwordField.textContent = '••••••••';
        toggleButton.className = 'fas fa-eye';
    }
}

function updateUserPlanInfo() {
    if (!window.userAuthSystem) {
        console.error('User authentication system not loaded');
        return;
    }

    const userInfo = window.userAuthSystem.getUserInfo(currentUserEmail);
    if (userInfo && userInfo.success) {
        const planDurationElement = document.getElementById('planDuration');
        const daysRemainingElement = document.getElementById('daysRemaining');

        planDurationElement.textContent = userInfo.planDuration || 'N/A';
        daysRemainingElement.textContent = userInfo.daysRemaining || 'N/A';
    }
}

// Toast notification system
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toastContainer');
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => container.removeChild(toast), 500);
    }, 3000);
}

// Plans Popup Functions
function showPlansPopup() {
    const popup = document.getElementById('plansPopup');
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closePlansPopup() {
    const popup = document.getElementById('plansPopup');
    popup.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function redirectToPlans() {
    window.location.href = 'plans.html';
}

// Modify showLoginInterface to show plans popup
const originalShowLoginInterface = showLoginInterface;
showLoginInterface = function() {
    originalShowLoginInterface();
    showPlansPopup();
}

// Close popup when clicking outside
document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('plansPopup');
    popup.addEventListener('click', function(e) {
        if (e.target === this) {
            closePlansPopup();
        }
    });
});
