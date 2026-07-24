/* ==========================================================================
   WriteGen AI - Frontend Logic (Vanilla JS)
   ========================================================================== */

console.log("JS file is loaded");
document.addEventListener('DOMContentLoaded', () => {
    // API Configuration: Since frontend and backend are hosted together on Render, use relative paths ('').
    const API_BASE_URL = '';

    // DOM Elements - Navigation & Sidebar
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabForms = document.querySelectorAll('.tab-form');
    const themeToggle = document.getElementById('themeToggle');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');

    // DOM Elements - Forms & Inputs
    const sumText = document.getElementById('sum-text');
    const sumCount = document.getElementById('sum-count');
    const rewText = document.getElementById('rew-text');
    const rewCount = document.getElementById('rew-count');

    // DOM Elements - Output panel
    const outputText = document.getElementById('outputText');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const btnCopy = document.getElementById('btnCopy');
    const btnDownload = document.getElementById('btnDownload');
    const btnClear = document.getElementById('btnClear');
    const genStatus = document.getElementById('genStatus');
    const wordCount = document.getElementById('wordCount');

    // DOM Elements - History
    const historyList = document.getElementById('historyList');
    const historyCount = document.getElementById('historyCount');

    // DOM Elements - Notification
    const toastContainer = document.getElementById('notificationContainer');

    // DOM Elements - Auth
    const authModalOverlay = document.getElementById('authModalOverlay');
    const closeAuthModal = document.getElementById('closeAuthModal');
    const authForm = document.getElementById('authForm');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const authCtaContainer = document.getElementById('authCtaContainer');
    const authToggleLink = document.getElementById('authToggleLink');
    const nameGroup = document.getElementById('nameGroup');
    const authModalTitle = document.getElementById('authModalTitle');

    // App State Variables
    let activeTab = 'generate';
    let isGenerating = false;
    let currentStreamReader = null;
    let isLoginMode = true;

    // Initialize App
    initTheme();
    loadHistory();
    setupEventListeners();

    /* ==========================================================================
       App Initialization & Theme Setup
       ========================================================================== */
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
        showToast(`Switched to ${newTheme} mode`, 'info');
    }

    function updateThemeButton(theme) {
        if (theme === 'dark') {
            themeToggle.querySelector('i').className = 'fa-solid fa-sun';
            themeToggle.querySelector('span').textContent = 'Light Mode';
        } else {
            themeToggle.querySelector('i').className = 'fa-solid fa-moon';
            themeToggle.querySelector('span').textContent = 'Dark Mode';
        }
    }

    /* ==========================================================================
       Event Listeners Setup
       ========================================================================== */
    function setupEventListeners() {
        // Tab switching
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (isGenerating) {
                    showToast('Cannot switch tabs while generating response.', 'error');
                    return;
                }
                const tabId = btn.getAttribute('data-tab');
                switchTab(tabId);
            });
        });

        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);

        // Mobile sidebar toggle
        menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
        closeSidebar.addEventListener('click', () => sidebar.classList.remove('open'));

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 900) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            }
        });

        // Character count listeners
        if (sumText) {
            sumText.addEventListener('input', () => {
                sumCount.textContent = sumText.value.length;
            });
        }
        if (rewText) {
            rewText.addEventListener('input', () => {
                rewCount.textContent = rewText.value.length;
            });
        }

        // Output Panel Actions
        btnCopy.addEventListener('click', copyToClipboard);
        btnDownload.addEventListener('click', downloadAsTXT);
        btnClear.addEventListener('click', clearOutput);

        // Submit listeners for all 4 forms
        document.getElementById('form-generate').addEventListener('submit', (e) => handleFormSubmit(e, 'generate'));
        document.getElementById('form-summarize').addEventListener('submit', (e) => handleFormSubmit(e, 'summarize'));
        document.getElementById('form-email').addEventListener('submit', (e) => handleFormSubmit(e, 'email'));
        document.getElementById('form-rewrite').addEventListener('submit', (e) => handleFormSubmit(e, 'rewrite'));

        // Auth Listeners
        if (showLoginBtn) showLoginBtn.addEventListener('click', () => authModalOverlay.style.display = 'flex');
        if (closeAuthModal) closeAuthModal.addEventListener('click', () => authModalOverlay.style.display = 'none');
        if (authForm) authForm.addEventListener('submit', handleAuthSubmit);
        if (authSubmitBtn) authSubmitBtn.addEventListener('click', () => console.log('Register button is clicked'));
        if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
        
        if (authToggleLink) {
            authToggleLink.addEventListener('click', (e) => {
                e.preventDefault();
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    authModalTitle.textContent = 'Log In';
                    nameGroup.style.display = 'none';
                    document.getElementById('authName').removeAttribute('required');
                    authSubmitBtn.querySelector('span').textContent = 'Log In';
                    document.getElementById('authToggleText').textContent = "Don't have an account? ";
                    authToggleLink.textContent = "Register here";
                } else {
                    authModalTitle.textContent = 'Register';
                    nameGroup.style.display = 'flex';
                    document.getElementById('authName').setAttribute('required', 'true');
                    authSubmitBtn.querySelector('span').textContent = 'Register';
                    document.getElementById('authToggleText').textContent = "Already have an account? ";
                    authToggleLink.textContent = "Log In here";
                }
            });
        }
    }

    /* ==========================================================================
       Tab Switching Logic
       ========================================================================== */
    function switchTab(tabId) {
        activeTab = tabId;
        
        // Update active tab buttons
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Update visible forms
        tabForms.forEach(form => {
            if (form.id === `form-${tabId}`) {
                form.classList.add('active');
            } else {
                form.classList.remove('active');
            }
        });
    }

    /* ==========================================================================
       Form Submissions & Streaming AI Responses
       ========================================================================== */
    async function handleFormSubmit(event, type) {
        event.preventDefault();
        if (isGenerating) return;

        isGenerating = true;
        setGenerationState(true);
        clearOutputUI();

        let apiEndpoint = '';
        let payload = {};

        // Prepare request body based on form type
        if (type === 'generate') {
            apiEndpoint = '/api/generate/content';
            const keywordsRaw = document.getElementById('gen-keywords').value;
            const keywords = keywordsRaw ? keywordsRaw.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
            payload = {
                prompt: document.getElementById('gen-prompt').value,
                tone: document.getElementById('gen-tone').value,
                length: document.getElementById('gen-length').value,
                keywords: keywords
            };
        } else if (type === 'summarize') {
            apiEndpoint = '/api/generate/summarize';
            payload = {
                text: sumText.value,
                style: document.getElementById('sum-style').value
            };
        } else if (type === 'email') {
            apiEndpoint = '/api/generate/email';
            const pointsRaw = document.getElementById('email-points').value;
            const points = pointsRaw ? pointsRaw.split('\n').map(p => p.trim()).filter(p => p.length > 0) : [];
            payload = {
                sender: document.getElementById('email-sender').value,
                recipient: document.getElementById('email-recipient').value,
                purpose: document.getElementById('email-purpose').value,
                key_points: points,
                tone: document.getElementById('email-tone').value
            };
        } else if (type === 'rewrite') {
            apiEndpoint = '/api/generate/rewrite';
            payload = {
                text: rewText.value,
                style: document.getElementById('rew-style').value
            };
        }

        try {
            // Show loading overlays
            loadingOverlay.style.display = 'flex';
            
            const headers = { 'Content-Type': 'application/json' };
            const token = localStorage.getItem('token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}${apiEndpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
                throw new Error(errorData.detail || `Server returned ${response.status}`);
            }

            // Stream response setup
            const reader = response.body.getReader();
            currentStreamReader = reader;
            const decoder = new TextDecoder('utf-8');
            
            // Hide spinner overlay as streaming starts
            loadingOverlay.style.display = 'none';
            outputText.classList.add('typing');
            
            let done = false;
            let resultText = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: !done });
                    resultText += chunk;
                    outputText.textContent = resultText;
                    // Auto scroll to bottom
                    outputText.scrollTop = outputText.scrollHeight;
                    // Live counts update
                    updateTextCounters(resultText);
                }
            }

            showToast('AI response completed successfully!', 'success');
            // Refresh history in sidebar since new item was stored in MongoDB
            loadHistory();

        } catch (error) {
            console.error(error);
            loadingOverlay.style.display = 'none';
            outputText.textContent = `An error occurred while communicating with the server:\n\n${error.message}\n\nMake sure the backend server is running and database is available.`;
            outputText.classList.add('error');
            genStatus.textContent = 'Failed to generate';
            genStatus.className = 'generation-status error';
            showToast(error.message, 'error');
        } finally {
            isGenerating = false;
            currentStreamReader = null;
            outputText.classList.remove('typing');
            setGenerationState(false);
        }
    }

    function setGenerationState(generating) {
        if (generating) {
            genStatus.textContent = 'Generating content...';
            genStatus.className = 'generation-status generating';
            btnCopy.disabled = true;
            btnDownload.disabled = true;
            // Disable all submit buttons
            document.querySelectorAll('.submit-btn').forEach(btn => btn.disabled = true);
        } else {
            genStatus.textContent = 'Ready';
            genStatus.className = 'generation-status';
            // Enable actions if output has text
            const hasText = outputText.textContent.trim().length > 0;
            btnCopy.disabled = !hasText;
            btnDownload.disabled = !hasText;
            document.querySelectorAll('.submit-btn').forEach(btn => btn.disabled = false);
        }
    }

    /* ==========================================================================
       History Management
       ========================================================================== */
    async function loadHistory() {
        const token = localStorage.getItem('token');
        if (!token) {
            if (authCtaContainer) authCtaContainer.style.display = 'block';
            if (userProfile) userProfile.style.display = 'none';
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fa-solid fa-user-lock"></i>
                    <p>Log in to view history.</p>
                </div>
            `;
            historyCount.textContent = '0';
            return;
        }

        if (authCtaContainer) authCtaContainer.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'block';
            userNameDisplay.textContent = localStorage.getItem('userName') || 'User';
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 401) {
                handleLogout();
                return;
            }
            if (!response.ok) throw new Error('Failed to load history');
            const data = await response.json();
            
            historyCount.textContent = data.length;
            renderHistoryList(data);
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    function renderHistoryList(items) {
        historyList.innerHTML = '';
        if (items.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fa-solid fa-box-open"></i>
                    <p>No history items yet.</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            // Format time ago or standard date
            const date = new Date(item.timestamp);
            const formattedTime = date.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            historyItem.innerHTML = `
                <div class="history-item-header">
                    <span class="history-tag tag-${item.type}">${item.type}</span>
                    <button class="history-delete-btn" data-id="${item.id}" title="Delete record">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
                <div class="history-prompt">${escapeHTML(item.prompt)}</div>
                <div class="history-time">${formattedTime}</div>
            `;

            // Delete click handler
            const deleteBtn = historyItem.querySelector('.history-delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid loading the history item
                deleteHistoryItem(item.id);
            });

            // Card click handler - Load item
            historyItem.addEventListener('click', () => {
                loadHistoryItemIntoUI(item);
                if (window.innerWidth <= 900) {
                    sidebar.classList.remove('open');
                }
            });

            historyList.appendChild(historyItem);
        });
    }

    async function deleteHistoryItem(id) {
        if (!confirm('Are you sure you want to delete this prompt from your history?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Could not delete history item');
            
            showToast('History item removed.', 'success');
            loadHistory();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    function loadHistoryItemIntoUI(item) {
        // 1. Switch Active Tab
        switchTab(item.type);

        // 2. Populate input fields depending on type
        const options = item.options || {};
        if (item.type === 'generate') {
            document.getElementById('gen-prompt').value = item.prompt;
            document.getElementById('gen-tone').value = options.tone || 'Creative';
            document.getElementById('gen-length').value = options.length || 'Medium';
            document.getElementById('gen-keywords').value = (options.keywords || []).join(', ');
        } else if (item.type === 'summarize') {
            sumText.value = item.prompt; // Note: prompt stores source text here
            sumCount.textContent = sumText.value.length;
            document.getElementById('sum-style').value = options.style || 'Bullet Points';
        } else if (item.type === 'email') {
            document.getElementById('email-sender').value = options.sender || '';
            document.getElementById('email-recipient').value = options.recipient || '';
            document.getElementById('email-purpose').value = options.purpose || '';
            document.getElementById('email-points').value = (options.key_points || []).join('\n');
            document.getElementById('email-tone').value = options.tone || 'Professional';
        } else if (item.type === 'rewrite') {
            rewText.value = item.prompt; // Note: prompt stores source text here
            rewCount.textContent = rewText.value.length;
            document.getElementById('rew-style').value = options.style || 'Professionalize';
        }

        // 3. Load Response text
        outputText.textContent = item.response;
        outputText.classList.remove('error');
        updateTextCounters(item.response);

        // Enable buttons since we loaded valid generation text
        btnCopy.disabled = false;
        btnDownload.disabled = false;
        genStatus.textContent = 'Loaded from history';
        genStatus.className = 'generation-status';

        showToast(`Loaded ${item.type} interaction from history.`, 'success');
        
        // Smooth scroll to output on mobile devices
        if (window.innerWidth <= 1200) {
            outputText.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /* ==========================================================================
       Output Actions & Helpers
       ========================================================================== */
    function clearOutputUI() {
        outputText.textContent = '';
        outputText.classList.remove('error');
        updateTextCounters('');
    }

    function clearOutput() {
        if (isGenerating) {
            if (currentStreamReader) {
                currentStreamReader.cancel();
            }
        }
        clearOutputUI();
        btnCopy.disabled = true;
        btnDownload.disabled = true;
        genStatus.textContent = 'Cleared';
        showToast('Output area cleared.', 'info');
    }

    function copyToClipboard() {
        const text = outputText.textContent;
        if (!text) return;
        
        navigator.clipboard.writeText(text)
            .then(() => {
                showToast('Copied to clipboard!', 'success');
            })
            .catch(err => {
                showToast('Failed to copy to clipboard.', 'error');
                console.error(err);
            });
    }

    function downloadAsTXT() {
        const text = outputText.textContent;
        if (!text) return;

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Make nice filename
        const dateStr = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `writegen-output-${dateStr}.txt`;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Downloading document as TXT file...', 'success');
    }

    function updateTextCounters(text) {
        const textTrimmed = text.trim();
        const words = textTrimmed === '' ? 0 : textTrimmed.split(/\s+/).length;
        const chars = text.length;
        wordCount.textContent = `${words} words | ${chars} characters`;
    }

    /* ==========================================================================
       Notification Toast Helper
       ========================================================================== */
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let iconClass = 'fa-solid fa-circle-info';
        if (type === 'success') iconClass = 'fa-solid fa-circle-check';
        if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';

        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;
        
        toastContainer.appendChild(toast);

        // Remove toast after 3.5 seconds
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s forwards reverse';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3500);
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ==========================================================================
       Auth Functions
       ========================================================================== */
    async function handleAuthSubmit(e) {
        console.log("Form submit event fires");
        e.preventDefault();
        const email = document.getElementById('authEmail').value;
        const password = document.getElementById('authPassword').value;
        const name = document.getElementById('authName').value;

        const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';
        const payload = isLoginMode ? { email, password } : { email, password, name };

        try {
            console.log("fetch() is executed to endpoint:", endpoint);
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                let errorMsg = 'Authentication failed';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.detail || errorMsg;
                } catch (e) {
                    errorMsg = `Server error (${response.status}): Database is likely offline or unreachable.`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            // Save token
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userName', data.name);
            
            showToast(isLoginMode ? 'Logged in successfully' : 'Registered successfully', 'success');
            authModalOverlay.style.display = 'none';
            authForm.reset();
            
            // Reload history to apply logged in state
            loadHistory();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    function handleLogout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        showToast('Logged out successfully', 'info');
        loadHistory();
    }
});
