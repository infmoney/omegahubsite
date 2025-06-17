
// Authentication handlers
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email,
                password
            })
        });
        
        setAuthToken(response.token);
        setCurrentUser(response.user);
        
        showToast('Login successful!', 'success');
        
        // Redirect to profile
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
        
    } catch (error) {
        showToast('Login failed. Please check your credentials.', 'error');
        console.error('Login error:', error);
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!username || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
        
        showToast('Account created successfully! Please log in.', 'success');
        
        // Redirect to login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        showToast('Signup failed. Please try again.', 'error');
        console.error('Signup error:', error);
    }
}

function logout() {
    removeAuthToken();
    removeCurrentUser();
    showToast('Logged out successfully', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Real authentication - no more mocking!
