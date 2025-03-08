// Admin credentials
const ADMIN_EMAIL = 'mu457668@gmail.com';
const ADMIN_PASSWORD = 'Usman55';

// Subscription Plan Limits
const SUBSCRIPTION_LIMITS = {
    plan1: 2500,
    plan2: 5000,
    plan3: 'Unlimited'
};

// Global user authentication system
window.userAuthSystem = {
    init: function() {
        // Initialize the users array if it doesn't exist
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', '[]');
        }
        console.log('Auth system initialized. Current users:', this.getAllUsers());
    },

    checkUserAccess: function(email, password) {
        try {
            const users = this.getAllUsers();
            console.log('Checking access for:', email);
            console.log('Current users in system:', users);
            
            // Find user by email first
            const user = users.find(u => u.email === email);
            console.log('Found user by email:', user);
            
            if (!user) {
                console.log('No user found with email:', email);
                return { success: false, message: 'User not found' };
            }
            
            if (user.password !== password) {
                console.log('Password mismatch for user:', email);
                return { success: false, message: 'Invalid password' };
            }
            
            const now = new Date();
            const expiryDate = new Date(user.expiryDate);
            const hasAccess = now <= expiryDate;
            console.log('Access check:', { now, expiryDate, hasAccess });
            
            if (!hasAccess) {
                return { success: false, message: 'Access expired' };
            }
            
            return { success: true, user: user };
        } catch (error) {
            console.error('Error in checkUserAccess:', error);
            return { success: false, message: 'System error' };
        }
    },
    
    addUser: function(email, password, duration, durationType, plan, customLimit) {
        try {
            if (!email || !password || !duration || !durationType || !plan) {
                console.error('Missing required fields:', { email, password, duration, durationType, plan });
                return false;
            }

            const expiryDate = this.calculateExpiryDate(duration, durationType);
            if (!expiryDate) {
                console.error('Failed to calculate expiry date');
                return false;
            }

            let users = this.getAllUsers();
            
            // Calculate validation limit based on plan and custom limit
            let validationLimit;
            if (plan === 'plan3') {
                validationLimit = 'Unlimited';
            } else {
                validationLimit = customLimit > 0 ? customLimit : SUBSCRIPTION_LIMITS[plan];
            }
            
            // Check if user already exists
            const existingUserIndex = users.findIndex(u => u.email === email);
            const newUser = {
                email,
                password,
                expiryDate: expiryDate.toISOString(),
                active: true,
                createdAt: new Date().toISOString(),
                subscriptionPlan: plan,
                validationLimit,
                validationsUsed: 0
            };

            if (existingUserIndex >= 0) {
                // Update existing user
                users[existingUserIndex] = newUser;
                console.log('Updated existing user:', email);
            } else {
                // Add new user
                users.push(newUser);
                console.log('Added new user:', email);
            }
            
            // Save users back to localStorage
            this.saveUsers(users);
            console.log('Current users in system:', this.getAllUsers());
            return true;
        } catch (error) {
            console.error('Error in addUser:', error);
            return false;
        }
    },
    
    calculateExpiryDate: function(duration, type) {
        try {
            const date = new Date();
            const durationNum = parseInt(duration);
            
            if (isNaN(durationNum) || durationNum <= 0) {
                console.error('Invalid duration:', duration);
                return null;
            }
            
            switch(type) {
                case 'days':
                    date.setDate(date.getDate() + durationNum);
                    break;
                case 'weeks':
                    date.setDate(date.getDate() + (durationNum * 7));
                    break;
                case 'months':
                    date.setMonth(date.getMonth() + durationNum);
                    break;
                default:
                    console.error('Invalid duration type:', type);
                    return null;
            }
            return date;
        } catch (error) {
            console.error('Error in calculateExpiryDate:', error);
            return null;
        }
    },
    
    getAllUsers: function() {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            return users;
        } catch (error) {
            console.error('Error in getAllUsers:', error);
            return [];
        }
    },

    saveUsers: function(users) {
        try {
            localStorage.setItem('users', JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    },

    getUserInfo: function(email) {
        try {
            const users = this.getAllUsers();
            const user = users.find(u => u.email === email);
            
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            const now = new Date();
            const expiryDate = new Date(user.expiryDate);
            const diffTime = expiryDate - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Calculate total duration from creation date
            const createdAt = new Date(user.createdAt);
            const totalDiffTime = expiryDate - createdAt;
            const totalDays = Math.ceil(totalDiffTime / (1000 * 60 * 60 * 24));

            // Handle Plan 3 (Unlimited) case
            const validationsRemaining = user.validationLimit === 'Unlimited' ? 'Unlimited' : (user.validationLimit - user.validationsUsed);
            const validationLimit = user.validationLimit === 'Unlimited' ? 'Unlimited' : user.validationLimit;

            return {
                success: true,
                planDuration: totalDays + ' Days',
                daysRemaining: diffDays + ' Days',
                subscriptionPlan: user.subscriptionPlan,
                validationLimit: validationLimit,
                validationsRemaining: validationsRemaining,
                validationsUsed: user.validationsUsed || 0
            };
        } catch (error) {
            console.error('Error in getUserInfo:', error);
            return { success: false, message: 'Error getting user info' };
        }
    },

    clearAllUsers: function() {
        try {
            localStorage.setItem('users', '[]');
            console.log('Cleared all users from system');
            return true;
        } catch (error) {
            console.error('Error in clearAllUsers:', error);
            return false;
        }
    },

    // Add validation tracking methods
    incrementValidationCount: function(email) {
        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => u.email === email);
            
            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }

            const user = users[userIndex];
            
            // For unlimited plan (Plan 3), always allow validation
            if (user.validationLimit === 'Unlimited') {
                user.validationsUsed = (user.validationsUsed || 0) + 1;
                users[userIndex] = user;
                this.saveUsers(users);
                return {
                    success: true,
                    remaining: 'Unlimited'
                };
            }
            
            // Check if user has reached their limit
            if (user.validationsUsed >= user.validationLimit) {
                return { success: false, message: 'Validation limit reached' };
            }

            // Increment validation count
            user.validationsUsed++;
            users[userIndex] = user;
            this.saveUsers(users);

            return {
                success: true,
                remaining: user.validationLimit - user.validationsUsed
            };
        } catch (error) {
            console.error('Error in incrementValidationCount:', error);
            return { success: false, message: 'System error' };
        }
    },

    resetValidationCount: function(email) {
        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => u.email === email);
            
            if (userIndex === -1) {
                return false;
            }

            users[userIndex].validationsUsed = 0;
            this.saveUsers(users);
            return true;
        } catch (error) {
            console.error('Error in resetValidationCount:', error);
            return false;
        }
    },

    updateValidationLimit: function(email, newLimit) {
        try {
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => u.email === email);
            
            if (userIndex === -1) {
                return false;
            }

            users[userIndex].validationLimit = newLimit;
            this.saveUsers(users);
            return true;
        } catch (error) {
            console.error('Error in updateValidationLimit:', error);
            return false;
        }
    }
};

// Initialize the authentication system
window.userAuthSystem.init();

// DOM Elements
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const addUserForm = document.getElementById('addUserForm');
const logoutBtn = document.getElementById('logoutBtn');
const usersList = document.getElementById('usersList');
const clearUsersBtn = document.getElementById('clearUsersBtn');

// Check if admin is already logged in
let isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
updateUIState();
// Load users if admin is logged in
if (isAdminLoggedIn) {
    loadUsers();
}

// Event Listeners
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
}
if (addUserForm) {
    addUserForm.addEventListener('submit', handleAddUser);
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}
if (clearUsersBtn) {
    clearUsersBtn.addEventListener('click', handleClearUsers);
}

// Admin Login Handler
function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        isAdminLoggedIn = true;
        updateUIState();
        loadUsers();
    } else {
        alert('Invalid admin credentials!');
    }
}

// Add User Handler
function handleAddUser(e) {
    e.preventDefault();
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const duration = document.getElementById('accessDuration').value;
    const durationType = document.getElementById('durationType').value;
    const plan = document.getElementById('subscriptionPlan').value;
    const customLimit = parseInt(document.getElementById('customLimit').value) || 0;

    if (!email || !password || !duration || !plan) {
        alert('Please fill in all required fields');
        return;
    }

    console.log('Adding user with details:', { email, duration, durationType, plan, customLimit });

    if (window.userAuthSystem.addUser(email, password, duration, durationType, plan, customLimit)) {
        alert('User added successfully!');
        document.getElementById('addUserForm').reset();
        loadUsers(); // Reload the users list
    } else {
        alert('Failed to add user. Please try again.');
    }
}

// Load and display users
function loadUsers(searchTerm = '') {
    const users = window.userAuthSystem.getAllUsers();
    const usersList = document.getElementById('usersList');
    
    if (!usersList) {
        console.error('Users list element not found');
        return;
    }

    usersList.innerHTML = '';
    console.log('Loading users:', users);

    // Filter users if search term exists
    const filteredUsers = searchTerm 
        ? users.filter(user => user.email.toLowerCase().includes(searchTerm.toLowerCase()))
        : users;

    if (filteredUsers.length === 0) {
        usersList.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="text-muted">
                        <i class='bx bx-search-alt bx-lg mb-2'></i>
                        <p>No users found${searchTerm ? ` matching "${searchTerm}"` : ''}</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    filteredUsers.forEach((user, index) => {
        const expiryDate = new Date(user.expiryDate);
        const now = new Date();
        const isExpired = now > expiryDate;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.email}</td>
            <td>${expiryDate.toLocaleDateString()}</td>
            <td><span class="badge ${isExpired ? 'bg-danger' : 'bg-success'}">${isExpired ? 'Expired' : 'Active'}</span></td>
            <td>${user.subscriptionPlan ? user.subscriptionPlan.toUpperCase() : 'N/A'}</td>
            <td>${user.validationLimit === Infinity ? 'Unlimited' : (user.validationLimit - (user.validationsUsed || 0))}</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${index})" title="Delete User">
                        <i class='bx bx-trash'></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="resetValidations(${index})" title="Reset Validation Count">
                        <i class='bx bx-reset'></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="extendAccess(${index})" title="Extend Access">
                        <i class='bx bx-time'></i>
                    </button>
                </div>
            </td>
        `;
        usersList.appendChild(row);
    });
}

// Delete user
function deleteUser(index) {
    const users = window.userAuthSystem.getAllUsers();
    users.splice(index, 1);
    window.userAuthSystem.saveUsers(users);
    loadUsers();
}

// Extend user access
function extendAccess(index) {
    const duration = prompt('Enter extension duration (in days):', '30');
    if (duration) {
        const users = window.userAuthSystem.getAllUsers();
        const user = users[index];
        const currentExpiry = new Date(user.expiryDate);
        currentExpiry.setDate(currentExpiry.getDate() + parseInt(duration));
        user.expiryDate = currentExpiry.toISOString();
        window.userAuthSystem.saveUsers(users);
        loadUsers();
    }
}

// Clear all users
function handleClearUsers() {
    if (window.userAuthSystem.clearAllUsers()) {
        alert('All users cleared successfully!');
        loadUsers();
    }
}

// Logout Handler
function handleLogout() {
    localStorage.removeItem('adminLoggedIn');
    isAdminLoggedIn = false;
    updateUIState();
}

// Update UI based on login state
function updateUIState() {
    if (isAdminLoggedIn) {
        loginSection.classList.add('d-none');
        adminDashboard.classList.remove('d-none');
    } else {
        loginSection.classList.remove('d-none');
        adminDashboard.classList.add('d-none');
    }
}

// Add reset validations function
function resetValidations(index) {
    const users = window.userAuthSystem.getAllUsers();
    const user = users[index];
    
    if (window.userAuthSystem.resetValidationCount(user.email)) {
        alert('Validation count reset successfully!');
        loadUsers();
    } else {
        alert('Failed to reset validation count.');
    }
}

// Search users function
function searchUsers() {
    const searchInput = document.getElementById('userSearchInput');
    if (!searchInput) return;

    const searchTerm = searchInput.value.trim();
    loadUsers(searchTerm);
}

// Clear search function
function clearSearch() {
    const searchInput = document.getElementById('userSearchInput');
    if (!searchInput) return;

    searchInput.value = '';
    loadUsers();
}

// Toggle password visibility
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('userPassword');
    const toggleButton = document.querySelector('.password-toggle i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleButton.classList.remove('bx-show');
        toggleButton.classList.add('bx-hide');
    } else {
        passwordInput.type = 'password';
        toggleButton.classList.remove('bx-hide');
        toggleButton.classList.add('bx-show');
    }
}
