document.addEventListener('DOMContentLoaded', function() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
        loadPostForEdit(editId);
    }

    document.getElementById('new-post-form').addEventListener('submit', handleSubmit);
});

async function loadPostForEdit(postId) {
    try {
        const post = await apiRequest(`/posts/${postId}`);

        // Check if user can edit this post
        const currentUser = getCurrentUser();
        if (post.author !== currentUser.username && !isAdmin()) {
            showToast('You do not have permission to edit this post', 'error');
            window.location.href = 'scripts.html';
            return;
        }

        // Fill form with existing data
        document.getElementById('title').value = post.title;
        document.getElementById('description').value = post.description;
        document.getElementById('tags').value = post.tags.join(', ');
        document.getElementById('code').value = post.code;
        document.getElementById('language').value = post.language;

        // Update form title
        document.querySelector('h2').textContent = 'Edit Script Post';
        document.querySelector('button[type="submit"]').textContent = 'Update Post';

    } catch (error) {
        showToast('Failed to load post for editing', 'error');
        window.location.href = 'scripts.html';
    }
}

async function handleSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const tags = document.getElementById('tags').value.trim();
    const code = document.getElementById('code').value.trim();
    const language = document.getElementById('language').value;

    if (!title || !description || !code) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const postData = {
        title,
        description,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        code,
        language
    };

    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    try {
        let response;
        if (editId) {
            response = await apiRequest(`/posts/${editId}`, {
                method: 'PUT',
                body: JSON.stringify(postData)
            });
        } else {
            const user = getCurrentUser();
            if (!user) {
                showToast('Please log in to create posts', 'error');
                return;
            }

            response = await apiRequest('/posts', {
                method: 'POST',
                body: JSON.stringify({
                    title,
                    description,
                    tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    code,
                    language,
                    author: user.username,
                    authorId: user.id
                })
            });
        }

        showToast(editId ? 'Post updated successfully!' : 'Post created successfully!', 'success');

        setTimeout(() => {
            window.location.href = `script.html?id=${response.id || editId}`;
        }, 1000);

    } catch (error) {
        showToast('Failed to save post', 'error');
    }
}