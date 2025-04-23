// Exchange rate variables
let GBP_TO_PKR_RATE = 358.58; // Default rate until API updates it
let USD_TO_PKR_RATE = 278.50; // Default USD to PKR rate
let GBP_TO_USD_RATE = 1.29;   // Default GBP to USD rate

// Current currency mode
let currentCurrency = 'GBP'; // Default to GBP

// Function to format the exchange rate display
function updateRateDisplay(rate) {
    const currentRate = document.getElementById('currentRate');
    if (currentCurrency === 'GBP') {
        currentRate.textContent = `1 GBP = ${rate.toFixed(2)} PKR`;
    } else {
        currentRate.textContent = `1 USD = ${USD_TO_PKR_RATE.toFixed(2)} PKR`;
    }
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

// Fetch latest exchange rates
async function updateExchangeRates() {
    showLoading();
    
    // List of APIs to try in order for GBP to PKR
    const gbpApis = [
        'https://api.exchangerate.host/latest?base=GBP&symbols=PKR,USD',
        'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/gbp/pkr.json',
        'https://open.er-api.com/v6/latest/GBP'
    ];

    // List of APIs to try for USD to PKR
    const usdApis = [
        'https://api.exchangerate.host/latest?base=USD&symbols=PKR',
        'https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/pkr.json',
        'https://open.er-api.com/v6/latest/USD'
    ];

    // First try to get GBP rates
    let gbpSuccess = false;
    for (let api of gbpApis) {
        try {
            const response = await fetch(api);
            const data = await response.json();
            
            let pkrRate = null;
            let usdRate = null;
            
            // Parse rates based on API format
            if (data.rates) {
                if (data.rates.PKR) pkrRate = data.rates.PKR;
                if (data.rates.USD) usdRate = data.rates.USD;
            } else if (data.pkr) {
                pkrRate = data.pkr;
            }

            if (pkrRate && !isNaN(pkrRate) && pkrRate > 0) {
                GBP_TO_PKR_RATE = pkrRate;
                if (usdRate && !isNaN(usdRate) && usdRate > 0) {
                    GBP_TO_USD_RATE = usdRate;
                }
                gbpSuccess = true;
                console.log('GBP exchange rates updated from', api);
                break;
            }
        } catch (error) {
            console.log('Error with GBP API:', api, error);
            continue;
        }
    }

    // Then try to get USD rates
    for (let api of usdApis) {
        try {
            const response = await fetch(api);
            const data = await response.json();
            
            let pkrRate = null;
            
            // Parse rate based on API format
            if (data.rates && data.rates.PKR) {
                pkrRate = data.rates.PKR;
            } else if (data.pkr) {
                pkrRate = data.pkr;
            }

            if (pkrRate && !isNaN(pkrRate) && pkrRate > 0) {
                USD_TO_PKR_RATE = pkrRate;
                console.log('USD exchange rate updated from', api);
                break;
            }
        } catch (error) {
            console.log('Error with USD API:', api, error);
            continue;
        }
    }

    // Update the display with the appropriate rate
    updateRateDisplay(currentCurrency === 'GBP' ? GBP_TO_PKR_RATE : USD_TO_PKR_RATE);
}

// Update exchange rate every 5 minutes
updateExchangeRates(); // Initial update
setInterval(updateExchangeRates, 300000); // Update every 5 minutes

function calculateProfit() {
    // Get input values
    const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
    const temuCost = parseFloat(document.getElementById('temuCost').value) || 0;

    // Calculate after eBay fees (25%)
    const ebayFees = sellingPrice * 0.25;
    const afterFees = sellingPrice - ebayFees;

    // Calculate total profit in current currency
    const profit = afterFees - temuCost;

    // Convert profit to PKR using current rate
    const profitPKR = currentCurrency === 'GBP' 
        ? profit * GBP_TO_PKR_RATE
        : profit * USD_TO_PKR_RATE;

    // Currency symbol to display
    const currencySymbol = currentCurrency === 'GBP' ? '£' : '$';

    // Update the currency code in the result label
    document.querySelector('.currency-code').textContent = currentCurrency;

    // Update the display with animations
    updateValueWithAnimation('afterFees', `<span class="currency-symbol">${currencySymbol}</span>${afterFees.toFixed(2)}`);
    updateValueWithAnimation('profitGBP', `<span class="currency-symbol">${currencySymbol}</span>${profit.toFixed(2)}`);
    updateValueWithAnimation('profitPKR', `PKR ${profitPKR.toFixed(2)}`);

    // Add color coding for profit/loss
    const profitElement = document.getElementById('profitGBP');
    const profitPKRElement = document.getElementById('profitPKR');

    if (profit > 0) {
        profitElement.style.color = '#43cea2';
        profitPKRElement.style.color = '#43cea2';
    } else if (profit < 0) {
        profitElement.style.color = '#ff4444';
        profitPKRElement.style.color = '#ff4444';
    } else {
        profitElement.style.color = '#1a1a1a';
        profitPKRElement.style.color = '#1a1a1a';
    }
}

// Function to update values with animation
function updateValueWithAnimation(elementId, newValue) {
    const element = document.getElementById(elementId);
    element.style.transform = 'translateX(-10px)';
    element.style.opacity = '0';
    
    setTimeout(() => {
        element.innerHTML = newValue;
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
    }, 150);
}

// Function to switch currency
function switchCurrency(currency) {
    if (currentCurrency === currency) return; // No change needed
    
    currentCurrency = currency;
    
    // Update UI elements
    const currencySymbol = currency === 'GBP' ? '£' : '$';
    document.querySelectorAll('.currency-symbol').forEach(el => {
        el.textContent = currencySymbol;
    });
    
    // Update active state in switcher
    document.querySelectorAll('.switch-option').forEach(option => {
        if (option.dataset.currency === currency) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Update exchange rate display
    updateRateDisplay(currency === 'GBP' ? GBP_TO_PKR_RATE : USD_TO_PKR_RATE);
    
    // Recalculate if needed
    if (document.getElementById('sellingPrice').value || document.getElementById('temuCost').value) {
        calculateProfit();
    }
}

// Add event listeners for real-time calculation
document.getElementById('sellingPrice').addEventListener('input', calculateProfit);
document.getElementById('temuCost').addEventListener('input', calculateProfit);

// Add event listeners for currency switching
document.addEventListener('DOMContentLoaded', function() {
    // Set GBP as active by default
    document.querySelector('[data-currency="GBP"]').classList.add('active');
    
    // Add click handlers to currency options
    document.querySelectorAll('.switch-option').forEach(option => {
        option.addEventListener('click', function() {
            switchCurrency(this.dataset.currency);
        });
    });
}); 