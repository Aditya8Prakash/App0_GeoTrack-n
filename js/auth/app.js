firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Error handling function
function showError(message, formId) {
    const form = document.getElementById(formId);
    const existingError = form.querySelector('.error-message');
    
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}
