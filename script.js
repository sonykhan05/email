document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('url-input');
    const generateBtn = document.getElementById('generate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const qrCodeDiv = document.getElementById('qr-code');
    const downloadSection = document.getElementById('download-section');
    const downloadBtn = document.getElementById('download-btn');
    const generateMessageContainer = document.getElementById('generate-message');
    const downloadMessageContainer = document.getElementById('download-message');
    const particles = document.querySelector('.particles');

    let qrCode = null;

    // Create floating particles
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 5 + 2}px;
            height: ${Math.random() * 5 + 2}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 5}s infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particles.appendChild(particle);
    }

    // Add keyframe animation for particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(-20px) translateX(10px); }
            100% { transform: translateY(0) translateX(0); }
        }
    `;
    document.head.appendChild(style);

    function showMessage(message, type, container) {
        // Clear previous messages
        container.innerHTML = '';
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        
        // Add to container
        container.appendChild(messageElement);
        
        // Show message
        setTimeout(() => messageElement.classList.add('show'), 10);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => messageElement.remove(), 300);
        }, 3000);
    }

    function validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    function resetTool() {
        // Clear input
        urlInput.value = '';
        urlInput.style.borderColor = '#E0E0E0';
        
        // Clear QR code
        qrCodeDiv.innerHTML = '';
        qrCodeDiv.style.opacity = '0';
        
        // Hide download section
        downloadSection.classList.add('hidden');
        
        // Hide reset button
        resetBtn.classList.add('hidden');
        
        // Reset QR code variable
        qrCode = null;
        
        // Show success message
        showMessage('Tool reset successfully!', 'success', generateMessageContainer);
    }

    generateBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            showMessage('Please enter a URL', 'error', generateMessageContainer);
            return;
        }
        
        if (!validateURL(url)) {
            showMessage('Please enter a valid URL', 'error', generateMessageContainer);
            return;
        }
        
        // Show loading state
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        
        // Clear previous QR code
        qrCodeDiv.innerHTML = '';
        
        // Generate new QR code
        qrCode = new QRCode(qrCodeDiv, {
            text: url,
            width: 200,
            height: 200,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Show success message
        showMessage('QR Code generated successfully!', 'success', generateMessageContainer);
        
        // Show download section and reset button
        downloadSection.classList.remove('hidden');
        resetBtn.classList.remove('hidden');
        
        // Reset button state
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-qrcode"></i> Generate QR Code';
    });

    resetBtn.addEventListener('click', () => {
        // Add loading animation to reset button
        resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
        resetBtn.disabled = true;

        // Reset the tool
        resetTool();

        // Reset button state
        setTimeout(() => {
            resetBtn.innerHTML = '<i class="fas fa-redo"></i> Reset';
            resetBtn.disabled = false;
        }, 1000);
    });

    downloadBtn.addEventListener('click', () => {
        // Get the QR code image
        const qrImage = qrCodeDiv.querySelector('img');
        if (!qrImage) return;

        // Create a temporary link
        const link = document.createElement('a');
        link.download = 'qr-code.png';
        link.href = qrImage.src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showMessage('QR Code downloaded successfully!', 'success', downloadMessageContainer);
    });

    // Generate QR code on Enter key press
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateBtn.click();
        }
    });

    // Add input validation
    urlInput.addEventListener('input', () => {
        const url = urlInput.value.trim();
        if (url && validateURL(url)) {
            urlInput.style.borderColor = '#4ECDC4';
        } else {
            urlInput.style.borderColor = '#E0E0E0';
        }
    });
}); 