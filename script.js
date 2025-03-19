// DOM Elements
const videoUrlInput = document.getElementById('videoUrl');
const searchBtn = document.getElementById('searchBtn');
const loader = document.getElementById('loader');
const results = document.getElementById('results');
const videoTitle = document.getElementById('videoTitle');
const channelName = document.getElementById('channelName');
const thumbnailGrid = document.getElementById('thumbnailGrid');

// Current thumbnail URL for download
let currentThumbnailUrl = '';
let currentVideoId = '';

// Youtube Video ID Regex Pattern
const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;

// Event Listeners
searchBtn.addEventListener('click', processVideoUrl);
videoUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processVideoUrl();
    }
});

// Autofocus the input field on page load
window.addEventListener('load', () => {
    videoUrlInput.focus();
});

// Process the Video URL
async function processVideoUrl() {
    const url = videoUrlInput.value.trim();
    
    if (!url) {
        showError('Please enter a YouTube video URL');
        return;
    }
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
        showError('Invalid YouTube URL. Please enter a valid YouTube video URL');
        return;
    }
    
    currentVideoId = videoId;
    showLoader();
    
    try {
        await fetchVideoInfo(videoId);
    } catch (error) {
        hideLoader();
        showError('Error fetching video information. Please try again.');
        console.error(error);
    }
}

// Extract Video ID from URL
function extractVideoId(url) {
    const match = url.match(youtubeRegex);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Fetch Video Information
async function fetchVideoInfo(videoId) {
    // Only keep the max resolution thumbnail
    const maxThumbnail = {
        url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        quality: 'Max Resolution (1280x720)'
    };
    
    // Set the current thumbnail URL for download
    currentThumbnailUrl = maxThumbnail.url;
    
    try {
        // Fetch video info using oEmbed
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        
        // Display video info
        displayVideoInfo(data, maxThumbnail, videoId);
    } catch (error) {
        try {
            // If first fetch fails, try again (sometimes oEmbed can be flaky)
            const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
            const data = await response.json();
            
            const basicData = {
                title: data.title || 'Video Title Not Available',
                author_name: data.author_name || 'Channel information not available',
            };
            
            displayVideoInfo(basicData, maxThumbnail, videoId);
        } catch (oembedError) {
            // If oEmbed also fails, show basic info
            const basicData = {
                title: 'Video Title Not Available',
                author_name: 'Channel information not available',
            };
            displayVideoInfo(basicData, maxThumbnail, videoId);
            console.error('Error fetching video data:', error, oembedError);
        }
    }
}

// Display Video Information
function displayVideoInfo(data, thumbnail, videoId) {
    // Set video title and channel
    videoTitle.textContent = data.title || 'Video Title Not Available';
    channelName.textContent = data.author_name || 'Channel information not available';
    
    // Display single max resolution thumbnail
    displayMaxThumbnail(thumbnail, videoId);
    
    // Show results and hide loader
    hideLoader();
    results.style.display = 'block';
    
    // Scroll to results with smooth animation
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Add animation class to results for fade-in effect
    results.classList.add('fade-in');
    
    // Remove animation class after animation completes
    setTimeout(() => {
        results.classList.remove('fade-in');
    }, 1000);
}

// Display Max Resolution Thumbnail
function displayMaxThumbnail(thumbnail, videoId) {
    thumbnailGrid.innerHTML = '';
    
    // Create a single container for thumbnail and download button
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.style.textAlign = 'center';
    
    const thumbnailItem = document.createElement('div');
    thumbnailItem.className = 'thumbnail-item';
    thumbnailItem.style.maxWidth = '640px';
    thumbnailItem.style.margin = '0 auto 20px auto';
    
    const img = document.createElement('img');
    img.src = thumbnail.url;
    img.alt = 'YouTube Video Thumbnail (Max Resolution)';
    img.loading = 'eager'; // Prioritize image loading
    
    // Show loading state
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="mini-spinner"></div>';
    thumbnailItem.appendChild(loadingOverlay);
    
    // Handle image loading events
    img.onload = function() {
        // Remove loading overlay when image loads
        if (loadingOverlay.parentNode) {
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
    };
    
    img.onerror = function() {
        // If max resolution is not available, try high quality instead
        this.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        currentThumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        
        // Update the quality text
        if (info && info.textContent) {
            info.textContent = 'High Quality (480x360)';
        }
        
        // Remove loading overlay when fallback image loads
        if (loadingOverlay.parentNode) {
            loadingOverlay.parentNode.removeChild(loadingOverlay);
        }
        
        this.onerror = function() {
            // If high quality also fails, mark as unavailable
            this.parentNode.style.opacity = '0.7';
            const overlay = document.createElement('div');
            overlay.className = 'thumbnail-info error-overlay';
            overlay.innerHTML = '<i class="fas fa-exclamation-circle"></i> Thumbnail Not Available';
            thumbnailItem.appendChild(overlay);
            
            // Disable the main download button
            const downloadBtn = document.querySelector('.main-download-btn');
            if (downloadBtn) {
                downloadBtn.disabled = true;
                downloadBtn.style.opacity = '0.5';
                downloadBtn.style.cursor = 'not-allowed';
            }
            
            // Remove loading overlay if it still exists
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        };
    };
    
    thumbnailItem.appendChild(img);
    
    // Add quality label at the bottom of the thumbnail
    const info = document.createElement('div');
    info.className = 'thumbnail-info';
    info.textContent = thumbnail.quality;
    thumbnailItem.appendChild(info);
    
    // Add the download button directly below the thumbnail
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'main-download-btn';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Thumbnail';
    downloadBtn.style.margin = '25px auto 10px';
    downloadBtn.style.display = 'block';
    
    // Add click event listener for download
    downloadBtn.onclick = function() {
        downloadImage(currentThumbnailUrl, `youtube-thumbnail-${videoId}.jpg`);
        
        // Add visual feedback for button click
        this.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
        this.style.backgroundColor = '#4CAF50';
        
        // Reset button after a short delay
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-download"></i> Download Thumbnail';
            this.style.backgroundColor = '';
        }, 2000);
    };
    
    thumbnailContainer.appendChild(thumbnailItem);
    thumbnailContainer.appendChild(downloadBtn);
    
    thumbnailGrid.appendChild(thumbnailContainer);
}

// Download Image function
function downloadImage(url, filename) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
            console.error('Error downloading image:', error);
            alert('Failed to download image. Please try again.');
        });
}

// Show Error
function showError(message) {
    hideLoader();
    
    // Create a more visually appealing error notification
    const errorNotification = document.createElement('div');
    errorNotification.className = 'error-notification';
    errorNotification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    // Add to the page
    document.body.appendChild(errorNotification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        errorNotification.classList.add('fade-out');
        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.parentNode.removeChild(errorNotification);
            }
        }, 300);
    }, 3000);
}

// Show Loader
function showLoader() {
    loader.style.display = 'block';
    results.style.display = 'none';
}

// Hide Loader
function hideLoader() {
    loader.style.display = 'none';
} 