let isAdminAuthenticated = false;

document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is already authenticated
    if (localStorage.getItem('adminAuth') === 'true') {
        isAdminAuthenticated = true;
        showAdminDashboard();
    }

    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', handleAdminLogin);
    }
});

async function handleAdminLogin(e) {
    e.preventDefault();

    const password = document.getElementById('admin-password').value;

    try {
        const response = await apiRequest('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ password })
        });

        if (response.success) {
            isAdminAuthenticated = true;
            localStorage.setItem('adminAuth', 'true');
            showAdminDashboard();
            showToast('Admin access granted!', 'success');
        }
    } catch (error) {
        showToast('Invalid admin password', 'error');
    }
}

function showAdminDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-container').style.display = 'block';
    loadDashboardStats();
    loadUsers();
}

function logoutAdmin() {
    isAdminAuthenticated = false;
    localStorage.removeItem('adminAuth');
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-container').style.display = 'none';
    showToast('Logged out of admin panel', 'success');
}

async function loadDashboardStats() {
    try {
        const users = await apiRequest('/admin/users');
        const posts = await apiRequest('/admin/posts');

        document.getElementById('total-users').textContent = users.length;
        document.getElementById('total-posts').textContent = posts.length;
        document.getElementById('banned-users').textContent = users.filter(u => u.isBanned).length;

    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    event.target.classList.add('active');

    // Load data for the selected tab
    switch(tabName) {
        case 'users':
            loadUsers();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'reports':
            loadReports();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

async function loadUsers() {
    if (!isAdminAuthenticated) return;

    const container = document.getElementById('users-list');

    try {
        const users = await apiRequest('/admin/users');
        renderUsers(users, container);
    } catch (error) {
        console.error('Failed to load users:', error);
        showToast('Failed to load users', 'error');
    }
}

function renderUsers(users, container) {
    container.innerHTML = `
        <div class="role-management-section" style="margin-bottom: 2rem; background: var(--card-bg); padding: 1.5rem; border-radius: 0.5rem; border: 1px solid var(--border-color);">
            <h3>🎭 Role & Badge Management</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: end;">
                <div>
                    <label>Username:</label>
                    <input type="text" id="role-username" placeholder="Enter username" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem; background: var(--bg-color); color: var(--text-color);">
                </div>
                <div>
                    <label>Role:</label>
                    <select id="role-select" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem; background: var(--bg-color); color: var(--text-color);">
                        <option value="user">👤 User</option>
                        <option value="tester">🧪 Tester</option>
                        <option value="moderator">🛡️ Moderator</option>
                        <option value="developer">💻 Developer</option>
                        <option value="vip">💎 VIP</option>
                        <option value="admin">⚡ Admin</option>
                    </select>
                </div>
                <div>
                    <label>Custom Badge:</label>
                    <select id="badge-select" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.25rem; background: var(--bg-color); color: var(--text-color);">
                        <option value="">No badge</option>
                        <option value="verified">✅ Verified</option>
                        <option value="supporter">💖 Supporter</option>
                        <option value="contributor">🤝 Contributor</option>
                        <option value="legend">🏆 Legend</option>
                    </select>
                </div>
                <button onclick="assignRoleAndBadge()" class="btn btn-primary">Assign</button>
            </div>
        </div>
        
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>Avatar</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Posts</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => {
                        let roleDisplay = '<span class="user-badge">👤 USER</span>';
                        if (user.isAdmin) {
                            if (user.id === 1) {
                                roleDisplay = '<span class="owner-badge">👑 OWNER</span>';
                            } else {
                                roleDisplay = '<span class="admin-badge">⚡ ADMIN</span>';
                            }
                        } else if (user.isDeveloper) {
                            roleDisplay = '<span class="dev-badge">💻 DEV</span>';
                        } else if (user.isTester) {
                            roleDisplay = '<span class="tester-badge">🧪 TESTER</span>';
                        } else if (user.isModerator) {
                            roleDisplay = '<span class="mod-badge">🛡️ MOD</span>';
                        } else if (user.isVip) {
                            roleDisplay = '<span class="vip-badge">💎 VIP</span>';
                        }
                        
                        if (user.customBadge) {
                            const customBadges = {
                                'verified': '<span class="verified-badge">✅ VERIFIED</span>',
                                'supporter': '<span class="supporter-badge">💖 SUPPORTER</span>',
                                'contributor': '<span class="contributor-badge">🤝 CONTRIBUTOR</span>',
                                'legend': '<span class="legend-badge">🏆 LEGEND</span>'
                            };
                            if (customBadges[user.customBadge]) {
                                roleDisplay += ' ' + customBadges[user.customBadge];
                            }
                        }
                        
                        return `
                        <tr class="${user.isBanned ? 'banned-user' : ''}">
                            <td>
                                <img src="${user.avatar}" alt="${user.username}" class="user-avatar-small">
                            </td>
                            <td>
                                <strong>${escapeHtml(user.username)}</strong>
                                ${user.isBanned ? '<span class="ban-badge">BANNED</span>' : ''}
                            </td>
                            <td>${escapeHtml(user.email)}</td>
                            <td>${roleDisplay}</td>
                            <td>${user.postCount || 0}</td>
                            <td>
                                <span class="status-badge ${user.isBanned ? 'banned' : 'active'}">
                                    ${user.isBanned ? 'Banned' : 'Active'}
                                </span>
                            </td>
                            <td>
                                <button onclick="toggleBanUser(${user.id}, ${user.isBanned})" 
                                        class="btn btn-${user.isBanned ? 'success' : 'error'} btn-small">
                                    ${user.isBanned ? 'Unban' : 'Ban'}
                                </button>
                                <button onclick="viewUserDetails(${user.id})" class="btn btn-secondary btn-small">
                                    View
                                </button>
                                <button onclick="editUserProfile(${user.id})" class="btn btn-warning btn-small">
                                    Edit
                                </button>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function loadPosts() {
    if (!isAdminAuthenticated) return;

    const container = document.getElementById('posts-list');

    try {
        const posts = await apiRequest('/admin/posts');
        renderAdminPosts(posts, container);
    } catch (error) {
        console.error('Failed to load posts:', error);
        showToast('Failed to load posts', 'error');
    }
}

function renderAdminPosts(posts, container) {
    container.innerHTML = `
        <div class="admin-table">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Language</th>
                        <th>Votes</th>
                        <th>Views</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr>
                            <td>
                                ${post.isPinned ? '📌 ' : ''}
                                <a href="script.html?id=${post.id}" target="_blank">${escapeHtml(post.title)}</a>
                            </td>
                            <td>${escapeHtml(post.author)}</td>
                            <td><span class="language-tag">${post.language}</span></td>
                            <td>👍 ${post.upvotes || 0} 👎 ${post.downvotes || 0}</td>
                            <td>👁️ ${post.views || 0}</td>
                            <td>
                                ${post.isPinned ? '<span class="pin-badge">PINNED</span>' : '<span class="normal-badge">NORMAL</span>'}
                            </td>
                            <td>
                                <button onclick="togglePinPost(${post.id}, ${post.isPinned})" 
                                        class="btn btn-warning btn-small">
                                    ${post.isPinned ? 'Unpin' : 'Pin'}
                                </button>
                                <button onclick="deletePost(${post.id})" 
                                        class="btn btn-error btn-small">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function filterUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const rows = document.querySelectorAll('#users-list tbody tr');

    rows.forEach(row => {
        const username = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        if (username.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function filterPosts() {
    const searchTerm = document.getElementById('post-search').value.toLowerCase();
    const filter = document.getElementById('post-filter').value;
    const rows = document.querySelectorAll('#posts-list tbody tr');

    rows.forEach(row => {
        const title = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const author = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const isPinned = row.querySelector('td:nth-child(1)').textContent.includes('📌');

        let showRow = title.includes(searchTerm) || author.includes(searchTerm);

        if (filter === 'pinned' && !isPinned) showRow = false;

        row.style.display = showRow ? '' : 'none';
    });
}

async function toggleBanUser(userId, currentBanStatus) {
    if (!confirm(`Are you sure you want to ${currentBanStatus ? 'unban' : 'ban'} this user?`)) {
        return;
    }

    try {
        await apiRequest(`/admin/users/${userId}/ban`, {
            method: 'PUT',
            body: JSON.stringify({ banned: !currentBanStatus })
        });

        showToast(currentBanStatus ? 'User unbanned successfully' : 'User banned successfully', 'success');
        loadUsers();
        loadDashboardStats();
    } catch (error) {
        showToast('Failed to update user status', 'error');
    }
}

async function togglePinPost(postId, currentPinStatus) {
    try {
        await apiRequest(`/admin/posts/${postId}/pin`, {
            method: 'PUT',
            body: JSON.stringify({ pinned: !currentPinStatus })
        });

        showToast(currentPinStatus ? 'Post unpinned successfully' : 'Post pinned successfully', 'success');
        loadPosts();
    } catch (error) {
        showToast('Failed to update post status', 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        return;
    }

    try {
        await apiRequest(`/posts/${postId}`, {
            method: 'DELETE'
        });

        showToast('Post deleted successfully', 'success');
        loadPosts();
        loadDashboardStats();
    } catch (error) {
        showToast('Failed to delete post', 'error');
    }
}

function viewUserDetails(userId) {
    // Open user profile in new tab
    window.open(`profile.html?user=${userId}`, '_blank');
}

function loadReports() {
    const container = document.getElementById('reports-list');
    container.innerHTML = `
        <div class="no-data">
            <h3>📋 No Reports</h3>
            <p>All clear! No reports to review at this time.</p>
        </div>
    `;
}

function loadSettings() {
    // Settings are already loaded in HTML
}

function saveSettings() {
    showToast('Settings saved successfully!', 'success');
}

async function changeUserRole(userId, newRole) {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
        // Reset the select to previous value
        location.reload();
        return;
    }

    try {
        await apiRequest(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role: newRole })
        });

        showToast(`User role updated to ${newRole} successfully!`, 'success');
        loadUsers();
        loadDashboardStats();
    } catch (error) {
        showToast('Failed to update user role', 'error');
        location.reload(); // Reset the UI
    }
}

function editUserProfile(userId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>✏️ Edit User Profile</h3>
            <div class="form-group">
                <label>Reputation:</label>
                <input type="number" id="admin-edit-reputation" placeholder="Reputation" min="0">
            </div>
            <div class="form-group">
                <label>Followers:</label>
                <input type="number" id="admin-edit-followers" placeholder="Followers" min="0">
            </div>
            <div class="form-group">
                <label>Special Title:</label>
                <input type="text" id="admin-edit-title" placeholder="Special title (optional)">
            </div>
            <div class="form-group">
                <label>Custom Badge:</label>
                <select id="admin-edit-badge">
                    <option value="">No custom badge</option>
                    <option value="verified">✅ Verified</option>
                    <option value="supporter">💖 Supporter</option>
                    <option value="contributor">🤝 Contributor</option>
                    <option value="legend">🏆 Legend</option>
                </select>
            </div>
            <div class="modal-actions">
                <button onclick="closeUserEditModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="saveUserProfile(${userId})" class="btn btn-primary">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeUserEditModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

async function saveUserProfile(userId) {
    const reputation = document.getElementById('admin-edit-reputation').value;
    const followers = document.getElementById('admin-edit-followers').value;
    const title = document.getElementById('admin-edit-title').value;
    const badge = document.getElementById('admin-edit-badge').value;

    try {
        await apiRequest(`/admin/users/${userId}/profile`, {
            method: 'PUT',
            body: JSON.stringify({
                reputation: parseInt(reputation) || 0,
                followers: parseInt(followers) || 0,
                customTitle: title,
                customBadge: badge
            })
        });

        showToast('User profile updated successfully!', 'success');
        closeUserEditModal();
        loadUsers();
    } catch (error) {
        showToast('Failed to update user profile', 'error');
    }
}

// Add new admin features
function addAdminFeatures() {
    const adminContainer = document.getElementById('admin-container');
    
    // Add bulk actions
    const bulkActionsHtml = `
        <div class="admin-section" style="margin-bottom: 2rem;">
            <h3>🔧 Bulk Actions</h3>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button onclick="bulkRoleChange()" class="btn btn-warning">📋 Bulk Role Change</button>
                <button onclick="sendGlobalAnnouncement()" class="btn btn-primary">📢 Global Announcement</button>
                <button onclick="generateUserReport()" class="btn btn-secondary">📊 Generate Report</button>
                <button onclick="backupUserData()" class="btn btn-success">💾 Backup Data</button>
            </div>
        </div>
    `;
    
    adminContainer.insertAdjacentHTML('afterbegin', bulkActionsHtml);
}

function bulkRoleChange() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>📋 Bulk Role Change</h3>
            <p>Select users and assign roles in bulk:</p>
            <div class="form-group">
                <label>New Role:</label>
                <select id="bulk-role-select">
                    <option value="user">👤 User</option>
                    <option value="tester">🧪 Tester</option>
                    <option value="moderator">🛡️ Moderator</option>
                    <option value="developer">💻 Developer</option>
                    <option value="vip">💎 VIP</option>
                </select>
            </div>
            <div class="form-group">
                <label>Target Users (comma-separated IDs):</label>
                <input type="text" id="bulk-user-ids" placeholder="1,2,3...">
            </div>
            <div class="modal-actions">
                <button onclick="closeBulkModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="executeBulkRoleChange()" class="btn btn-primary">Apply Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function sendGlobalAnnouncement() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>📢 Global Announcement</h3>
            <div class="form-group">
                <label>Announcement Title:</label>
                <input type="text" id="announcement-title" placeholder="Important Update">
            </div>
            <div class="form-group">
                <label>Message:</label>
                <textarea id="announcement-message" rows="4" placeholder="Your announcement message..."></textarea>
            </div>
            <div class="form-group">
                <label>Priority:</label>
                <select id="announcement-priority">
                    <option value="info">ℹ️ Info</option>
                    <option value="warning">⚠️ Warning</option>
                    <option value="critical">🚨 Critical</option>
                </select>
            </div>
            <div class="modal-actions">
                <button onclick="closeAnnouncementModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="sendAnnouncement()" class="btn btn-primary">Send</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeBulkModal() {
    document.querySelector('.modal').remove();
}

function closeAnnouncementModal() {
    document.querySelector('.modal').remove();
}

// Initialize admin features when dashboard loads
const originalShowAdminDashboard = showAdminDashboard;
showAdminDashboard = function() {
    originalShowAdminDashboard();
    addAdminFeatures();
};

async function assignRoleAndBadge() {
    const username = document.getElementById('role-username').value.trim();
    const role = document.getElementById('role-select').value;
    const badge = document.getElementById('badge-select').value;
    
    if (!username) {
        showToast('Please enter a username', 'error');
        return;
    }
    
    try {
        // Find user by username
        const users = await apiRequest('/admin/users');
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        
        if (!user) {
            showToast('User not found', 'error');
            return;
        }
        
        // Update role
        if (role !== 'user') {
            await apiRequest(`/admin/users/${user.id}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role })
            });
        }
        
        // Update badge
        await apiRequest(`/admin/users/${user.id}/profile`, {
            method: 'PUT',
            body: JSON.stringify({ customBadge: badge })
        });
        
        showToast(`Successfully assigned ${role} role${badge ? ' and ' + badge + ' badge' : ''} to ${username}!`, 'success');
        
        // Clear form
        document.getElementById('role-username').value = '';
        document.getElementById('role-select').value = 'user';
        document.getElementById('badge-select').value = '';
        
        // Reload users
        loadUsers();
        
    } catch (error) {
        showToast('Failed to assign role/badge', 'error');
        console.error('Role assignment error:', error);
    }
}

// Add CSS for admin tables
const adminStyles = `
.tab-btn {
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    padding: 0.75rem 1.5rem;
    margin-right: 0.5rem;
    border-radius: 0.5rem 0.5rem 0 0;
    cursor: pointer;
    color: var(--text-color);
    transition: all 0.3s ease;
}

.tab-btn.active {
    background-color: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.tab-btn:hover:not(.active) {
    background-color: var(--border-color);
}

.btn-error {
    background-color: var(--error-color);
    color: white;
}

.btn-error:hover {
    background-color: #dc2626;
}

.btn-success {
    background-color: var(--success-color);
    color: white;
}

.btn-success:hover {
    background-color: #059669;
}

.btn-warning {
    background-color: var(--warning-color);
    color: white;
}

.btn-warning:hover {
    background-color: #d97706;
}
`;

// Inject admin styles
const styleSheet = document.createElement('style');
styleSheet.textContent = adminStyles;
document.head.appendChild(styleSheet);