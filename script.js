document.addEventListener('DOMContentLoaded', () => {
    const inputText = document.getElementById('inputText');
    const extractBtn = document.getElementById('extractBtn');
    const resetBtn = document.getElementById('resetBtn');
    const copyBtn = document.getElementById('copyBtn');
    const resultsBody = document.getElementById('resultsBody');
    const resultsSection = document.getElementById('resultsSection');
    const emailCount = document.getElementById('emailCount');

    // Email regex pattern
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    
    // Store extracted emails globally
    let extractedEmails = [];

    function extractEmails(text) {
        const emails = text.match(emailPattern) || [];
        return [...new Set(emails)]; // Remove duplicates
    }

    function updateEmailCount(count) {
        const plural = count !== 1 ? 's' : '';
        emailCount.innerHTML = `
            <i class="fas fa-envelope"></i>
            <span>${count} email${plural} found</span>
        `;
    }

    function displayResults(emails) {
        resultsBody.innerHTML = '';
        resultsSection.style.display = emails.length > 0 ? 'block' : 'none';
        updateEmailCount(emails.length);

        if (emails.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="2" class="no-results">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    No email addresses found in the provided text.
                </td>
            `;
            resultsBody.appendChild(row);
            return;
        }

        emails.forEach((email, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${email}</td>
            `;
            resultsBody.appendChild(row);
        });
    }

    function resetTool() {
        inputText.value = '';
        extractedEmails = [];
        resultsBody.innerHTML = '';
        resultsSection.style.display = 'none';
        updateEmailCount(0);
    }

    async function copyEmails() {
        if (extractedEmails.length === 0) return;
        
        const emailText = extractedEmails.join('\n');
        try {
            await navigator.clipboard.writeText(emailText);
            
            // Visual feedback
            copyBtn.classList.add('copied');
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.innerHTML = originalHTML;
            }, 2000);
        } catch (err) {
            alert('Failed to copy emails. Please try again.');
        }
    }

    extractBtn.addEventListener('click', () => {
        const text = inputText.value;
        if (text.trim() === '') {
            alert('Please enter some text to extract email addresses.');
            return;
        }

        extractedEmails = extractEmails(text);
        displayResults(extractedEmails);
    });

    resetBtn.addEventListener('click', resetTool);
    copyBtn.addEventListener('click', copyEmails);

    // Add keyboard shortcuts
    inputText.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to extract
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            extractBtn.click();
        }
    });
});
