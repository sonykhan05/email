// Exchange rate variable
let GBP_TO_PKR_RATE = 358.58; // Default rate until API updates it

// Function to format the exchange rate display
function updateRateDisplay(rate) {
    const currentRate = document.getElementById('currentRate');
    currentRate.textContent = `1 GBP = ${rate.toFixed(2)} PKR`;
    currentRate.style.color = '#2e7d32'; // Show in green to indicate success
    // Recalculate if there are existing values
    if (document.getElementById('sellingPrice').value || document.getElementById('temuCost').value) {
        calculateProfit();
    }
}

// Function to show loading state
function showLoading() {
    const currentRate = document.getElementById('currentRate');
    currentRate.textContent = 'Updating...';
    currentRate.style.color = '#666';
}

// Fetch latest exchange rate
async function updateExchangeRate() {
    showLoading();
    
    // List of APIs to try in order
    const apis = [
        'https://api.exchangerate.host/latest?base=GBP&symbols=PKR',
        'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/gbp/pkr.json',
        'https://open.er-api.com/v6/latest/GBP'
    ];

    for (let api of apis) {
        try {
            const response = await fetch(api);
            const data = await response.json();
            
            let rate = null;
            // Parse rate based on API format
            if (data.rates && data.rates.PKR) {
                rate = data.rates.PKR;
            } else if (data.pkr) {
                rate = data.pkr;
            }

            if (rate && !isNaN(rate) && rate > 0) {
                GBP_TO_PKR_RATE = rate;
                updateRateDisplay(GBP_TO_PKR_RATE);
                console.log('Exchange rate updated from', api, ':', GBP_TO_PKR_RATE);
                return; // Success - exit the function
            }
        } catch (error) {
            console.log('Error with API:', api, error);
            continue; // Try next API
        }
    }

    // If all APIs fail, use the default rate
    console.log('All APIs failed, using default rate');
    updateRateDisplay(GBP_TO_PKR_RATE);
}

// Update exchange rate every 5 minutes
updateExchangeRate(); // Initial update
setInterval(updateExchangeRate, 300000); // Update every 5 minutes

function calculateProfit() {
    // Get input values
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
    const temuCost = parseFloat(document.getElementById('temuCost').value) || 0;

    // Calculate after eBay fees (25%)
    const ebayFees = sellingPrice * 0.25;
    const afterFees = sellingPrice - ebayFees;

    // Calculate total profit in GBP
    const profitGBP = afterFees - temuCost;

    // Convert profit to PKR using current rate
    const profitPKR = profitGBP * GBP_TO_PKR_RATE;

    // Update the display with animations
    updateValueWithAnimation('afterFees', `£${afterFees.toFixed(2)}`);
    updateValueWithAnimation('profitGBP', `£${profitGBP.toFixed(2)}`);
    updateValueWithAnimation('profitPKR', `PKR ${profitPKR.toFixed(2)}`);

    // Add color coding for profit/loss
    const profitGBPElement = document.getElementById('profitGBP');
    const profitPKRElement = document.getElementById('profitPKR');

    if (profitGBP > 0) {
        profitGBPElement.style.color = '#43cea2';
        profitPKRElement.style.color = '#43cea2';
    } else if (profitGBP < 0) {
        profitGBPElement.style.color = '#ff4444';
        profitPKRElement.style.color = '#ff4444';
    } else {
        profitGBPElement.style.color = '#1a1a1a';
        profitPKRElement.style.color = '#1a1a1a';
    }
}

// Function to update values with animation
function updateValueWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    element.style.transform = 'translateX(-10px)';
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.textContent = newValue;
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
    }, 150);
}

// Add event listeners for real-time calculation
document.getElementById('sellingPrice').addEventListener('input', calculateProfit);
document.getElementById('temuCost').addEventListener('input', calculateProfit); 