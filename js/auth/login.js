// Main initialization function
function createAuthUI() {
    const loginForm = document.querySelector('.login_form');
    
    // Auth Container
    const authContainer = createElement('div', { 
        className: 'auth-container',
        id: 'authContainer'
    });
    
    const authContent = createElement('div', { className: 'auth-content' });
    const title = createElement('h2', { textContent: 'Welcome Back' });
    
    // Create forms and dashboard
    const loginFormEl = createLoginForm();
    const signupFormEl = createSignupForm();
    signupFormEl.classList.add('hidden');
    const dashboard = createDashboard();
    dashboard.classList.add('hidden');

    // Assemble the structure
    authContent.append(title, loginFormEl, signupFormEl);
    authContainer.appendChild(authContent);
    loginForm.append(authContainer, dashboard);
    
    // Setup event listeners
    setupEventListeners();
}

// Helper function to create elements
function createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    return element;
}

// Create login form
function createLoginForm() {
    const form = createElement('form', { 
        className: 'auth-form',
        id: 'loginForm'
    });
    
    const emailGroup = createElement('div', { className: 'form-group' });
    const emailInput = createElement('input', {
        type: 'email',
        id: 'loginEmail',
        placeholder: 'Email',
        required: 'true'
    });
    
    const passwordGroup = createElement('div', { className: 'form-group' });
    const passwordInput = createElement('input', {
        type: 'password',
        id: 'loginPassword',
        placeholder: 'Password',
        required: 'true'
    });
    
    const submitButton = createElement('button', {
        type: 'submit',
        className: 'btn',
        textContent: 'Login'
    });
    
    const switchForm = createElement('div', { className: 'switch-form' });
    switchForm.innerHTML = `Don't have an account? <span data-form="signupForm">Sign up</span>`;
    
    emailGroup.appendChild(emailInput);
    passwordGroup.appendChild(passwordInput);
    form.append(emailGroup, passwordGroup, submitButton, switchForm);
    
    return form;
}

// Create signup form
function createSignupForm() {
    const form = createElement('form', {
        className: 'auth-form',
        id: 'signupForm'
    });
    
    const formGroups = [
        { id: 'signupEmail', type: 'email', placeholder: 'Email' },
        { id: 'signupPassword', type: 'password', placeholder: 'Password' },
        { id: 'confirmPassword', type: 'password', placeholder: 'Confirm Password' }
    ].map(input => {
        const group = createElement('div', { className: 'form-group' });
        const inputEl = createElement('input', {
            type: input.type,
            id: input.id,
            placeholder: input.placeholder,
            required: 'true'
        });
        group.appendChild(inputEl);
        return group;
    });
    
    const submitButton = createElement('button', {
        type: 'submit',
        className: 'btn',
        textContent: 'Sign Up'
    });
    
    const switchForm = createElement('div', { className: 'switch-form' });
    switchForm.innerHTML = `Already have an account? <span data-form="loginForm">Login</span>`;
    
    form.append(...formGroups, submitButton, switchForm);
    
    return form;
}

// Create dashboard
function createDashboard() {
    const dashboard = createElement('div', {
        className: 'dashboard',
        id: 'dashboard'
    });
    
    const header = createElement('div', { className: 'dashboard-header' });
    const title = createElement('h2', { innerHTML: 'Welcome, <span id="userEmail"></span>' });
    const logoutBtn = createElement('button', {
        id: 'logoutBtn',
        className: 'btn-logout',
        textContent: 'Logout'
    });
    
    const content = createElement('div', { className: 'dashboard-content' });
    const message = createElement('p', { textContent: "You're successfully logged in!" });
    
    header.append(title, logoutBtn);
    content.appendChild(message);
    dashboard.append(header, content);
    
    return dashboard;
}

// Setup event listeners
function setupEventListeners() {
    // Form switching
    document.querySelectorAll('.switch-form span').forEach(button => {
        button.addEventListener('click', () => {
            const formToShow = button.dataset.form;
            document.querySelectorAll('.auth-form').forEach(form => {
                form.classList.add('hidden');
            });
            document.getElementById(formToShow).classList.remove('hidden');
        });
    });

    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const button = e.target.querySelector('button');
        button.disabled = true;
        button.textContent = 'Logging in...';
        
        if (typeof auth !== 'undefined') {
            await auth.signInWithEmailAndPassword(email, password);
            e.target.reset();
        } else {
            // Fallback for testing without Firebase
            simulateAuth(email);
        }
    } catch (error) {
        showError(error.message, 'loginForm');
    } finally {
        const button = e.target.querySelector('button');
        button.disabled = false;
        button.textContent = 'Login';
    }
}

// Handle signup
async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showError("Passwords don't match!", 'signupForm');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long', 'signupForm');
        return;
    }

    try {
        const button = e.target.querySelector('button');
        button.disabled = true;
        button.textContent = 'Creating account...';
        
        if (typeof auth !== 'undefined') {
            await auth.createUserWithEmailAndPassword(email, password);
            e.target.reset();
        } else {
            // Fallback for testing without Firebase
            simulateAuth(email);
        }
    } catch (error) {
        showError(error.message, 'signupForm');
    } finally {
        const button = e.target.querySelector('button');
        button.disabled = false;
        button.textContent = 'Sign Up';
    }
}

// Handle logout
async function handleLogout() {
    try {
        if (typeof auth !== 'undefined') {
            await auth.signOut();
        } else {
            // Fallback for testing without Firebase
            const authContainer = document.getElementById('authContainer');
            const dashboard = document.getElementById('dashboard');
            authContainer.classList.remove('hidden');
            dashboard.classList.add('hidden');
            document.getElementById('userEmail').textContent = '';
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert(error.message);
    }
}

// Error handling
function showError(message, formId) {
    const form = document.getElementById(formId);
    const existingError = form.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = createElement('div', {
        className: 'error-message',
        textContent: message
    });
    
    form.insertBefore(errorDiv, form.firstChild);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Simulate authentication (for testing without Firebase)
function simulateAuth(email) {
    const authContainer = document.getElementById('authContainer');
    const dashboard = document.getElementById('dashboard');
    const userEmail = document.getElementById('userEmail');
    
    authContainer.classList.add('hidden');
    dashboard.classList.remove('hidden');
    userEmail.textContent = email;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    createAuthUI();
    
    // Setup Firebase auth state observer if available
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            const authContainer = document.getElementById('authContainer');
            const dashboard = document.getElementById('dashboard');
            const userEmail = document.getElementById('userEmail');

            if (user) {
                authContainer.classList.add('hidden');
                dashboard.classList.remove('hidden');
                userEmail.textContent = user.email;
            } else {
                authContainer.classList.remove('hidden');
                dashboard.classList.add('hidden');
                userEmail.textContent = '';
            }
        });
    }
});