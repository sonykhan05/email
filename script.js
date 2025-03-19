document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const originalUrlInput = document.getElementById('original-url');
    const shortenBtn = document.getElementById('shorten-btn');
    const customUrlToggle = document.getElementById('custom-url-toggle');
    const customAliasInput = document.querySelector('.custom-alias-input');
    const customAliasField = document.getElementById('custom-alias');
    const resultSection = document.getElementById('result');
    const shortenedUrlField = document.getElementById('shortened-url');
    const copyBtn = document.getElementById('copy-btn');
    const qrBtn = document.getElementById('qr-btn');
    const newUrlBtn = document.getElementById('new-url-btn');
    const qrCodeDiv = document.getElementById('qr-code');
    const recentUrlsList = document.getElementById('recent-urls-list');
    
    // Load recent URLs from localStorage
    let recentUrls = JSON.parse(localStorage.getItem('recentUrls')) || [];
    
    // First check if we need to redirect (if this is a short URL visit)
    checkForRedirect();
    
    // Then render the UI if we're on the homepage
    renderRecentUrls();
    
    // Event Listeners
    customUrlToggle.addEventListener('change', toggleCustomAlias);
    shortenBtn.addEventListener('click', shortenUrl);
    copyBtn.addEventListener('click', copyToClipboard);
    qrBtn.addEventListener('click', generateQRCode);
    newUrlBtn.addEventListener('click', resetForm);
    
    // Toggle custom alias input
    function toggleCustomAlias() {
        customAliasInput.classList.toggle('hidden', !customUrlToggle.checked);
        if (customUrlToggle.checked) {
            customAliasField.focus();
        }
    }
    
    // Shorten URL function
    function shortenUrl() {
        // Get the original URL
        const originalUrl = originalUrlInput.value.trim();
        
        // Validate URL
        if (!isValidUrl(originalUrl)) {
            showToast('Please enter a valid URL', 'error');
            return;
        }
        
        // Get custom alias if enabled
        let customAlias = '';
        if (customUrlToggle.checked) {
            customAlias = customAliasField.value.trim();
            if (customAlias && !isValidAlias(customAlias)) {
                showToast('Custom alias can only contain letters, numbers, and hyphens', 'error');
                return;
            }
        }
        
        // Check if custom alias already exists
        if (customAlias) {
            const aliasExists = recentUrls.some(url => {
                const urlPath = new URL(url.shortUrl).pathname;
                return urlPath.substring(1) === customAlias;
            });
            
            if (aliasExists) {
                showToast('This custom alias is already in use. Please choose another.', 'error');
                return;
            }
        }
        
        // Generate short URL
        const shortCode = customAlias || generateRandomCode(6);
        
        // Create the full short URL with the current domain
        const shortUrl = `${window.location.origin}/${shortCode}`;
        
        // Make sure original URL has http:// if not present
        const formattedOriginalUrl = formatUrl(originalUrl);
        
        // Display result
        shortenedUrlField.value = shortUrl;
        resultSection.classList.remove('hidden');
        
        // Add to recent URLs
        addToRecentUrls(formattedOriginalUrl, shortUrl);
        
        // Scroll to result
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Validate URL
    function isValidUrl(url) {
        try {
            // Add http:// if missing to make URL constructor work
            const urlToCheck = url.match(/^[a-zA-Z]+:\/\//) ? url : 'http://' + url;
            new URL(urlToCheck);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // Make sure URL has http:// prefix
    function formatUrl(url) {
        return url.match(/^[a-zA-Z]+:\/\//) ? url : 'http://' + url;
    }
    
    // Validate alias
    function isValidAlias(alias) {
        return /^[a-zA-Z0-9-]+$/.test(alias);
    }
    
    // Generate random code
    function generateRandomCode(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    // Copy to clipboard
    function copyToClipboard() {
        shortenedUrlField.select();
        
        // Try the modern clipboard API first
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shortenedUrlField.value)
                .then(() => showToast('Copied to clipboard!'))
                .catch(() => {
                    // Fallback to document.execCommand
                    document.execCommand('copy');
                    showToast('Copied to clipboard!');
                });
        } else {
            // Fallback for older browsers
            document.execCommand('copy');
            showToast('Copied to clipboard!');
        }
    }
    
    // Generate QR Code
    function generateQRCode() {
        qrCodeDiv.innerHTML = '';
        qrCodeDiv.classList.remove('hidden');
        
        new QRCode(qrCodeDiv, {
            text: shortenedUrlField.value,
            width: 128,
            height: 128,
            colorDark: '#3a86ff',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
        
        qrBtn.textContent = 'Regenerate QR Code';
    }
    
    // Reset form
    function resetForm() {
        originalUrlInput.value = '';
        customUrlToggle.checked = false;
        customAliasField.value = '';
        customAliasInput.classList.add('hidden');
        resultSection.classList.add('hidden');
        qrCodeDiv.classList.add('hidden');
        qrCodeDiv.innerHTML = '';
        qrBtn.textContent = 'Generate QR Code';
    }
    
    // Add to recent URLs
    function addToRecentUrls(originalUrl, shortUrl) {
        const timestamp = new Date().toISOString();
        
        // Add to the beginning of the array
        recentUrls.unshift({
            originalUrl,
            shortUrl,
            timestamp,
            clicks: 0
        });
        
        // Keep only the most recent 10 URLs
        if (recentUrls.length > 10) {
            recentUrls = recentUrls.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('recentUrls', JSON.stringify(recentUrls));
        
        // Update the UI
        renderRecentUrls();
    }
    
    // Render recent URLs
    function renderRecentUrls() {
        if (!recentUrlsList) return; // We might be on a redirect page
        
        if (recentUrls.length === 0) {
            recentUrlsList.innerHTML = '<p class="empty-list">No recent URLs</p>';
            return;
        }
        
        recentUrlsList.innerHTML = '';
        
        recentUrls.forEach(url => {
            const urlItem = document.createElement('div');
            urlItem.className = 'url-item';
            
            // Create URL info section
            const urlInfo = document.createElement('div');
            urlInfo.className = 'url-info';
            
            const originalUrlSpan = document.createElement('div');
            originalUrlSpan.className = 'original-url';
            originalUrlSpan.textContent = url.originalUrl;
            
            const shortUrlSpan = document.createElement('div');
            shortUrlSpan.className = 'short-url';
            shortUrlSpan.textContent = url.shortUrl;
            
            urlInfo.appendChild(shortUrlSpan);
            urlInfo.appendChild(originalUrlSpan);
            
            // Create URL actions section
            const urlActions = document.createElement('div');
            urlActions.className = 'url-actions';
            
            const copyButton = document.createElement('button');
            copyButton.innerHTML = '<i class="fas fa-copy"></i>';
            copyButton.title = 'Copy to clipboard';
            copyButton.addEventListener('click', () => {
                navigator.clipboard.writeText(url.shortUrl)
                    .then(() => showToast('Copied to clipboard!'))
                    .catch(() => {
                        // Fallback for clipboard API failure
                        const tempInput = document.createElement('input');
                        tempInput.value = url.shortUrl;
                        document.body.appendChild(tempInput);
                        tempInput.select();
                        document.execCommand('copy');
                        document.body.removeChild(tempInput);
                        showToast('Copied to clipboard!');
                    });
            });
            
            const qrButton = document.createElement('button');
            qrButton.innerHTML = '<i class="fas fa-qrcode"></i>';
            qrButton.title = 'Generate QR code';
            qrButton.addEventListener('click', () => {
                // Set the URL in the main form and trigger QR generation
                originalUrlInput.value = url.originalUrl;
                shortenedUrlField.value = url.shortUrl;
                resultSection.classList.remove('hidden');
                generateQRCode();
                resultSection.scrollIntoView({ behavior: 'smooth' });
            });
            
            urlActions.appendChild(copyButton);
            urlActions.appendChild(qrButton);
            
            // Add everything to the URL item
            urlItem.appendChild(urlInfo);
            urlItem.appendChild(urlActions);
            
            // Add to the list
            recentUrlsList.appendChild(urlItem);
        });
    }
    
    // Show toast notification
    function showToast(message, type = 'success') {
        // Remove any existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Show toast (delayed to allow CSS transition)
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
    
    // Check if current URL is a shortened URL and redirect if needed
    function checkForRedirect() {
        const path = window.location.pathname;
        
        // Only process non-root paths (these are potentially shortened URLs)
        if (path !== '/' && path !== '/index.html') {
            const shortCode = path.substring(1);
            
            // Find the URL in our recent URLs
            const urlData = recentUrls.find(url => {
                const urlPath = new URL(url.shortUrl).pathname;
                return urlPath.substring(1) === shortCode;
            });
            
            if (urlData) {
                // Increment click count
                urlData.clicks++;
                localStorage.setItem('recentUrls', JSON.stringify(recentUrls));
                
                // Replace the entire page with our redirect page
                document.body.innerHTML = createRedirectPage(urlData.originalUrl);
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = urlData.originalUrl;
                }, 2000);
                
                return true;
            } else {
                // Show error for unknown short URL
                document.body.innerHTML = createErrorPage(shortCode);
                return true;
            }
        }
        
        return false;
    }
    
    // Create a redirect page to display before redirecting
    function createRedirectPage(targetUrl) {
        return `
            <div class="redirect-page">
                <div class="redirect-container">
                    <div class="logo">
                        <i class="fas fa-link"></i>
                        <h1>QuickLink</h1>
                    </div>
                    <div class="redirect-info">
                        <h2>Redirecting you to:</h2>
                        <p class="redirect-url">${targetUrl}</p>
                        <div class="loader"></div>
                        <p class="redirect-message">You will be redirected in 2 seconds...</p>
                    </div>
                </div>
            </div>
            <style>
                body, html {
                    height: 100%;
                    margin: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8f9fa;
                }
                .redirect-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    padding: 20px;
                }
                .redirect-container {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    padding: 30px;
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .logo i {
                    font-size: 2.5rem;
                    color: #3a86ff;
                    margin-right: 10px;
                }
                .logo h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #3a86ff;
                    margin: 0;
                }
                .redirect-info h2 {
                    margin-bottom: 10px;
                    color: #333;
                }
                .redirect-url {
                    background-color: #f5f5f5;
                    padding: 12px;
                    border-radius: 6px;
                    margin-bottom: 20px;
                    word-break: break-all;
                    font-size: 0.9rem;
                    color: #555;
                }
                .loader {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #3a86ff;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .redirect-message {
                    color: #666;
                    font-size: 0.9rem;
                }
            </style>
        `;
    }
    
    // Create an error page for unknown short URLs
    function createErrorPage(shortCode) {
        return `
            <div class="redirect-page">
                <div class="redirect-container">
                    <div class="logo">
                        <i class="fas fa-link"></i>
                        <h1>QuickLink</h1>
                    </div>
                    <div class="redirect-info">
                        <h2>Link Not Found</h2>
                        <p class="error-message">Sorry, the shortened URL <span>${shortCode}</span> does not exist or has expired.</p>
                        <a href="/" class="back-button">Go to Homepage</a>
                    </div>
                </div>
            </div>
            <style>
                body, html {
                    height: 100%;
                    margin: 0;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #f8f9fa;
                }
                .redirect-page {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    padding: 20px;
                }
                .redirect-container {
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                    padding: 30px;
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                }
                .logo {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 20px;
                }
                .logo i {
                    font-size: 2.5rem;
                    color: #3a86ff;
                    margin-right: 10px;
                }
                .logo h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: #3a86ff;
                    margin: 0;
                }
                .redirect-info h2 {
                    margin-bottom: 20px;
                    color: #333;
                }
                .error-message {
                    margin-bottom: 30px;
                    color: #666;
                    font-size: 1rem;
                }
                .error-message span {
                    font-weight: bold;
                    color: #444;
                }
                .back-button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #3a86ff;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                    font-weight: 600;
                    transition: background-color 0.3s;
                }
                .back-button:hover {
                    background-color: #2a75e6;
                }
            </style>
        `;
    }
}); 