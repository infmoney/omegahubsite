
document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
});

function loadProfile() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    const currentUser = getCurrentUser();
    
    if (userId && userId !== (currentUser?.id?.toString())) {
        // Viewing someone else's profile
        loadUserProfile(userId);
    } else if (currentUser) {
        // Viewing own profile
        loadOwnProfile(currentUser);
    } else {
        // Not logged in and no user specified
        showLoginPrompt();
    }
}

function showLoginPrompt() {
    document.getElementById('profile-username').textContent = 'Guest';
    document.getElementById('profile-bio').textContent = 'Login to create your profile';
    document.getElementById('visitor-actions').style.display = 'block';
    document.getElementById('comments-section').style.display = 'none';
    
    // Show message to create account
    const actionsContainer = document.getElementById('visitor-actions');
    actionsContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <h3>Create Your Profile</h3>
            <p>Join Script Hub to share your scripts and connect with other developers!</p>
            <a href="signup.html" class="btn btn-primary" style="margin-right: 1rem;">Sign Up</a>
            <a href="login.html" class="btn btn-secondary">Login</a>
        </div>
    `;
}

function loadOwnProfile(user) {
    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('profile-bio').textContent = user.bio || 'Welcome to my profile! 🚀';
    document.getElementById('profile-avatar').src = user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`;
    document.getElementById('edit-profile-btn').style.display = 'block';
    
    // Update last seen
    updateLastSeen();
    document.getElementById('last-seen').textContent = '🕐 Last seen: ' + formatLastSeen(user.lastSeen);
    
    // Set banner if exists
    if (user.banner) {
        document.getElementById('profile-banner').style.background = user.banner;
    }
    
    // Update badges with enhanced role system
    const badgeContainer = document.getElementById('profile-badge');
    let badges = [];
    
    // Check for admin role first (highest priority)
    if (user.isAdmin === true) {
        if (user.id === 1) {
            badges.push('<span class="owner-badge">👑 OWNER</span>');
        } else {
            badges.push('<span class="admin-badge">⚡ ADMIN</span>');
        }
    }
    
    // Check for developer role
    if (user.isDeveloper === true) {
        badges.push('<span class="dev-badge">💻 DEV</span>');
    }
    
    // Check for other roles
    if (user.isTester === true) {
        badges.push('<span class="tester-badge">🧪 TESTER</span>');
    }
    
    if (user.isModerator === true) {
        badges.push('<span class="mod-badge">🛡️ MOD</span>');
    }
    
    if (user.isVip === true) {
        badges.push('<span class="vip-badge">💎 VIP</span>');
    }
    
    // Check for custom badges
    if (user.customBadge) {
        const customBadges = {
            'verified': '<span class="verified-badge">✅ VERIFIED</span>',
            'supporter': '<span class="supporter-badge">💖 SUPPORTER</span>',
            'contributor': '<span class="contributor-badge">🤝 CONTRIBUTOR</span>',
            'legend': '<span class="legend-badge">🏆 LEGEND</span>'
        };
        if (customBadges[user.customBadge]) {
            badges.push(customBadges[user.customBadge]);
        }
    }
    
    // If no special roles, show default user badge
    if (badges.length === 0) {
        badges.push('<span class="user-badge">👤 USER</span>');
    }
    
    badgeContainer.innerHTML = badges.join(' ');
    
    // Load actual user stats
    loadRealUserStats(user.id);
    loadUserPosts(user.id);
    loadUserComments(user.id);
    
    // Hide hardcoded achievement badges
    document.getElementById('achievement-badges').style.display = 'none';
}

async function loadUserProfile(userId) {
    // Show follow button for other users
    document.getElementById('follow-btn').style.display = 'block';
    
    let mockUser;
    try {
        // Try to get real user data from API
        mockUser = await apiRequest(`/users/${userId}`);
    } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to mock data
        mockUser = {
            id: userId,
            username: `User${userId}`,
            bio: 'Another awesome Script Hub member! 🎯',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=User${userId}`,
            isAdmin: userId === '1',
            isDeveloper: userId === '2' || userId === '3',
            isTester: false,
            isModerator: false,
            isVip: false,
            customBadge: null
        };
    }
    
    document.getElementById('profile-username').textContent = mockUser.username;
    document.getElementById('profile-bio').textContent = mockUser.bio;
    document.getElementById('profile-avatar').src = mockUser.avatar;
    
    // Update badges with complete role system
    const badgeContainer = document.getElementById('profile-badge');
    let badges = [];
    
    // Check for admin role first (highest priority)
    if (mockUser.isAdmin === true) {
        if (userId === '1') {
            badges.push('<span class="owner-badge">👑 OWNER</span>');
        } else {
            badges.push('<span class="admin-badge">⚡ ADMIN</span>');
        }
    }
    
    // Check for developer role
    if (mockUser.isDeveloper === true) {
        badges.push('<span class="dev-badge">💻 DEV</span>');
    }
    
    // Check for other roles
    if (mockUser.isTester === true) {
        badges.push('<span class="tester-badge">🧪 TESTER</span>');
    }
    
    if (mockUser.isModerator === true) {
        badges.push('<span class="mod-badge">🛡️ MOD</span>');
    }
    
    if (mockUser.isVip === true) {
        badges.push('<span class="vip-badge">💎 VIP</span>');
    }
    
    // Check for custom badges
    if (mockUser.customBadge) {
        const customBadges = {
            'verified': '<span class="verified-badge">✅ VERIFIED</span>',
            'supporter': '<span class="supporter-badge">💖 SUPPORTER</span>',
            'contributor': '<span class="contributor-badge">🤝 CONTRIBUTOR</span>',
            'legend': '<span class="legend-badge">🏆 LEGEND</span>'
        };
        if (customBadges[mockUser.customBadge]) {
            badges.push(customBadges[mockUser.customBadge]);
        }
    }
    
    // If no special roles, show default user badge
    if (badges.length === 0) {
        badges.push('<span class="user-badge">👤 USER</span>');
    }
    
    badgeContainer.innerHTML = badges.join(' ');
    
    // Load follow stats
    loadFollowStats(userId);
    
    // Load public posts only
    loadUserPosts(userId, true);
    loadRealUserStats(userId);
}

async function loadUserPosts(userId, publicOnly = false) {
    const container = document.getElementById('user-posts');
    
    try {
        const posts = await apiRequest(`/users/${userId}/posts`);
        renderUserPosts(posts, container);
    } catch (error) {
        console.error('Failed to load user posts:', error);
        // No mock data - show empty state
        container.innerHTML = '<p>No posts yet.</p>';
    }
}

function renderUserPosts(posts, container) {
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>No posts yet.</p>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-card">
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-description">${escapeHtml(post.description)}</p>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="post-actions">
                <div class="vote-buttons">
                    <span>👍 ${post.upvotes || 0}</span>
                    <span>👎 ${post.downvotes || 0}</span>
                </div>
                <div>
                    <a href="script.html?id=${post.id}" class="btn btn-primary">View</a>
                    ${isLoggedIn() && getCurrentUser().id === post.authorId ? `<a href="new-post.html?edit=${post.id}" class="btn btn-secondary">Edit</a>` : ''}
                </div>
            </div>
            <div style="margin-top: 1rem; color: var(--secondary-color); font-size: 0.875rem;">
                Created: ${new Date(post.createdAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

async function loadUserComments(userId) {
    const container = document.getElementById('user-comments');
    
    try {
        const comments = await apiRequest(`/users/${userId}/comments`);
        renderUserComments(comments, container);
    } catch (error) {
        console.error('Failed to load user comments:', error);
        // No mock data - show empty state
        container.innerHTML = '<p>No comments yet.</p>';
    }
}

function renderUserComments(comments, container) {
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p>No comments yet.</p>';
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="comment" style="background-color: var(--card-bg); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid var(--border-color);">
            <div class="comment-header" style="margin-bottom: 0.5rem;">
                <strong>On: <a href="script.html?id=${comment.postId}">${escapeHtml(comment.postTitle)}</a></strong>
                <span style="color: var(--secondary-color); font-size: 0.875rem; margin-left: 1rem;">
                    ${new Date(comment.createdAt).toLocaleDateString()}
                </span>
            </div>
            <div class="comment-content">
                ${escapeHtml(comment.content)}
            </div>
        </div>
    `).join('');
}

function showEditProfile() {
    const user = getCurrentUser();
    if (!user) return;
    
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-bio').value = user.bio || '';
    document.getElementById('edit-profile-modal').style.display = 'block';
}

function hideEditProfile() {
    document.getElementById('edit-profile-modal').style.display = 'none';
}

function editProfile() {
    showEditProfile();
}

function closeEditModal() {
    hideEditProfile();
}

function saveProfile() {
    handleEditProfile({ preventDefault: () => {} });
}

function followUser() {
    if (!isLoggedIn()) {
        showToast('Please log in to follow users', 'error');
        return;
    }
    
    const followBtn = document.getElementById('follow-btn');
    const isFollowing = followBtn.textContent.includes('Following');
    
    if (isFollowing) {
        followBtn.innerHTML = '➕ Follow';
        followBtn.className = 'btn btn-secondary';
        showToast('Unfollowed user', 'success');
        
        // Update follower count
        updateFollowerCount(-1);
    } else {
        followBtn.innerHTML = '✅ Following';
        followBtn.className = 'btn btn-primary';
        showToast('Now following user! 🎉', 'success');
        
        // Update follower count
        updateFollowerCount(1);
    }
}

function updateFollowerCount(change) {
    const followerElement = document.querySelector('.follow-count span');
    if (followerElement) {
        const currentText = followerElement.textContent;
        const currentCount = parseInt(currentText.match(/\d+/)[0]);
        const newCount = Math.max(0, currentCount + change);
        followerElement.textContent = `👥 ${newCount} Followers`;
    }
}

async function loadRealUserStats(userId) {
    try {
        // Get user posts
        const userPosts = await apiRequest(`/users/${userId}/posts`);
        const userComments = await apiRequest(`/users/${userId}/comments`);
        
        // Calculate reputation based on post upvotes/downvotes
        let reputation = 0;
        userPosts.forEach(post => {
            reputation += (post.upvotes || 0) * 5; // 5 points per upvote
            reputation -= (post.downvotes || 0) * 2; // -2 points per downvote
            reputation += (post.favorites || 0) * 3; // 3 points per favorite
        });
        
        // Ensure minimum reputation
        reputation = Math.max(reputation, 0);
        
        // Get user data for followers count
        const user = await apiRequest(`/users/${userId}`);
        
        document.getElementById('user-posts-count').textContent = userPosts.length;
        document.getElementById('user-comments-count').textContent = userComments.length;
        document.getElementById('user-reputation').textContent = reputation;
        document.getElementById('user-followers').textContent = user.followers || 0;
        
        // Check and award achievements
        await checkUserAchievements(userId, userPosts, userComments);
        
    } catch (error) {
        console.error('Failed to load user stats:', error);
        // Fallback to default values
        document.getElementById('user-posts-count').textContent = '0';
        document.getElementById('user-comments-count').textContent = '0';
        document.getElementById('user-reputation').textContent = '0';
        document.getElementById('user-followers').textContent = '0';
    }
}

async function checkUserAchievements(userId, userPosts, userComments) {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.id !== parseInt(userId)) return;
    
    let achievementsEarned = [];
    
    // Code Master Badge - 5 scripts posted
    if (userPosts.length >= 5 && !currentUser.achievements?.includes('code_master')) {
        achievementsEarned.push('code_master');
        currentUser.customBadge = 'code_master';
        showToast('🏆 Achievement Unlocked: Code Master! (5+ scripts posted)', 'success');
    }
    
    // Popular Creator Badge - mod+ commented on post
    const hasModComment = await checkForModeratorComments(userPosts);
    if (hasModComment && !currentUser.achievements?.includes('popular_creator')) {
        achievementsEarned.push('popular_creator');
        if (!currentUser.customBadge) currentUser.customBadge = 'popular_creator';
        showToast('🌟 Achievement Unlocked: Popular Creator! (Mod+ commented on your post)', 'success');
    }
    
    // Update user achievements
    if (achievementsEarned.length > 0) {
        if (!currentUser.achievements) currentUser.achievements = [];
        currentUser.achievements.push(...achievementsEarned);
        setCurrentUser(currentUser);
        
        // Update server
        try {
            await apiRequest(`/users/${userId}/achievements`, {
                method: 'PUT',
                body: JSON.stringify({ achievements: achievementsEarned })
            });
        } catch (error) {
            console.error('Failed to update achievements:', error);
        }
    }
}

async function checkForModeratorComments(userPosts) {
    try {
        for (const post of userPosts) {
            const comments = await apiRequest(`/posts/${post.id}/comments`);
            for (const comment of comments) {
                const commenter = await apiRequest(`/users/${comment.authorId}`);
                if (commenter.isModerator || commenter.isAdmin || commenter.isDeveloper) {
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Failed to check moderator comments:', error);
        return false;
    }
}

function loadFollowStats(userId) {
    // Mock follow stats (in production, this would come from your database)
    const followers = Math.floor(Math.random() * 100) + 5;
    const following = Math.floor(Math.random() * 50) + 2;
    
    // Update follow stats display
    const followStatsContainer = document.querySelector('.follow-stats');
    if (followStatsContainer) {
        followStatsContainer.innerHTML = `
            <div class="follow-count">
                <span>👥 ${followers} Followers</span>
            </div>
            <div class="follow-count">
                <span>➡️ ${following} Following</span>
            </div>
        `;
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
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

async function handleEditProfile(e) {
    e.preventDefault();
    
    const username = document.getElementById('edit-username').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const status = document.getElementById('edit-status').value;
    const theme = document.querySelector('.theme-option.active').dataset.theme;
    
    const socialLinks = {
        github: document.getElementById('edit-github').value.trim(),
        discord: document.getElementById('edit-discord').value.trim(),
        website: document.getElementById('edit-website').value.trim()
    };
    
    if (!username) {
        showToast('Username is required', 'error');
        return;
    }
    
    try {
        const user = getCurrentUser();
        const response = await apiRequest(`/users/${user.id}/profile`, {
            method: 'PUT',
            body: JSON.stringify({ username, bio, status, theme, socialLinks })
        });
        
        // Update local storage
        user.username = username;
        user.bio = bio;
        user.status = status;
        user.theme = theme;
        user.socialLinks = socialLinks;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        document.getElementById('profile-username').textContent = username;
        document.getElementById('profile-bio').textContent = bio || 'No bio set';
        updateStatusIndicator(status);
        updateSocialLinks(socialLinks);
        
        hideEditProfile();
        showToast('Profile updated successfully! 🎉', 'success');
        
    } catch (error) {
        showToast('Failed to update profile', 'error');
        console.error('Profile update error:', error);
    }
}

function updateStatusIndicator(status) {
    const statusElement = document.querySelector('.profile-status');
    statusElement.className = `profile-status status-${status}`;
}

function updateSocialLinks(socialLinks) {
    const container = document.getElementById('social-links');
    
    if (socialLinks.github || socialLinks.discord || socialLinks.website) {
        container.style.display = 'flex';
        container.innerHTML = '';
        
        if (socialLinks.github) {
            container.innerHTML += `<a href="${socialLinks.github}" target="_blank" class="social-link"><span>🐙</span> GitHub</a>`;
        }
        if (socialLinks.discord) {
            container.innerHTML += `<a href="#" class="social-link"><span>💬</span> ${socialLinks.discord}</a>`;
        }
        if (socialLinks.website) {
            container.innerHTML += `<a href="${socialLinks.website}" target="_blank" class="social-link"><span>🌐</span> Website</a>`;
        }
    }
}

function uploadAvatar() {
    // Simulate avatar upload with random dicebear styles
    const styles = ['adventurer', 'avataaars', 'big-ears', 'big-smile', 'croodles', 'fun-emoji'];
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const user = getCurrentUser();
    const newAvatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${user.username}`;
    
    document.getElementById('profile-avatar').src = newAvatar;
    user.avatar = newAvatar;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    showToast('Avatar updated! 📸', 'success');
}

function uploadBanner() {
    const banners = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    
    const randomBanner = banners[Math.floor(Math.random() * banners.length)];
    const user = getCurrentUser();
    
    document.getElementById('profile-banner').style.background = randomBanner;
    user.banner = randomBanner;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    showToast('Banner updated! 🖼️', 'success');
}

async function loadProfileComments(profileUserId) {
    const container = document.getElementById('profile-comments-list');
    const commentForm = document.getElementById('profile-comment-form');
    const currentUser = getCurrentUser();
    
    // Show comment form if user is logged in and not viewing own profile
    if (currentUser && currentUser.id !== parseInt(profileUserId)) {
        commentForm.style.display = 'block';
    }
    
    try {
        const comments = await apiRequest(`/users/${profileUserId}/profile-comments`);
        renderProfileComments(comments, container);
    } catch (error) {
        console.error('Failed to load profile comments:', error);
        container.innerHTML = '<p>No profile comments yet. Be the first to leave one!</p>';
    }
}

function renderProfileComments(comments, container) {
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p>No profile comments yet. Be the first to leave one!</p>';
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="profile-comment">
            <div class="comment-header">
                <div class="comment-author">
                    <img src="${comment.authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(comment.authorName)}`}" 
                         alt="${escapeHtml(comment.authorName)}">
                    <div>
                        <strong>${escapeHtml(comment.authorName)}</strong>
                        ${comment.authorBadge ? comment.authorBadge : ''}
                    </div>
                </div>
                <div class="comment-meta">
                    ${formatDate(comment.createdAt)}
                </div>
            </div>
            <div class="comment-content">
                ${escapeHtml(comment.content)}
            </div>
        </div>
    `).join('');
}

async function postProfileComment() {
    const content = document.getElementById('profile-comment-text').value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const profileUserId = urlParams.get('user');
    const currentUser = getCurrentUser();
    
    if (!content) {
        showToast('Please enter a comment', 'error');
        return;
    }
    
    if (!currentUser) {
        showToast('Please log in to comment', 'error');
        return;
    }
    
    try {
        await apiRequest(`/users/${profileUserId}/profile-comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        
        document.getElementById('profile-comment-text').value = '';
        showToast('Comment posted! 💬', 'success');
        loadProfileComments(profileUserId);
    } catch (error) {
        showToast('Failed to post comment', 'error');
        console.error('Comment post error:', error);
    }
}

function updateLastSeen() {
    const user = getCurrentUser();
    if (user) {
        user.lastSeen = new Date().toISOString();
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
}

function formatLastSeen(lastSeenDate) {
    if (!lastSeenDate) return 'Never';
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 5) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return lastSeen.toLocaleDateString();
}

function resetTheme() {
    document.getElementById('edit-primary-color').value = '#3b82f6';
    document.getElementById('edit-accent-color').value = '#6366f1';
    showToast('Theme colors reset', 'info');
}

function sendMessage() {
    showToast('Messaging feature coming soon! 💬', 'info');
}

function generateActivityChart() {
    const chart = document.getElementById('activity-chart');
    chart.innerHTML = '';
    
    // Generate 365 days of activity
    for (let i = 0; i < 365; i++) {
        const day = document.createElement('div');
        day.className = 'activity-day';
        
        // Random activity level
        const level = Math.floor(Math.random() * 5);
        if (level > 0) {
            day.classList.add(`level-${level}`);
        }
        
        chart.appendChild(day);
    }
    
    document.getElementById('profile-activity').style.display = 'block';
}

// Theme selector functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add theme selection event listeners
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('theme-option')) {
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
        }
    });
    
    // Generate activity chart for own profile
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    const currentUser = getCurrentUser();
    
    if (!userId || (currentUser && userId === currentUser.id.toString())) {
        setTimeout(generateActivityChart, 1000);
    }
});
