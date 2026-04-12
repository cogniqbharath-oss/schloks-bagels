// FAQ Accordion Logic
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all other items
        document.querySelectorAll('.faq-item').forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('span').textContent = '+';
        });

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
            item.querySelector('span').textContent = '-';
        }
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 0';
        nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
    } else {
        nav.style.padding = '1.5rem 0';
        nav.style.boxShadow = 'none';
    }
});

// Reveal animations on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card, .menu-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
    observer.observe(el);
});

console.log("Schlok's Bagels & Lox interactive logic loaded.");

// Chatbot functionality
const chatValues = {
    trigger: document.getElementById('chat-trigger'),
    window: document.getElementById('chat-window'),
    close: document.getElementById('close-chat'),
    clear: document.getElementById('clear-chat'),
    body: document.getElementById('chat-body'),
    input: document.getElementById('chat-input'),
    send: document.getElementById('send-btn')
};

const initialResponse = '<div class="ai-msg"><div>Hi there! I\'m the Schlok\'s Bagels assistant. How can I help you today?</div></div>';

if (chatValues.trigger) {
    chatValues.trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        chatValues.window.classList.toggle('closed');
    });
}

if (chatValues.close) {
    chatValues.close.addEventListener('click', () => chatValues.window.classList.add('closed'));
}

if (chatValues.clear) {
    chatValues.clear.addEventListener('click', () => {
        if(confirm("Clear conversation?")) chatValues.body.innerHTML = initialResponse;
    });
}

if (chatValues.send) {
    chatValues.send.addEventListener('click', () => {
        const text = chatValues.input.value.trim();
        if (text) handleMessage(text);
    });
}

if (chatValues.input) {
    chatValues.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const text = chatValues.input.value.trim();
            if (text) handleMessage(text);
        }
    });
}

async function handleMessage(text) {
    appendMessage(text, 'user-msg');
    chatValues.input.value = '';
    const loadingId = 'loading-' + Date.now();
    appendMessage('Thinking...', 'ai-msg', loadingId);
    
    try {
        // Pointing to a dummy local/deployed worker URL. 
        // In reality, this should be the deployed Cloudflare Worker URL.
        const WORKER_URL = '/worker'; // For local testing or generic path if edge-hosted. Assume they deploy worker.js as the main script or API endpoint
        // Let's use the full relative path to local dev, but usually worker.js runs on a specific domain.
        // If they use `wrangler dev` it's usually http://localhost:8787. Using absolute URL placeholder.
        const response = await fetch('http://localhost:8787/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({message: text})
        });
        const data = await response.json();
        const msgEl = document.getElementById(loadingId);
        if (msgEl) msgEl.remove();
        appendMessage(data.response, 'ai-msg');
    } catch (err) {
        const msgEl = document.getElementById(loadingId);
        if (msgEl) msgEl.remove();
        appendMessage('Error: Cannot reach the AI Worker. Please ensure it is running on http://localhost:8787.', 'ai-msg');
    }
}

function appendMessage(text, type, id) {
    const div = document.createElement('div');
    div.className = type;
    if(id) div.id = id;
    div.innerHTML = `<div>${text}</div>`;
    chatValues.body.appendChild(div);
    chatValues.body.scrollTop = chatValues.body.scrollHeight;
}
