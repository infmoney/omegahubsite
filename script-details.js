document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('id');

    if (scriptId) {
        loadScriptDetails(scriptId);
        loadComments(scriptId);
    } else {
        document.getElementById('script-details').innerHTML = '<h2>Script not found</h2>';
    }

    if (isLoggedIn()) {
        document.getElementById('comment-form').style.display = 'block';
    }
});

async function loadScriptDetails(scriptId) {
    try {
        const script = await apiRequest(`/posts/${scriptId}`);
        renderScriptDetails(script);
    } catch (error) {
        console.error('Failed to load script details:', error);
        document.getElementById('script-details').innerHTML = '<h2>Script not found</h2>';
    }
}

function renderScriptDetails(script) {
    const container = document.getElementById('script-details');
    const currentUser = getCurrentUser();
    const isOwner = currentUser && currentUser.username === script.author;
    const canEdit = isOwner || isAdmin();

    container.innerHTML = `
        <div class="script-header">
            ${script.isPinned ? '<span class="pin-icon">📌</span>' : ''}
            <h1>${escapeHtml(script.title)}</h1>
            <div class="script-meta">
                <span>By ${escapeHtml(script.author)}</span>
                <span>•</span>
                <span>${new Date(script.createdAt).toLocaleDateString()}</span>
                ${canEdit ? `<button onclick="editScript(${script.id})" class="btn btn-secondary" style="margin-left: 1rem;">Edit Post</button>` : ''}
            </div>
        </div>

        <div class="script-description">
            <p>${escapeHtml(script.description)}</p>
        </div>

        <div class="script-tags">
            ${script.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>

        <div class="script-actions" style="margin: 2rem 0;">
            <div class="vote-buttons">
                <button class="vote-btn" data-post-id="${script.id}" data-vote="up" onclick="vote(${script.id}, 'up')">
                    👍 ${script.upvotes || 0}
                </button>
                <button class="vote-btn" data-post-id="${script.id}" data-vote="down" onclick="vote(${script.id}, 'down')">
                    👎 ${script.downvotes || 0}
                </button>
            </div>
        </div>

        <div class="script-code">
            <h3>Code</h3>
            <pre><code class="language-${script.language}">${escapeHtml(script.code)}</code></pre>
        </div>
    `;

    // Initialize syntax highlighting
    if (window.Prism) {
        Prism.highlightAll();
    }
}

async function loadComments(scriptId) {
    try {
        const comments = await apiRequest(`/posts/${scriptId}/comments`);
        renderComments(comments);
    } catch (error) {
        console.error('Failed to load comments:', error);
        document.getElementById('comments-container').innerHTML = '<p>Failed to load comments</p>';
    }
}

function renderComments(comments) {
    const container = document.getElementById('comments-container');

    if (!comments || comments.length === 0) {
        container.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }

    container.innerHTML = comments.map(comment => `
        <div class="comment" style="background-color: var(--card-bg); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border: 1px solid var(--border-color);">
            <div class="comment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <strong>${escapeHtml(comment.author)}</strong>
                <span style="color: var(--secondary-color); font-size: 0.875rem;">
                    ${new Date(comment.createdAt).toLocaleDateString()}
                </span>
            </div>
            <div class="comment-content">
                ${escapeHtml(comment.content)}
            </div>
        </div>
    `).join('');
}

async function submitComment() {
    const textarea = document.getElementById('comment-text');
    const content = textarea.value.trim();

    if (!content) {
        showToast('Please enter a comment', 'error');
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('id');

    try {
        await apiRequest(`/posts/${scriptId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });

        showToast('Comment added successfully!', 'success');
        textarea.value = '';
        loadComments(scriptId);
    } catch (error) {
        showToast('Failed to add comment', 'error');
    }
}

function editScript(scriptId) {
    window.location.href = `new-post.html?edit=${scriptId}`;
}
async function loadScript() {
    const urlParams = new URLSearchParams(window.location.search);
    const scriptId = urlParams.get('id');

    if (!scriptId) {
        document.getElementById('script-container').innerHTML = '<p>Script not found</p>';
        return;
    }

    // Track view
    try {
        await apiRequest(`/posts/${scriptId}/view`, { method: 'POST' });
    } catch (error) {
        console.log('Failed to track view');
    }
}