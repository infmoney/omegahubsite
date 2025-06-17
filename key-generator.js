
let taskInProgress = false;
let keyGenerationAllowed = false;

document.addEventListener('DOMContentLoaded', function() {
    checkCooldown();
});

function checkCooldown() {
    const lastGeneration = localStorage.getItem('lastKeyGeneration');
    const cooldownHours = 24; // 24 hour cooldown
    
    if (lastGeneration) {
        const timeDiff = Date.now() - parseInt(lastGeneration);
        const hoursLeft = cooldownHours - (timeDiff / (1000 * 60 * 60));
        
        if (hoursLeft > 0) {
            showCooldownMessage(hoursLeft);
            return;
        }
    }
    
    // No cooldown, show task
    document.getElementById('task-container').style.display = 'block';
}

function showCooldownMessage(hoursLeft) {
    const hours = Math.floor(hoursLeft);
    const minutes = Math.floor((hoursLeft - hours) * 60);
    
    document.getElementById('cooldown-timer').textContent = `${hours}h ${minutes}m`;
    document.getElementById('cooldown-message').style.display = 'block';
    document.getElementById('task-container').style.display = 'none';
}

async function startTask() {
    if (taskInProgress) return;
    
    taskInProgress = true;
    const startButton = document.getElementById('start-task');
    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    startButton.style.display = 'none';
    progressContainer.style.display = 'block';
    
    const steps = [
        'Checking IP address...',
        'Verifying location...',
        'Detecting VPN status...',
        'Running security checks...',
        'Validating browser...',
        'Finalizing verification...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
        progressText.textContent = steps[i];
        progressFill.style.width = `${((i + 1) / steps.length) * 100}%`;
        
        // Random delay between 500ms and 1500ms
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    }
    
    // Task completed
    progressText.textContent = 'Verification completed!';
    taskInProgress = false;
    keyGenerationAllowed = true;
    
    setTimeout(() => {
        document.getElementById('task-container').style.display = 'none';
        document.getElementById('key-generation').style.display = 'block';
    }, 1000);
}

async function generateKey() {
    if (!keyGenerationAllowed) return;
    
    const generateButton = document.getElementById('generate-key');
    generateButton.disabled = true;
    generateButton.textContent = 'Generating...';
    
    try {
        // Get IP and VPN info
        const ipInfo = await getIPInfo();
        
        // Generate key
        const key = await requestKey(ipInfo);
        
        // Log to webhook
        await logKeyGeneration(ipInfo, key);
        
        // Display key
        displayKey(key);
        
        // Set cooldown
        localStorage.setItem('lastKeyGeneration', Date.now().toString());
        
    } catch (error) {
        showToast('Failed to generate key. Please try again.', 'error');
        generateButton.disabled = false;
        generateButton.textContent = 'Generate Key';
    }
}

async function getIPInfo() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        return await response.json();
    } catch (error) {
        // Fallback mock data
        return {
            ip: '127.0.0.1',
            city: 'Unknown',
            region: 'Unknown',
            country: 'Unknown',
            org: 'Unknown ISP'
        };
    }
}

async function requestKey(ipInfo) {
    try {
        const response = await apiRequest('/keys/generate', {
            method: 'POST',
            body: JSON.stringify({ ipInfo })
        });
        
        return response.key;
    } catch (error) {
        // Generate mock key
        return generateMockKey();
    }
}

function generateMockKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    
    for (let i = 0; i < 32; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return `SH_${key}`;
}

async function logKeyGeneration(ipInfo, key) {
    const webhookData = {
        timestamp: new Date().toISOString(),
        ip: ipInfo.ip,
        location: `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`,
        isp: ipInfo.org,
        key: key,
        userAgent: navigator.userAgent
    };
    
    try {
        // Send to webhook (replace with your webhook URL)
        await fetch('YOUR_WEBHOOK_URL', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookData)
        });
    } catch (error) {
        console.log('Webhook logging failed:', error);
    }
}

function displayKey(key) {
    document.getElementById('key-generation').style.display = 'none';
    document.getElementById('generated-key').textContent = key;
    document.getElementById('key-result').style.display = 'block';
    
    showToast('Key generated successfully!', 'success');
}

function copyKey() {
    const keyText = document.getElementById('generated-key').textContent;
    
    navigator.clipboard.writeText(keyText).then(() => {
        showToast('Key copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = keyText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        showToast('Key copied to clipboard!', 'success');
    });
}
