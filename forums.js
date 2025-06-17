
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    loadForums();
});

async function loadForums() {
    try {
        const forums = await apiRequest('/forums');
        displayForums(forums);
    } catch (error) {
        console.error('Error loading forums:', error);
        showToast('Error loading forums', 'error');
    }
}

function displayForums(forums) {
    const container = document.getElementById('forums-container');
    
    container.innerHTML = forums.map(forum => `
        <div class="forum-card ${forum.isPinned ? 'pinned' : ''}">
            <div class="forum-header">
                <h2>
                    ${forum.isPinned ? '📌 ' : ''}
                    ${forum.name}
                </h2>
                <p>${forum.description}</p>
            </div>
            
            <div class="forum-categories">
                ${forum.categories.map(category => `
                    <div class="category-card" onclick="viewCategory(${forum.id}, ${category.id})">
                        <h3>${category.name}</h3>
                        <p>${category.description}</p>
                        <div class="category-stats">
                            <span>📝 ${category.posts.length} Scripts</span>
                            <span>👍 ${category.posts.reduce((sum, post) => sum + (post.upvotes || 0), 0)} Upvotes</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

async function viewCategory(forumId, categoryId) {
    try {
        const posts = await apiRequest(`/forums/${forumId}/categories/${categoryId}/posts`);
        displayCategoryPosts(posts, forumId, categoryId);
    } catch (error) {
        console.error('Error loading category posts:', error);
        showToast('Error loading category posts', 'error');
    }
}

function displayCategoryPosts(posts, forumId, categoryId) {
    const container = document.getElementById('forums-container');
    
    container.innerHTML = `
        <div class="category-header">
            <button onclick="loadForums()" class="btn btn-secondary">← Back to Forums</button>
            <h2>📂 User Scripts</h2>
            <p>Community submitted scripts and tools</p>
        </div>
        
        <div class="omega-scripts-grid">
            ${posts.map(post => `
                <div class="omega-script-card ${post.isPinned ? 'pinned' : ''}">
                    <div class="script-header">
                        <h3>
                            ${post.isPinned ? '⭐ ' : ''}
                            ${post.title}
                        </h3>
                        <div class="script-meta">
                            <span class="author">👤 ${post.author}</span>
                            <span class="language">${post.language.toUpperCase()}</span>
                        </div>
                    </div>
                    
                    <p class="script-description">${post.description}</p>
                    
                    <div class="script-code">
                        <pre><code>${post.code}</code></pre>
                        <button onclick="copyToClipboard('${post.code.replace(/'/g, "\\'")}', this)" class="copy-btn">
                            📋 Copy Script
                        </button>
                    </div>
                    
                    <div class="script-tags">
                        ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                    </div>
                    
                    <div class="script-stats">
                        <span class="stat">👍 ${post.upvotes}</span>
                        <span class="stat">👀 ${post.views}</span>
                        <span class="stat">⭐ ${post.favorites}</span>
                        <button onclick="favoriteScript('${post.id}')" class="btn btn-sm">⭐ Favorite</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function copyToClipboard(code, button) {
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ Copied!';
        button.style.background = '#4CAF50';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
        
        showToast('Script copied to clipboard!', 'success');
    }).catch(err => {
        showToast('Failed to copy script', 'error');
    });
}

async function favoriteScript(scriptId) {
    try {
        showToast('Script added to favorites!', 'success');
    } catch (error) {
        showToast('Error favoriting script', 'error');
    }
}
