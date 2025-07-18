// Dynamic API base: use relative if on 8080, else use http://localhost:8080
const API = (window.location.port === '8080' || window.location.hostname === 'localhost' && window.location.port === '')
    ? '/api'
    : 'http://localhost:8080/api';

// Elements
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const expenseForm = document.getElementById('expense-form');
const expensesTableBody = document.querySelector('#expenses-table tbody');
const authError = document.getElementById('auth-error');
const expenseError = document.getElementById('expense-error');
const logoutBtn = document.getElementById('logout-btn');

// New elements for enhanced features
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const netBalanceEl = document.getElementById('net-balance');
const transactionCountEl = document.getElementById('transaction-count');
const noTransactionsEl = document.getElementById('no-transactions');
const exportCsvBtn = document.getElementById('export-csv');
const applyFilterBtn = document.getElementById('apply-filter');
const clearFilterBtn = document.getElementById('clear-filter');

// Filter elements
const filterStartDate = document.getElementById('filter-start-date');
const filterEndDate = document.getElementById('filter-end-date');
const filterCategory = document.getElementById('filter-category');
const filterType = document.getElementById('filter-type');
const filterDescription = document.getElementById('filter-description');

// --- Places to Visit Section Logic ---
const placeForm = document.getElementById('place-form');
const placesTableBody = document.querySelector('#places-table tbody');
const placesMessage = document.getElementById('places-message');
const placesTotal = document.getElementById('places-total');

// Global variables
let allExpenses = [];
let filteredExpenses = [];

// Add category select
let categorySelect = document.getElementById('expense-category');
if (!categorySelect || categorySelect.tagName !== 'SELECT') {
    // Replace input with select
    const oldInput = document.getElementById('expense-category');
    categorySelect = document.createElement('select');
    categorySelect.id = 'expense-category';
    categorySelect.required = true;
    oldInput.parentNode.replaceChild(categorySelect, oldInput);
}

function setToken(token) { localStorage.setItem('jwt', token); }
function getToken() { return localStorage.getItem('jwt'); }
function clearToken() { localStorage.removeItem('jwt'); }

function showDashboard() {
    authContainer.style.display = 'none';
    dashboardContainer.style.display = 'block';
    loadCategories();
    loadExpenses();
    loadPlaces();
    loadCreditCardSummary();
}
function showAuth() {
    authContainer.style.display = 'block';
    dashboardContainer.style.display = 'none';
}

// Method 1: Financial Summary Calculation
function updateFinancialSummary() {
    const totalIncome = filteredExpenses
        .filter(exp => exp.type === 'INCOME')
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    const totalExpenses = filteredExpenses
        .filter(exp => exp.type === 'EXPENSE')
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    
    const netBalance = totalIncome - totalExpenses;
    
    totalIncomeEl.textContent = `₹${totalIncome.toFixed(2)}`;
    totalExpensesEl.textContent = `₹${totalExpenses.toFixed(2)}`;
    netBalanceEl.textContent = `₹${netBalance.toFixed(2)}`;
    
    // Update transaction count
    transactionCountEl.textContent = `${filteredExpenses.length} transaction${filteredExpenses.length !== 1 ? 's' : ''}`;
}

// Method 2: Search and Filter Functionality
function applyFilters() {
    const startDate = filterStartDate.value;
    const endDate = filterEndDate.value;
    const category = filterCategory.value;
    const type = filterType.value;
    const description = filterDescription.value.toLowerCase();
    
    filteredExpenses = allExpenses.filter(exp => {
        // Date filter
        if (startDate && exp.date < startDate) return false;
        if (endDate && exp.date > endDate) return false;
        
        // Category filter
        if (category && exp.category?.id?.toString() !== category) return false;
        
        // Type filter
        if (type && exp.type !== type) return false;
        
        // Description filter
        if (description && !exp.description?.toLowerCase().includes(description)) return false;
        
        return true;
    });
    
    displayExpenses(filteredExpenses);
    updateFinancialSummary();
}

function clearFilters() {
    filterStartDate.value = '';
    filterEndDate.value = '';
    filterCategory.value = '';
    filterType.value = '';
    filterDescription.value = '';
    
    filteredExpenses = [...allExpenses];
    displayExpenses(filteredExpenses);
    updateFinancialSummary();
}

// Method 3: CSV Export Functionality
function exportToCSV() {
    if (filteredExpenses.length === 0) {
        alert('No data to export!');
        return;
    }
    
    const headers = ['Category', 'Amount', 'Date', 'Type', 'Description'];
    const csvContent = [
        headers.join(','),
        ...filteredExpenses.map(exp => [
            `"${exp.category?.name || ''}"`,
            exp.amount,
            exp.date,
            exp.type,
            `"${exp.description || ''}"`
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function displayExpenses(expenses) {
    expensesTableBody.innerHTML = '';
    
    if (expenses.length === 0) {
        document.getElementById('expenses-table').style.display = 'none';
        noTransactionsEl.style.display = 'block';
    } else {
        document.getElementById('expenses-table').style.display = 'table';
        noTransactionsEl.style.display = 'none';
        
        expenses.forEach(exp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${exp.category?.name || ''}</td>
                <td>₹${parseFloat(exp.amount).toFixed(2)}</td>
                <td>${exp.date}</td>
                <td>${exp.type}</td>
                <td>${exp.description || ''}</td>
            `;
            expensesTableBody.appendChild(tr);
        });
    }
}

// Event Listeners for new features
exportCsvBtn.addEventListener('click', exportToCSV);
applyFilterBtn.addEventListener('click', applyFilters);
clearFilterBtn.addEventListener('click', clearFilters);

function animateCSS(element, animation) {
    element.classList.remove('shake', 'pulse');
    void element.offsetWidth; // trigger reflow
    element.classList.add(animation);
    element.addEventListener('animationend', function handler() {
        element.classList.remove(animation);
        element.removeEventListener('animationend', handler);
    });
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    try {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usernameOrEmail: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value
            })
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Login failed');
        }
        const data = await res.json();
        setToken(data.token);
        showDashboard();
        animateCSS(authError, 'pulse');
    } catch (err) {
        authError.textContent = err.message || 'Login failed.';
        animateCSS(authError, 'shake');
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    try {
        const res = await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: document.getElementById('register-username').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value
            })
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Registration failed');
        }
        authError.textContent = 'Registration successful! Please login.';
        animateCSS(authError, 'pulse');
    } catch (err) {
        authError.textContent = err.message || 'Registration failed.';
        animateCSS(authError, 'shake');
    }
});

logoutBtn.addEventListener('click', () => {
    clearToken();
    showAuth();
});

expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    expenseError.textContent = '';
    try {
        const categoryId = categorySelect.value;
        const amount = document.getElementById('expense-amount').value;
        const date = document.getElementById('expense-date').value;
        const type = document.getElementById('expense-type').value;
        const description = document.getElementById('expense-description').value;
        const creditCard = expenseCreditCard && expenseCreditCard.checked;
        // Validate required fields
        if (!amount || !date || !type) {
            throw new Error('Please fill in all required fields');
        }
        const requestBody = {
            amount: amount.toString(),
            date: date,
            type: type,
            description: description || '',
            creditCard: creditCard
        };
        // If categoryId is a number, use it; otherwise use categoryName
        if (categoryId && !isNaN(categoryId)) {
            requestBody.categoryId = parseInt(categoryId);
        } else {
            requestBody.categoryName = categorySelect.options[categorySelect.selectedIndex]?.textContent || 'General';
        }
        const res = await fetch(`${API}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify(requestBody)
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Failed to add expense');
        }
        expenseForm.reset();
        loadExpenses();
        loadCreditCardSummary();
        expenseError.textContent = 'Expense added successfully!';
        setTimeout(() => expenseError.textContent = '', 3000);
    } catch (err) {
        expenseError.textContent = err.message || 'Failed to add expense.';
    }
});

if (placeForm) {
    placeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        placesMessage.textContent = '';
        const name = document.getElementById('place-name').value;
        const description = document.getElementById('place-description').value;
        const estimatedCost = document.getElementById('place-estimated-cost').value;
        try {
            const res = await fetch(`${API}/places`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({ name, description, estimatedCost })
            });
            if (!res.ok) throw new Error('Failed to add place');
            placesMessage.textContent = 'Place added!';
            placeForm.reset();
            loadPlaces();
        } catch (err) {
            placesMessage.textContent = err.message || 'Failed to add place.';
        }
    });
}

async function loadCategories() {
    categorySelect.innerHTML = '';
    
    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a category';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    categorySelect.appendChild(defaultOption);
    
    try {
        const res = await fetch(`${API}/categories`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!res.ok) throw new Error('Failed to load categories');
        const data = await res.json();
        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
        });
        
        // Populate filter category dropdown
        filterCategory.innerHTML = '<option value="">All Categories</option>';
        data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            filterCategory.appendChild(option);
        });
        
        // If no categories exist, add a default one
        if (data.length === 0) {
            const option = document.createElement('option');
            option.value = 'general';
            option.textContent = 'General';
            categorySelect.appendChild(option);
            filterCategory.appendChild(option.cloneNode(true));
        }
    } catch (err) {
        expenseError.textContent = err.message || 'Failed to load categories.';
        // Add a fallback option
        const option = document.createElement('option');
        option.value = 'general';
        option.textContent = 'General';
        categorySelect.appendChild(option);
        filterCategory.appendChild(option.cloneNode(true));
    }
}

async function loadExpenses() {
    expensesTableBody.innerHTML = '';
    expenseError.textContent = '';
    try {
        const res = await fetch(`${API}/expenses`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || 'Failed to load expenses');
        }
        const data = await res.json();
        allExpenses = data || [];
        filteredExpenses = [...allExpenses];
        displayExpenses(filteredExpenses);
        updateFinancialSummary();
    } catch (err) {
        expenseError.textContent = err.message || 'Failed to load expenses.';
    }
}

async function loadPlaces() {
    if (!placesTableBody) return;
    placesTableBody.innerHTML = '';
    placesMessage.textContent = '';
    let total = 0;
    try {
        const res = await fetch(`${API}/places`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!res.ok) throw new Error('Failed to load places');
        const data = await res.json();
        data.forEach(place => {
            total += parseFloat(place.estimatedCost || 0);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${place.name}</td>
                <td>${place.description || ''}</td>
                <td>₹${parseFloat(place.estimatedCost).toFixed(2)}</td>
                <td><button class="delete-place" data-id="${place.id}">Delete</button></td>
            `;
            placesTableBody.appendChild(tr);
        });
        // Add delete event listeners
        placesTableBody.querySelectorAll('.delete-place').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = btn.getAttribute('data-id');
                try {
                    const res = await fetch(`${API}/places/${id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': 'Bearer ' + getToken() }
                    });
                    if (!res.ok) throw new Error('Failed to delete place');
                    loadPlaces();
                } catch (err) {
                    placesMessage.textContent = err.message || 'Failed to delete place.';
                }
            });
        });
        placesTotal.textContent = `Total Estimated Cost: ₹${total.toFixed(2)}`;
    } catch (err) {
        placesMessage.textContent = err.message || 'Failed to load places.';
        placesTotal.textContent = '';
    }
}

async function loadCreditCardSummary() {
    if (!ccLimitEl || !ccSpentEl || !ccLeftEl) return;
    try {
        const res = await fetch(`${API}/expenses/credit-card-summary`, {
            headers: { 'Authorization': 'Bearer ' + getToken() }
        });
        if (!res.ok) throw new Error('Failed to load credit card summary');
        const data = await res.json();
        ccLimitEl.textContent = `₹${parseFloat(data.limit).toFixed(2)}`;
        ccSpentEl.textContent = `₹${parseFloat(data.spent).toFixed(2)}`;
        ccLeftEl.textContent = `₹${parseFloat(data.left).toFixed(2)}`;
    } catch (err) {
        ccLimitEl.textContent = '₹0.00';
        ccSpentEl.textContent = '₹0.00';
        ccLeftEl.textContent = '₹0.00';
    }
}

if (ccLimitForm) {
    ccLimitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        ccLimitMessage.textContent = '';
        try {
            const limit = ccLimitInput.value;
            const res = await fetch(`${API}/expenses/credit-card-limit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getToken()
                },
                body: JSON.stringify({ limit })
            });
            if (!res.ok) throw new Error('Failed to update limit');
            ccLimitMessage.textContent = 'Credit card limit updated!';
            loadCreditCardSummary();
            setTimeout(() => ccLimitMessage.textContent = '', 2000);
        } catch (err) {
            ccLimitMessage.textContent = err.message || 'Failed to update limit.';
        }
    });
}

if (getToken()) {
    showDashboard();
} else {
    showAuth();
} 

// Gorilla face eye animation for password fields
function setupGorillaEyes(passwordInputId, gorillaFaceId) {
    const pwd = document.getElementById(passwordInputId);
    const gorilla = document.getElementById(gorillaFaceId);
    if (pwd && gorilla) {
        pwd.addEventListener('focus', () => gorilla.classList.add('eyes-closed'));
        pwd.addEventListener('blur', () => gorilla.classList.remove('eyes-closed'));
    }
}
setupGorillaEyes('login-password', 'gorilla-face-login');
setupGorillaEyes('register-password', 'gorilla-face-register');

// Anime-style sparkle animation for dashboard
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24"><polygon points="12,2 15,10 23,12 15,14 12,22 9,14 1,12 9,10" fill="#fff7b2" stroke="#f7c873" stroke-width="1.5"/></svg>`;
    const dashboard = document.getElementById('dashboard-container');
    if (!dashboard) return;
    const x = Math.random() * (dashboard.offsetWidth - 24);
    const y = Math.random() * (dashboard.offsetHeight - 60) + 20;
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    dashboard.appendChild(sparkle);
    setTimeout(() => dashboard.removeChild(sparkle), 2000);
}
function startSparkles() {
    setInterval(createSparkle, 1200);
}
if (document.getElementById('dashboard-container')) {
    startSparkles();
} 