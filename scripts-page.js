let allPosts = [];

document.addEventListener('DOMContentLoaded', function() {
    loadAllScripts();
    setupSearch();
    checkLoginStatus();
});

function checkLoginStatus() {
    const newPostBtn = document.getElementById('new-post-btn');
    if (isLoggedIn() && newPostBtn) {
        newPostBtn.style.display = 'inline-block';
    }
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const posts = document.querySelectorAll('.post-card');

    posts.forEach(post => {
        const title = post.querySelector('.post-title').textContent.toLowerCase();
        const description = post.querySelector('.post-description').textContent.toLowerCase();
        const tags = Array.from(post.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

        const matches = title.includes(query) || 
                       description.includes(query) || 
                       tags.some(tag => tag.includes(query));

        post.style.display = matches ? 'block' : 'none';
    });
}

async function loadAllScripts() {
    const container = document.getElementById('scripts-container');
    const loading = document.getElementById('loading');

    if (loading) loading.style.display = 'block';

    try {
        const scripts = await apiRequest('/posts');
        renderPosts(scripts, container);
    } catch (error) {
        console.error('Failed to load scripts:', error);
        container.innerHTML = '<p>Failed to load scripts</p>';
    } finally {
        if (loading) loading.style.display = 'none';
    }
}

async function loadAllPosts() {
    const container = document.getElementById('all-posts');
    if (!container) return;

    try {
        allPosts = await apiRequest('/posts');
        renderPosts(allPosts, container);
    } catch (error) {
        console.error('Failed to load posts:', error);
        container.innerHTML = '<p>Failed to load posts</p>';
    }
}

function sortPosts(sortBy) {
    let sortedPosts = [...allPosts];

    switch(sortBy) {
        case 'newest':
            sortedPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sortedPosts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'most-voted':
            sortedPosts.sort((a, b) => ((b.upvotes || 0) - (b.downvotes || 0)) - ((a.upvotes || 0) - (a.downvotes || 0)));
            break;
        case 'most-viewed':
            sortedPosts.sort((a, b) => (b.views || 0) - (a.views || 0));
            break;
    }

    const container = document.getElementById('all-posts');
    renderPosts(sortedPosts, container);
}