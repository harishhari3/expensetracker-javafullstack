const API_BASE = '/api';

// Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const expenseForm = document.getElementById('expense-form');
const expensesTableBody = document.querySelector('#expenses-table tbody');
const authMessage = document.getElementById('auth-message');
const dashboardMessage = document.getElementById('dashboard-message');
const logoutBtn = document.getElementById('logout-btn');
const placeForm = document.getElementById('place-form');
const placesTableBody = document.querySelector('#places-table tbody');
const placesMessage = document.getElementById('places-message');

// JWT Token
function setToken(token) {
    localStorage.setItem('jwt', token);
}
function getToken() {
    return localStorage.getItem('jwt');
}
function clearToken() {
    localStorage.removeItem('jwt');
}

// Show/Hide sections
function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    loadExpenses();
    loadPlaces();
}
function showAuth() {
    authSection.style.display = 'block';
    dashboardSection.style.display = 'none';
}

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = '';
    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usernameOrEmail, password })
        });
        if (!res.ok) throw new Error('Login failed');
        const data = await res.json();
        setToken(data.token);
        showDashboard();
    } catch (err) {
        authMessage.textContent = 'Login failed. Please check your credentials.';
    }
});

// Handle Register
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMessage.textContent = '';
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg);
        }
        authMessage.textContent = 'Registration successful! Please login.';
    } catch (err) {
        authMessage.textContent = err.message || 'Registration failed.';
    }
});

// Handle Logout
logoutBtn.addEventListener('click', () => {
    clearToken();
    showAuth();
});

// Handle Add Expense
expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    dashboardMessage.textContent = '';
    const category = document.getElementById('expense-category').value;
    const amount = document.getElementById('expense-amount').value;
    const date = document.getElementById('expense-date').value;
    const type = document.getElementById('expense-type').value;
    const description = document.getElementById('expense-description').value;
    try {
        const res = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getToken()
            },
            body: JSON.stringify({
                category: { name: category },
                amount: parseFloat(amount),
                date,
                type,
                description
            })
        });
        if (!res.ok) throw new Error('Failed to add expense');
        dashboardMessage.textContent = 'Expense added!';
        expenseForm.reset();
        loadExpenses();
    } catch (err) {
        dashboardMessage.textContent = err.message || 'Failed to add expense.';
    }
});

// Handle Add Place
if (placeForm) {
    placeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        placesMessage.textContent = '';
        const name = document.getElementById('place-name').value;
        const description = document.getElementById('place-description').value;
        const estimatedCost = document.getElementById('place-estimated-cost').value;
        try {
            const res = await fetch(`${API_BASE}/places`, {
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

// Load Expenses
async function loadExpenses() {
    expensesTableBody.innerHTML = '';
    dashboardMessage.textContent = '';
    try {
        const res = await fetch(`${API_BASE}/expenses`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        if (!res.ok) throw new Error('Failed to load expenses');
        const data = await res.json();
        data.content?.forEach(exp => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${exp.category?.name || ''}</td>
                <td>${exp.amount}</td>
                <td>${exp.date}</td>
                <td>${exp.type}</td>
                <td>${exp.description || ''}</td>
            `;
            expensesTableBody.appendChild(tr);
        });
    } catch (err) {
        dashboardMessage.textContent = err.message || 'Failed to load expenses.';
    }
}

// Load Places
async function loadPlaces() {
    if (!placesTableBody) return;
    placesTableBody.innerHTML = '';
    placesMessage.textContent = '';
    try {
        const res = await fetch(`${API_BASE}/places`, {
            headers: {
                'Authorization': 'Bearer ' + getToken()
            }
        });
        if (!res.ok) throw new Error('Failed to load places');
        const data = await res.json();
        data.forEach(place => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${place.name}</td>
                <td>${place.description || ''}</td>
                <td>${place.estimatedCost}</td>
            `;
            placesTableBody.appendChild(tr);
        });
    } catch (err) {
        placesMessage.textContent = err.message || 'Failed to load places.';
    }
}

// On load, check if logged in
if (getToken()) {
    showDashboard();
} else {
    showAuth();
} 