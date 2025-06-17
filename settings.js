
document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadUserSettings();
    
    // Add event listeners
    document.getElementById('password-form').addEventListener('submit', handlePasswordChange);
});

function loadUserSettings() {
    const user = getCurrentUser();
    if (!user) return;
    
    document.getElementById('username-setting').value = user.username || '';
    document.getElementById('email-setting').value = user.email || '';
    document.getElementById('bio-setting').value = user.bio || '';
    
    // Load theme setting
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.getElementById('theme-setting').value = currentTheme;
    
    // Load other settings from localStorage
    document.getElementById('public-profile').checked = localStorage.getItem('publicProfile') === 'true';
    document.getElementById('email-notifications').checked = localStorage.getItem('emailNotifications') !== 'false';
    document.getElementById('show-activity').checked = localStorage.getItem('showActivity') !== 'false';
}

async function updateUsername() {
    const username = document.getElementById('username-setting').value.trim();
    
    if (!username) {
        showToast('Username cannot be empty', 'error');
        return;
    }
    
    try {
        await apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({ username })
        });
        
        // Update local storage
        const user = getCurrentUser();
        user.username = username;
        setCurrentUser(user);
        
        showToast('Username updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update username', 'error');
    }
}

async function updateEmail() {
    const email = document.getElementById('email-setting').value.trim();
    
    if (!email) {
        showToast('Email cannot be empty', 'error');
        return;
    }
    
    try {
        await apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({ email })
        });
        
        // Update local storage
        const user = getCurrentUser();
        user.email = email;
        setCurrentUser(user);
        
        showToast('Email updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update email', 'error');
    }
}

async function updateBio() {
    const bio = document.getElementById('bio-setting').value.trim();
    
    try {
        await apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify({ bio })
        });
        
        // Update local storage
        const user = getCurrentUser();
        user.bio = bio;
        setCurrentUser(user);
        
        showToast('Bio updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update bio', 'error');
    }
}

function changeTheme() {
    const theme = document.getElementById('theme-setting').value;
    
    if (theme === 'auto') {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const autoTheme = prefersDark ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', autoTheme);
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
    
    localStorage.setItem('theme', theme);
    updateThemeButton(theme);
    showToast('Theme updated!', 'success');
}

function savePrivacySettings() {
    const publicProfile = document.getElementById('public-profile').checked;
    const emailNotifications = document.getElementById('email-notifications').checked;
    const showActivity = document.getElementById('show-activity').checked;
    
    localStorage.setItem('publicProfile', publicProfile.toString());
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('showActivity', showActivity.toString());
    
    showToast('Privacy settings saved!', 'success');
}

function changePassword() {
    document.getElementById('password-modal').style.display = 'block';
}

function hidePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
    document.getElementById('password-form').reset();
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        await apiRequest('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        hidePasswordModal();
        showToast('Password updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update password', 'error');
    }
}

function enable2FA() {
    showToast('2FA feature coming soon!', 'info');
}

function downloadData() {
    // Create a simple data export
    const user = getCurrentUser();
    const data = {
        user: user,
        settings: {
            theme: localStorage.getItem('theme'),
            publicProfile: localStorage.getItem('publicProfile'),
            emailNotifications: localStorage.getItem('emailNotifications'),
            showActivity: localStorage.getItem('showActivity')
        },
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `script-hub-data-${user.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data downloaded!', 'success');
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        if (confirm('This will permanently delete all your posts, comments, and data. Type "DELETE" to confirm.')) {
            const confirmation = prompt('Type "DELETE" to confirm account deletion:');
            if (confirmation === 'DELETE') {
                // In a real app, this would call an API endpoint
                removeAuthToken();
                removeCurrentUser();
                showToast('Account deleted successfully', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showToast('Account deletion cancelled', 'info');
            }
        }
    }
}

// Auto-save privacy settings when checkboxes change
document.addEventListener('change', function(e) {
    if (e.target.type === 'checkbox' && e.target.closest('.settings-section')) {
        savePrivacySettings();
    }
});
