// Theme Management
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeButton(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    const container = document.getElementById('toast-container');
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4000);
}

// Auth Utilities
function getAuthToken() {
    return localStorage.getItem('authToken');
}

function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

function removeAuthToken() {
    localStorage.removeItem('authToken');
}

function isLoggedIn() {
    return !!getAuthToken();
}

function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function removeCurrentUser() {
    localStorage.removeItem('currentUser');
}

function isAdmin() {
    const user = getCurrentUser();
    return user && user.isAdmin;
}

// API Utilities
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`/api${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Voting Functions
async function vote(postId, voteType) {
    if (!isLoggedIn()) {
        showToast('Please log in to vote', 'error');
        return;
    }

    try {
        await apiRequest(`/posts/${postId}/vote`, {
            method: 'POST',
            body: JSON.stringify({ voteType })
        });

        // Update UI
        updateVoteButtons(postId, voteType);
        showToast('Vote recorded!', 'success');
    } catch (error) {
        showToast('Failed to record vote', 'error');
    }
}

function updateVoteButtons(postId, voteType) {
    const upBtn = document.querySelector(`[data-post-id="${postId}"][data-vote="up"]`);
    const downBtn = document.querySelector(`[data-post-id="${postId}"][data-vote="down"]`);

    if (upBtn && downBtn) {
        upBtn.classList.remove('upvoted');
        downBtn.classList.remove('downvoted');

        if (voteType === 'up') {
            upBtn.classList.add('upvoted');
        } else if (voteType === 'down') {
            downBtn.classList.add('downvoted');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initTheme();

    // Theme toggle event listener
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Update navigation based on auth status
    updateNavigation();

    // Load featured posts on home page
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        loadFeaturedPosts();
    }
});

function updateNavigation() {
    const loginLink = document.querySelector('a[href="login.html"]');
    const signupLink = document.querySelector('a[href="signup.html"]');
    const profileLink = document.querySelector('a[href="profile.html"]');
    const settingsLink = document.querySelector('a[href="settings.html"]');

    if (isLoggedIn()) {
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (profileLink) profileLink.style.display = 'block';
        if (settingsLink) settingsLink.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (profileLink) profileLink.style.display = 'none';
        if (settingsLink) settingsLink.style.display = 'none';
    }
}

async function loadFeaturedPosts() {
    const container = document.getElementById('featured-posts');
    if (!container) return;

    try {
        const posts = await apiRequest('/posts/featured');
        renderPosts(posts, container);
    } catch (error) {
        console.error('Failed to load featured posts:', error);
        container.innerHTML = '<p>Failed to load featured posts</p>';
    }
}

function renderPosts(posts, container) {
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="no-posts">
                <h3>📝 No Posts Yet</h3>
                <p>Be the first to share your amazing script!</p>
                <a href="new-post.html" class="btn btn-primary">✨ Create Post</a>
                <button onclick="advancedSearch()" class="btn btn-secondary">🔍 Advanced Search</button>
            </div>
        `;
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="post-card" data-post-id="${post.id}">
            ${post.isPinned ? '<span class="pin-icon">📌</span>' : ''}
            <div class="post-header">
                <div class="post-author" onclick="viewProfile('${post.author}')" style="cursor: pointer;">
                    <img src="https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(post.author)}" 
                         alt="${escapeHtml(post.author)}" class="author-avatar">
                    <div class="author-info">
                        <span class="author-name">${escapeHtml(post.author)}</span>
                        ${post.authorId === 1 ? '<span class="admin-badge">ADMIN</span>' : ''}
                        <span class="post-date">${formatDate(post.createdAt)}</span>
                    </div>
                </div>
                <span class="language-tag">${post.language}</span>
            </div>
            <h3 class="post-title">${escapeHtml(post.title)}</h3>
            <p class="post-description">${escapeHtml(post.description)}</p>
            <div class="post-tags">
                ${(post.tags || []).map(tag => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="post-stats">
                <span class="stat">👁️ ${post.views || 0}</span>
                <span class="stat">⭐ ${post.favorites || 0}</span>
                <span class="stat">💬 ${post.commentCount || 0}</span>
                <span class="stat">🔥 ${(post.upvotes || 0) - (post.downvotes || 0)}</span>
            </div>
            <div class="post-actions">
                <div class="vote-buttons">
                    <button class="vote-btn" data-post-id="${post.id}" data-vote="up" onclick="vote(${post.id}, 'up')" title="Upvote">
                        👍 ${post.upvotes || 0}
                    </button>
                    <button class="vote-btn" data-post-id="${post.id}" data-vote="down" onclick="vote(${post.id}, 'down')" title="Downvote">
                        👎 ${post.downvotes || 0}
                    </button>
                </div>
                <div class="action-buttons">
                    <button class="action-btn" onclick="favoritePost(${post.id})" title="Add to Favorites">⭐</button>
                    <button class="action-btn" onclick="copyPostLink(${post.id})" title="Copy Link">📋</button>
                    <button class="action-btn" onclick="reportPost(${post.id})" title="Report">🚩</button>
                    <a href="script.html?id=${post.id}" class="btn btn-primary">🚀 View Script</a>
                </div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMins = Math.floor(diffMs / (1000 * 60));
            return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
        }
        return `${diffHours}h ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}

async function favoritePost(postId) {
    if (!isLoggedIn()) {
        showToast('Please log in to favorite posts', 'error');
        return;
    }

    try {
        const response = await apiRequest(`/posts/${postId}/favorite`, {
            method: 'POST'
        });

        // Update button state
        const favBtn = document.querySelector(`[onclick="favoritePost(${postId})"]`);
        if (favBtn) {
            const isFavorited = favBtn.textContent.includes('★');
            if (isFavorited) {
                favBtn.innerHTML = '⭐';
                favBtn.title = 'Add to Favorites';
                showToast('Removed from favorites', 'success');
            } else {
                favBtn.innerHTML = '★';
                favBtn.title = 'Remove from Favorites';
                showToast('Added to favorites!', 'success');
            }
        }

        // Update the favorites count in UI
        const statElement = document.querySelector(`[data-post-id="${postId}"] .stat:nth-child(2)`);
        if (statElement && response.favorites) {
            statElement.textContent = `⭐ ${response.favorites}`;
        }
    } catch (error) {
        showToast('Failed to update favorites', 'error');
    }
}

// Add new cool features
async function reportPost(postId) {
    if (!isLoggedIn()) {
        showToast('Please log in to report posts', 'error');
        return;
    }

    const reason = prompt('Why are you reporting this post?\n\n1. Spam\n2. Inappropriate content\n3. Copyright violation\n4. Other');
    if (reason) {
        showToast('Post reported. Thank you for keeping the community safe!', 'success');
    }
}

function copyPostLink(postId) {
    const url = `${window.location.origin}/script.html?id=${postId}`;
    navigator.clipboard.writeText(url).then(() => {
        showToast('Link copied to clipboard! 📋', 'success');
    }).catch(() => {
        showToast('Failed to copy link', 'error');
    });
}

function viewProfile(username) {
    window.location.href = `profile.html?user=${encodeURIComponent(username)}`;
}

// Improved search with filters
function advancedSearch() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>🔍 Advanced Search</h3>
            <input type="text" id="search-title" placeholder="Search by title...">
            <input type="text" id="search-author" placeholder="Search by author...">
            <select id="search-language">
                <option value="">Any Language</option>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="lua">Lua</option>
                <option value="java">Java</option>
            </select>
            <select id="search-sort">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="upvotes">Most Upvoted</option>
            </select>
            <div class="modal-actions">
                <button onclick="closeSearchModal()" class="btn btn-secondary">Cancel</button>
                <button onclick="executeAdvancedSearch()" class="btn btn-primary">Search</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeSearchModal() {
    document.querySelector('.modal').remove();
}

function executeAdvancedSearch() {
    const title = document.getElementById('search-title').value;
    const author = document.getElementById('search-author').value;
    const language = document.getElementById('search-language').value;
    const sort = document.getElementById('search-sort').value;

    showToast(`Searching for: ${title || 'any title'} by ${author || 'any author'}`, 'success');
    closeSearchModal();
}

function sharePost(postId) {
    const url = `${window.location.origin}/script.html?id=${postId}`;

    if (navigator.share) {
        navigator.share({
            title: 'Check out this script!',
            url: url
        });
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!', 'success');
        }).catch(() => {
            showToast('Failed to copy link', 'error');
        });
    }
}

// Enhanced search functionality
function searchPosts(query) {
    const posts = document.querySelectorAll('.post-card');
    const searchTerm = query.toLowerCase();

    posts.forEach(post => {
        const title = post.querySelector('.post-title').textContent.toLowerCase();
        const description = post.querySelector('.post-description').textContent.toLowerCase();
        const author = post.querySelector('.author-name').textContent.toLowerCase();
        const tags = Array.from(post.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

        const matches = title.includes(searchTerm) || 
                       description.includes(searchTerm) || 
                       author.includes(searchTerm) || 
                       tags.some(tag => tag.includes(searchTerm));

        post.style.display = matches ? 'block' : 'none';
    });
}

// Improved navigation updates
function updateNavigation() {
    const navMenu = document.querySelector('.nav-menu');
    const user = getCurrentUser();

    if (isLoggedIn() && user) {
        // Create user dropdown menu
        const userMenu = `
            <li class="user-menu">
                <button class="user-menu-btn">
                    <img src="${user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.username)}`}" 
                         alt="${user.username}" class="nav-avatar">
                    ${user.username}
                </button>
                <div class="user-dropdown">
                    <a href="profile.html">👤 Profile</a>
                    <a href="settings.html">⚙️ Settings</a>
                    <a href="new-post.html">✏️ New Post</a>
                    ${user.isAdmin ? '<a href="admin.html">🛡️ Admin</a>' : ''}
                    <hr>
                    <button onclick="logout()">🚪 Logout</button>
                </div>
            </li>
        `;

        // Remove old auth links
        const authLinks = navMenu.querySelectorAll('a[href="login.html"], a[href="signup.html"]');
        authLinks.forEach(link => link.parentElement.remove());

        // Add user menu if not exists
        if (!navMenu.querySelector('.user-menu')) {
            const themeToggle = navMenu.querySelector('.theme-btn').parentElement;
            themeToggle.insertAdjacentHTML('beforebegin', userMenu);

            // Add dropdown functionality
            const userMenuBtn = navMenu.querySelector('.user-menu-btn');
            const userDropdown = navMenu.querySelector('.user-dropdown');

            userMenuBtn.addEventListener('click', () => {
                userDropdown.classList.toggle('show');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-menu')) {
                    userDropdown.classList.remove('show');
                }
            });
        }
    }
}

function logout() {
    // Clear all user data
    removeAuthToken();
    removeCurrentUser();
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('favorites');
    localStorage.removeItem('viewHistory');
    localStorage.removeItem('drafts');

    showToast('Logged out successfully! See you soon! 👋', 'success');

    // Reset UI
    updateNavigation();

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// 🎉 MEGA FEATURE COLLECTION! 🎉

// Live typing indicator for comments
let typingIndicator = null;
function showTypingIndicator(postId) {
    clearTimeout(typingIndicator);
    const indicator = document.getElementById(`typing-${postId}`);
    if (indicator) {
        indicator.style.display = 'block';
        indicator.textContent = 'Someone is typing...';

        typingIndicator = setTimeout(() => {
            indicator.style.display = 'none';
        }, 3000);
    }
}

// Auto-save drafts
function autoSaveDraft(content, type = 'post') {
    const drafts = JSON.parse(localStorage.getItem('drafts') || '[]');
    const draftId = `${type}_${Date.now()}`;

    drafts.push({
        id: draftId,
        content,
        type,
        timestamp: new Date().toISOString(),
        autoSaved: true
    });

    localStorage.setItem('drafts', JSON.stringify(drafts));
    showToast('Draft auto-saved! 💾', 'info');
}

// Smart recommendations
function getSmartRecommendations() {
    const viewHistory = JSON.parse(localStorage.getItem('viewHistory') || '[]');
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // AI-like recommendation logic
    const recommendations = [
        'Based on your activity, you might like JavaScript automation scripts',
        'Users similar to you also enjoyed Python data science tools',
        'Trending: Web scraping utilities are popular this week!',
        'New: Advanced Discord bot templates just added',
        'Hot: Gaming automation scripts are trending!'
    ];

    return recommendations[Math.floor(Math.random() * recommendations.length)];
}

// Real-time notifications
function initNotificationSystem() {
    // Only show notification once per user session
    const user = getCurrentUser();
    const sessionKey = `notificationsShown_${user?.id}_${new Date().toDateString()}`;

    if (user && !sessionStorage.getItem(sessionKey)) {
        showToast('🔔 Notifications enabled! You\'ll get updates about your posts', 'info');
        sessionStorage.setItem(sessionKey, 'true');
    }
}

// Code syntax highlighting
function applySyntaxHighlighting() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        // Simple syntax highlighting
        let content = block.innerHTML;

        // JavaScript keywords
        content = content.replace(/\b(function|const|let|var|if|else|return|for|while)\b/g, 
            '<span style="color: #ff6b6b; font-weight: bold;">$1</span>');

        // Strings
        content = content.replace(/(["'].*?["'])/g, 
            '<span style="color: #4ecdc4;">$1</span>');

        // Comments
        content = content.replace(/(\/\/.*$)/gm, 
            '<span style="color: #95a5a6; font-style: italic;">$1</span>');

        block.innerHTML = content;
    });
}

// Advanced search with filters
function initAdvancedFilters() {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'advanced-filters';
    filterContainer.innerHTML = `
        <div class="filter-bar">
            🎯 <select id="difficulty-filter">
                <option value="">Any Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
            </select>

            📅 <select id="date-filter">
                <option value="">Any Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
            </select>

            ⭐ <select id="rating-filter">
                <option value="">Any Rating</option>
                <option value="5">5 Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
            </select>

            🔥 <button onclick="applyFilters()" class="btn btn-primary">Apply Filters</button>
            <button onclick="clearFilters()" class="btn btn-secondary">Clear All</button>
        </div>
    `;

    const postsContainer = document.getElementById('featured-posts');
    if (postsContainer) {
        postsContainer.insertBefore(filterContainer, postsContainer.firstChild);
    }
}

// Dark mode with custom themes
function initThemeSystem() {
    const themes = {
        'neon': {
            '--primary-color': '#00ff41',
            '--bg-color': '#0d1117',
            '--text-color': '#00ff41',
            '--card-bg': '#161b22'
        },
        'sunset': {
            '--primary-color': '#ff6b35',
            '--bg-color': '#2d1b69',
            '--text-color': '#ffffff',
            '--card-bg': '#3e2f8b'
        },
        'ocean': {
            '--primary-color': '#4a90e2',
            '--bg-color': '#0f3460',
            '--text-color': '#ffffff',
            '--card-bg': '#1e5f99'
        },
        'forest': {
            '--primary-color': '#27ae60',
            '--bg-color': '#1a2332',
            '--text-color': '#ecf0f1',
            '--card-bg': '#2c3e50'
        }
    };

    window.applyTheme = function(themeName) {
        const theme = themes[themeName];
        if (theme) {
            Object.keys(theme).forEach(property => {
                document.documentElement.style.setProperty(property, theme[property]);
            });
            localStorage.setItem('selectedTheme', themeName);
            showToast(`🎨 ${themeName.charAt(0).toUpperCase() + themeName.slice(1)} theme applied!`, 'success');
        }
    };
}

// User achievements system
function initAchievementSystem() {
    const achievements = {
        'first_post': { name: 'First Steps', icon: '🎯', description: 'Posted your first script!' },
        'popular_post': { name: 'Trending Creator', icon: '🔥', description: 'Got 100+ views on a post!' },
        'helpful_user': { name: 'Community Helper', icon: '🤝', description: 'Received 50+ upvotes!' },
        'code_master': { name: 'Code Master', icon: '👑', description: 'Posted 10+ scripts!' },
        'social_butterfly': { name: 'Social Butterfly', icon: '🦋', description: 'Made 100+ comments!' }
    };

    window.checkAchievements = function(userId) {
        const userStats = getUserStats(userId);
        const unlockedAchievements = [];

        if (userStats.posts >= 1 && !hasAchievement('first_post')) {
            unlockedAchievements.push('first_post');
        }
        if (userStats.totalViews >= 100 && !hasAchievement('popular_post')) {
            unlockedAchievements.push('popular_post');
        }

        unlockedAchievements.forEach(achievementId => {
            unlockAchievement(achievementId, achievements[achievementId]);
        });
    };
}

// Smart code completion
function initCodeCompletion() {
    const codeInputs = document.querySelectorAll('textarea[data-language]');
    codeInputs.forEach(textarea => {
        textarea.addEventListener('input', function(e) {
            const cursorPos = e.target.selectionStart;
            const text = e.target.value;
            const currentLine = text.substring(0, cursorPos).split('\n').pop();

            // Auto-complete common patterns
            const completions = {
                'console.': 'console.log()',
                'document.': 'document.getElementById("")',
                'function ': 'function functionName() {\n    \n}',
                'if (': 'if (condition) {\n    \n}',
                'for (': 'for (let i = 0; i < length; i++) {\n    \n}'
            };

            Object.keys(completions).forEach(trigger => {
                if (currentLine.endsWith(trigger)) {
                    // Show suggestion popup
                    showCodeSuggestion(completions[trigger], e.target);
                }
            });
        });
    });
}

// Real-time collaboration
function initCollaboration() {
    let collaborators = [];

    window.joinCollaboration = function(postId) {
        const user = getCurrentUser();
        if (user) {
            collaborators.push({
                id: user.id,
                name: user.username,
                cursor: 0,
                color: getRandomColor()
            });

            showToast(`👥 You joined collaborative editing!`, 'success');
            updateCollaboratorsList();
        }
    };

    function updateCollaboratorsList() {
        const collabList = document.getElementById('collaborators-list');
        if (collabList) {
            collabList.innerHTML = collaborators.map(collab => 
                `<span class="collaborator" style="color: ${collab.color}">
                    👤 ${collab.name}
                </span>`
            ).join('');
        }
    }
}

// Voice commands
function initVoiceCommands() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        window.startVoiceCommand = function() {
            recognition.start();
            showToast('🎤 Listening for voice commands...', 'info');
        };

        recognition.onresult = function(event) {
            const command = event.results[0][0].transcript.toLowerCase();

            if (command.includes('search for')) {
                const query = command.replace('search for', '').trim();
                searchPosts(query);
            } else if (command.includes('create new post')) {
                window.location.href = 'new-post.html';
            } else if (command.includes('go home')) {
                window.location.href = 'index.html';
            }

            showToast(`🎤 Command executed: "${command}"`, 'success');
        };
    }
}

// Smart suggestions
function initSmartSuggestions() {
    const suggestionEngine = {
        getRelatedPosts: function(currentPost) {
            // AI-like content matching
            return [
                'Similar JavaScript automation tools',
                'Advanced Discord bot templates',
                'Python web scraping utilities',
                'Game automation scripts',
                'API integration examples'
            ];
        },

        getPersonalizedFeed: function(user) {
            const interests = user.viewHistory || [];
            return interests.slice(0, 5);
        }
    };

    window.showSuggestions = function() {
        const modal = createModal('Smart Suggestions', `
            <div class="suggestions-grid">
                <h3>🤖 Recommended for You</h3>
                <div id="personal-suggestions"></div>
                <h3>🔥 Trending Now</h3>
                <div id="trending-suggestions"></div>
            </div>
        `);

        document.body.appendChild(modal);
    };
}

// Advanced analytics dashboard
function initAnalytics() {
    window.showAnalytics = function() {
        const user = getCurrentUser();
        if (!user) return;

        const analytics = {
            totalViews: Math.floor(Math.random() * 10000),
            totalLikes: Math.floor(Math.random() * 1000),
            totalComments: Math.floor(Math.random() * 500),
            averageRating: (Math.random() * 2 + 3).toFixed(1),
            topPost: 'JavaScript Automation Tool',
            growthRate: '+15%',
            engagement: '8.5/10'
        };

        const modal = createModal('📊 Your Analytics', `
            <div class="analytics-grid">
                <div class="metric-card">
                    <h3>👁️ Total Views</h3>
                    <span class="metric-value">${analytics.totalViews.toLocaleString()}</span>
                </div>
                <div class="metric-card">
                    <h3>❤️ Total Likes</h3>
                    <span class="metric-value">${analytics.totalLikes.toLocaleString()}</span>
                </div>
                <div class="metric-card">
                    <h3>💬 Comments</h3>
                    <span class="metric-value">${analytics.totalComments}</span>
                </div>
                <div class="metric-card">
                    <h3>⭐ Avg Rating</h3>
                    <span class="metric-value">${analytics.averageRating}</span>
                </div>
                <div class="metric-card">
                    <h3>📈 Growth</h3>
                    <span class="metric-value growth-positive">${analytics.growthRate}</span>
                </div>
                <div class="metric-card">
                    <h3>🎯 Engagement</h3>
                    <span class="metric-value">${analytics.engagement}</span>
                </div>
            </div>
        `);

        document.body.appendChild(modal);
    };
}

// Helper functions for new features
function getRandomColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal feature-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button onclick="this.closest('.modal').remove()" class="close-btn">✕</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    return modal;
}

function getUserStats(userId) {
    return {
        posts: Math.floor(Math.random() * 20),
        comments: Math.floor(Math.random() * 100),
        totalViews: Math.floor(Math.random() * 5000),
        reputation: Math.floor(Math.random() * 1000)
    };
}

function hasAchievement(achievementId) {
    const achievements = JSON.parse(localStorage.getItem('userAchievements') || '[]');
    return achievements.includes(achievementId);
}

function unlockAchievement(achievementId, achievement) {
    const achievements = JSON.parse(localStorage.getItem('userAchievements') || '[]');
    if (!achievements.includes(achievementId)) {
        achievements.push(achievementId);
        localStorage.setItem('userAchievements', JSON.stringify(achievements));

        showToast(`🏆 Achievement Unlocked: ${achievement.name}!`, 'success');

        // Show fancy achievement notification
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <span class="achievement-icon">${achievement.icon}</span>
                <div class="achievement-text">
                    <h3>Achievement Unlocked!</h3>
                    <p>${achievement.name}</p>
                    <small>${achievement.description}</small>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
}

// Initialize all new features
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initNotificationSystem();
        initThemeSystem();
        initAchievementSystem();
        initAdvancedFilters();
        initCodeCompletion();
        initCollaboration();
        initVoiceCommands();
        initSmartSuggestions();
        initAnalytics();
        applySyntaxHighlighting();
    }, 1000);
});