//test js


// Create and append elements to document
function createAuthUI() {
    const pageWrapper = createElement('div', { className: 'page-wrapper' });
    const container = createElement('div', { className: 'container' });
    
    // Auth Container
    const authContainer = createElement('div', { 
        className: 'auth-container',
        id: 'authContainer'
    });
    
    const authContent = createElement('div', { className: 'auth-content' });
    const title = createElement('h2', { textContent: 'Welcome Back' });
    
    // Login Form
    const loginForm = createLoginForm();
    
    // Signup Form
    const signupForm = createSignupForm();
    signupForm.classList.add('hidden');
    
    // Dashboard
    const dashboard = createDashboard();
    dashboard.classList.add('hidden');
    
    // Append elements
    authContent.append(title, loginForm, signupForm);
    authContainer.appendChild(authContent);
    container.append(authContainer, dashboard);
    pageWrapper.appendChild(container);
    document.body.appendChild(pageWrapper);
    
    // Add event listeners
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
    
    const emailGroup = createElement('div', { className: 'form-group' });
    const emailInput = createElement('input', {
        type: 'email',
        id: 'signupEmail',
        placeholder: 'Email',
        required: 'true'
    });
    
    const passwordGroup = createElement('div', { className: 'form-group' });
    const passwordInput = createElement('input', {
        type: 'password',
        id: 'signupPassword',
        placeholder: 'Password',
        required: 'true'
    });
    
    const confirmPasswordGroup = createElement('div', { className: 'form-group' });
    const confirmPasswordInput = createElement('input', {
        type: 'password',
        id: 'confirmPassword',
        placeholder: 'Confirm Password',
        required: 'true'
    });
    
    const submitButton = createElement('button', {
        type: 'submit',
        className: 'btn',
        textContent: 'Sign Up'
    });
    
    const switchForm = createElement('div', { className: 'switch-form' });
    switchForm.innerHTML = `Already have an account? <span data-form="loginForm">Login</span>`;
    
    emailGroup.appendChild(emailInput);
    passwordGroup.appendChild(passwordInput);
    confirmPasswordGroup.appendChild(confirmPasswordInput);
    form.append(emailGroup, passwordGroup, confirmPasswordGroup, submitButton, switchForm);
    
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
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const button = e.target.querySelector('button');
            button.disabled = true;
            button.textContent = 'Logging in...';
            
            await auth.signInWithEmailAndPassword(email, password);
            e.target.reset();
        } catch (error) {
            showError(error.message, 'loginForm');
        } finally {
            const button = e.target.querySelector('button');
            button.disabled = false;
            button.textContent = 'Login';
        }
    });

    // Signup form
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
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
            
            await auth.createUserWithEmailAndPassword(email, password);
            e.target.reset();
        } catch (error) {
            showError(error.message, 'signupForm');
        } finally {
            const button = e.target.querySelector('button');
            button.disabled = false;
            button.textContent = 'Sign Up';
        }
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        try {
            await auth.signOut();
        } catch (error) {
            alert(error.message);
        }
    });

    // Auth state observer
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

// Error handling function
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
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    createAuthUI();
});