/**
 * Snell Panel - Web UI Application
 * Main JavaScript Application Logic
 */

// ===================================
// Configuration & State Management
// ===================================

const CONFIG = {
    STORAGE_KEYS: {
        API_URL: 'snell_panel_api_url',
        API_TOKEN: 'snell_panel_api_token',
        AUTH_SESSION: 'snell_panel_auth_session'
    },
    DEFAULT_AUTH: {
        USERNAME: 'admin',
        PASSWORD: 'admin'
    },
    TOAST_DURATION: 4000,
    DEBOUNCE_DELAY: 300
};

// Application State
const state = {
    nodes: [],
    filteredNodes: [],
    isLoading: false,
    currentEditNodeId: null
};

// ===================================
// Utility Functions
// ===================================

/**
 * Debounce function to limit function calls
 */
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

/**
 * Convert country code to flag emoji
 */
function countryCodeToFlag(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 0x1F1E6 + char.charCodeAt(0) - 65);
    return String.fromCodePoint(...codePoints);
}

/**
 * Get API configuration from localStorage
 */
function getApiConfig() {
    // Try session storage first
    let url = sessionStorage.getItem(CONFIG.STORAGE_KEYS.API_URL);
    let token = sessionStorage.getItem(CONFIG.STORAGE_KEYS.API_TOKEN);

    // Then try local storage
    if (!url || !token) {
        url = localStorage.getItem(CONFIG.STORAGE_KEYS.API_URL);
        token = localStorage.getItem(CONFIG.STORAGE_KEYS.API_TOKEN);
    }

    return {
        url: url || '',
        token: token || ''
    };
}

/**
 * Save API configuration to localStorage
 */
function saveApiConfig(url, token, remember = true) {
    if (remember) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.API_URL, url);
        localStorage.setItem(CONFIG.STORAGE_KEYS.API_TOKEN, token);
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.API_URL);
        sessionStorage.removeItem(CONFIG.STORAGE_KEYS.API_TOKEN);
    } else {
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.API_URL, url);
        sessionStorage.setItem(CONFIG.STORAGE_KEYS.API_TOKEN, token);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.API_URL);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.API_TOKEN);
    }
}

/**
 * Clear API configuration from localStorage
 */
function clearApiConfig() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.API_URL);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.API_TOKEN);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.API_URL);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.API_TOKEN);
}

/**
 * Check if API is configured
 */
function isApiConfigured() {
    const { url, token } = getApiConfig();
    return url && token;
}

// ===================================
// Toast Notifications
// ===================================

/**
 * Show toast notification
 */
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');

    const icons = {
        success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>`,
        error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>`,
        warning: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>`,
        info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>`
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        ${icons[type] || icons.info}
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 250);
    });

    // Auto dismiss
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 250);
        }
    }, CONFIG.TOAST_DURATION);
}

// ===================================
// Modal Functions
// ===================================

/**
 * Open modal by ID
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal by ID
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Close all modals
 */
function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// ===================================
// API Functions
// ===================================

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
    const { url, token } = getApiConfig();

    if (!url || !token) {
        throw new Error('API 未配置，请先设置 API URL 和 Token');
    }

    const fullUrl = new URL(endpoint, url.endsWith('/') ? url : url + '/');
    fullUrl.searchParams.set('token', token);

    const response = await fetch(fullUrl.toString(), {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `请求失败: ${response.status}`);
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    return response.text();
}

/**
 * Fetch all nodes from API
 */
async function fetchNodes() {
    try {
        state.isLoading = true;
        updateLoadingState();

        const response = await apiRequest('entries');

        if (response.status === 'success' && Array.isArray(response.data)) {
            state.nodes = response.data;
            state.filteredNodes = [...state.nodes];
            renderNodes();
            updateStats();
            showToast('success', '刷新成功', `已加载 ${state.nodes.length} 个节点`);
        } else if (response.status === 'warning') {
            state.nodes = [];
            state.filteredNodes = [];
            renderNodes();
            updateStats();
        }
    } catch (error) {
        console.error('Fetch nodes error:', error);
        showToast('error', '获取节点失败', error.message);
        state.nodes = [];
        state.filteredNodes = [];
        renderNodes();
        updateStats();
    } finally {
        state.isLoading = false;
        updateLoadingState();
    }
}

/**
 * Create a new node
 */
async function createNode(nodeData) {
    const response = await apiRequest('entry', {
        method: 'POST',
        body: JSON.stringify(nodeData)
    });

    if (response.status === 'success') {
        return response.data;
    }

    throw new Error(response.message || '创建节点失败');
}

/**
 * Update an existing node
 */
async function updateNode(nodeId, nodeData) {
    const response = await apiRequest(`modify/${nodeId}`, {
        method: 'PUT',
        body: JSON.stringify(nodeData)
    });

    if (response.status === 'success') {
        return response;
    }

    throw new Error(response.message || '更新节点失败');
}

/**
 * Delete a node by node ID
 */
async function deleteNode(nodeId) {
    const response = await apiRequest(`entry/node/${nodeId}`, {
        method: 'DELETE'
    });

    if (response.status === 'success') {
        return response;
    }

    throw new Error(response.message || '删除节点失败');
}

/**
 * Get subscription URL
 */
function getSubscriptionUrl(options = {}) {
    const { url, token } = getApiConfig();

    if (!url || !token) {
        return '';
    }

    const subUrl = new URL('subscribe', url.endsWith('/') ? url : url + '/');
    subUrl.searchParams.set('token', token);

    if (options.via) {
        subUrl.searchParams.set('via', options.via);
    }

    if (options.filter) {
        subUrl.searchParams.set('filter', options.filter);
    }

    if (options.showFlag === false) {
        subUrl.searchParams.set('flag', 'false');
    }

    return subUrl.toString();
}

// ===================================
// UI Rendering Functions
// ===================================

/**
 * Render nodes table
 */
function renderNodes() {
    const tbody = document.getElementById('nodes-tbody');
    const emptyState = document.getElementById('empty-state');
    const tableWrapper = document.querySelector('.table-wrapper');

    if (state.filteredNodes.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        tableWrapper.style.display = 'none';
    } else {
        emptyState.classList.add('hidden');
        tableWrapper.style.display = 'block';

        tbody.innerHTML = state.filteredNodes.map(node => `
            <tr data-node-id="${node.node_id}">
                <td>${node.id}</td>
                <td>
                    <div class="node-name">
                        <span class="flag">${countryCodeToFlag(node.country_code)}</span>
                        <span>${node.node_name || node.node_id.slice(0, 8)}</span>
                    </div>
                </td>
                <td>${node.ip}</td>
                <td>${node.port}</td>
                <td class="psk-cell">${maskPsk(node.psk)}</td>
                <td>${node.version || '4'}</td>
                <td>
                    <div class="location-cell">
                        <span class="flag">${countryCodeToFlag(node.country_code)}</span>
                        <span>${node.country_code || '-'}</span>
                    </div>
                </td>
                <td>${node.isp || '-'}</td>
                <td class="asn-cell">${node.asn ? `AS${node.asn}` : '-'}</td>
                <td>
                    <div class="action-cell">
                        <button class="btn btn-icon btn-sm" title="编辑" onclick="handleEditNode('${node.node_id}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn btn-icon btn-sm" title="删除" onclick="handleDeleteNode('${node.node_id}', '${escapeHtml(node.node_name || node.node_id.slice(0, 8))}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

/**
 * Mask PSK for display
 */
function maskPsk(psk) {
    if (!psk) return '-';
    if (psk.length <= 6) return '••••••';
    return psk.slice(0, 3) + '•'.repeat(Math.min(psk.length - 6, 10)) + psk.slice(-3);
}

/**
 * Escape HTML characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update statistics display
 */
function updateStats() {
    const totalNodes = state.nodes.length;
    const countries = [...new Set(state.nodes.map(n => n.country_code).filter(Boolean))];

    document.getElementById('stat-total-nodes').textContent = totalNodes;
    document.getElementById('stat-countries').textContent = countries.length;

    const locationsContainer = document.getElementById('stat-locations');
    if (countries.length > 0) {
        locationsContainer.innerHTML = countries.map(code =>
            `<span class="country-flag" title="${code}">${countryCodeToFlag(code)}</span>`
        ).join('');
    } else {
        locationsContainer.innerHTML = '<span class="no-data">暂无节点配置</span>';
    }
}

/**
 * Update loading state UI
 */
function updateLoadingState() {
    const refreshBtn = document.getElementById('btn-refresh');
    if (state.isLoading) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `
            <span class="spinner"></span>
            <span>加载中...</span>
        `;
    } else {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/>
            </svg>
            <span>刷新</span>
        `;
    }
}

/**
 * Filter nodes by search query
 */
function filterNodes(query) {
    if (!query.trim()) {
        state.filteredNodes = [...state.nodes];
    } else {
        const lowerQuery = query.toLowerCase();
        state.filteredNodes = state.nodes.filter(node =>
            (node.node_name && node.node_name.toLowerCase().includes(lowerQuery)) ||
            (node.ip && node.ip.toLowerCase().includes(lowerQuery)) ||
            (node.country_code && node.country_code.toLowerCase().includes(lowerQuery)) ||
            (node.isp && node.isp.toLowerCase().includes(lowerQuery))
        );
    }
    renderNodes();
}

/**
 * Handle Login
 */
/**
 * Check if user is logged in
 */
function isUserLoggedIn() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_SESSION) === 'true' ||
        sessionStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_SESSION) === 'true';
}

/**
 * Handle Login
 */
async function handleLogin() {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const rememberInput = document.getElementById('login-remember');
    const loginBtn = document.getElementById('btn-login');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const remember = rememberInput.checked;

    if (!username) {
        showToast('error', '请输入用户名');
        usernameInput.focus();
        return;
    }

    if (!password) {
        showToast('error', '请输入密码');
        passwordInput.focus();
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="spinner"></span> 正在登录...';

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 600));

    if (username === CONFIG.DEFAULT_AUTH.USERNAME && password === CONFIG.DEFAULT_AUTH.PASSWORD) {
        if (remember) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_SESSION, 'true');
        } else {
            sessionStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_SESSION, 'true');
        }

        showToast('success', '登录成功');
        // Redirect to index
        window.location.href = 'index.html';
    } else {
        showToast('error', '用户名或密码错误');
        passwordInput.value = '';
        passwordInput.focus();
    }

    loginBtn.disabled = false;
    loginBtn.innerHTML = `
        <span>登录 / 连接</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
        </svg>
    `;
}

/**
 * Handle Logout
 */
function handleLogout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_SESSION);
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_SESSION);
    showToast('success', '已退出登录');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

/**
 * Check Login Status and Router
 */
function checkLoginStatus() {
    const isLogin = isUserLoggedIn();
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.endsWith('login.html');

    if (isLogin) {
        if (isLoginPage) {
            // Already logged in, go to app
            window.location.href = 'index.html';
            return;
        }

        // We are in app, check API config
        if (isApiConfigured()) {
            if (state.nodes.length === 0) {
                // Defer fetch to init or handle it here if init is already done
                // But init calls this.
                // We will let init call fetchNodes() if needed, or do it here.
                // Better to do it here if init depends on it.
                // Actually init calls checkLoginStatus, then calls fetchNodes if login status calls it?
                // No, init calls fetchNodes() if logged in.
                // Let's rely on init for fetching.
            }
        }
    } else {
        if (!isLoginPage) {
            // Not logged in and not on login page
            window.location.href = 'login.html';
        }
    }
}

// ===================================
// Event Handlers
// ===================================

/**
 * Handle refresh button click
 */
function handleRefresh() {
    if (!isApiConfigured()) {
        showToast('warning', '未配置 API', '请先设置 API URL 和 Token');
        openModal('modal-api-settings');
        return;
    }
    fetchNodes();
}

/**
 * Handle API settings save
 */
function handleSaveApiSettings() {
    const urlInput = document.getElementById('api-url');
    const tokenInput = document.getElementById('api-token');

    const url = urlInput.value.trim();
    const token = tokenInput.value.trim();

    if (!url) {
        showToast('error', '请输入 API URL');
        urlInput.focus();
        return;
    }

    if (!token) {
        showToast('error', '请输入 API Token');
        tokenInput.focus();
        return;
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        showToast('error', 'API URL 格式不正确');
        urlInput.focus();
        return;
    }

    saveApiConfig(url, token);
    closeModal('modal-api-settings');
    showToast('success', '设置已保存', '正在加载节点数据...');
    fetchNodes();
}

/**
 * Handle clear API settings
 */
function handleClearSettings() {
    clearApiConfig();
    document.getElementById('api-url').value = '';
    document.getElementById('api-token').value = '';
    state.nodes = [];
    state.filteredNodes = [];
    renderNodes();
    updateStats();
    showToast('info', '设置已清除');
}

/**
 * Handle add node button click
 */
function handleAddNode() {
    if (!isApiConfigured()) {
        showToast('warning', '未配置 API', '请先设置 API URL 和 Token');
        openModal('modal-api-settings');
        return;
    }

    state.currentEditNodeId = null;
    document.getElementById('modal-node-title').textContent = '添加节点';
    document.getElementById('node-name').value = '';
    document.getElementById('node-ip').value = '';
    document.getElementById('node-port').value = '';
    document.getElementById('node-psk').value = '';
    document.getElementById('node-version').value = '4';
    document.getElementById('node-id').value = '';

    openModal('modal-node');
}

/**
 * Handle edit node
 */
function handleEditNode(nodeId) {
    const node = state.nodes.find(n => n.node_id === nodeId);
    if (!node) {
        showToast('error', '节点不存在');
        return;
    }

    state.currentEditNodeId = nodeId;
    document.getElementById('modal-node-title').textContent = '编辑节点';
    document.getElementById('node-name').value = node.node_name || '';
    document.getElementById('node-ip').value = node.ip || '';
    document.getElementById('node-port').value = node.port || '';
    document.getElementById('node-psk').value = node.psk || '';
    document.getElementById('node-version').value = node.version || '4';
    document.getElementById('node-id').value = nodeId;

    openModal('modal-node');
}

/**
 * Handle save node (create or update)
 */
async function handleSaveNode() {
    const name = document.getElementById('node-name').value.trim();
    const ip = document.getElementById('node-ip').value.trim();
    const port = parseInt(document.getElementById('node-port').value);
    const psk = document.getElementById('node-psk').value.trim();
    const version = document.getElementById('node-version').value;
    const nodeId = document.getElementById('node-id').value;

    // Validation
    if (!ip) {
        showToast('error', '请输入 IP 地址或域名');
        return;
    }

    if (!port || port < 1 || port > 65535) {
        showToast('error', '请输入有效的端口号 (1-65535)');
        return;
    }

    if (!psk && !nodeId) {
        showToast('error', '请输入 PSK 密钥');
        return;
    }

    try {
        if (nodeId) {
            // Update existing node
            const updateData = {};
            if (name) updateData.node_name = name;
            if (ip) updateData.ip = ip;

            await updateNode(nodeId, updateData);
            showToast('success', '节点已更新');
        } else {
            // Create new node
            await createNode({
                node_name: name,
                ip: ip,
                port: port,
                psk: psk,
                version: version
            });
            showToast('success', '节点已创建');
        }

        closeModal('modal-node');
        fetchNodes();
    } catch (error) {
        showToast('error', '操作失败', error.message);
    }
}

/**
 * Handle delete node
 */
function handleDeleteNode(nodeId, nodeName) {
    document.getElementById('delete-node-id').value = nodeId;
    document.getElementById('delete-node-name').textContent = nodeName;
    openModal('modal-confirm-delete');
}

/**
 * Handle confirm delete
 */
async function handleConfirmDelete() {
    const nodeId = document.getElementById('delete-node-id').value;

    try {
        await deleteNode(nodeId);
        showToast('success', '节点已删除');
        closeModal('modal-confirm-delete');
        fetchNodes();
    } catch (error) {
        showToast('error', '删除失败', error.message);
    }
}

/**
 * Handle generate subscription link
 */
function handleGenerateSubscription() {
    if (!isApiConfigured()) {
        showToast('warning', '未配置 API', '请先设置 API URL 和 Token');
        openModal('modal-api-settings');
        return;
    }

    updateSubscriptionUrl();
    openModal('modal-subscription');
}

/**
 * Update subscription URL based on options
 */
function updateSubscriptionUrl() {
    const via = document.getElementById('sub-via').value.trim();
    const filter = document.getElementById('sub-filter').value.trim();
    const showFlag = document.getElementById('sub-show-flag').checked;

    const url = getSubscriptionUrl({ via, filter, showFlag });
    document.getElementById('subscription-url').value = url;
}

/**
 * Handle copy subscription URL
 */
async function handleCopySubscription() {
    const url = document.getElementById('subscription-url').value;

    if (!url) {
        showToast('error', '订阅链接为空');
        return;
    }

    try {
        await navigator.clipboard.writeText(url);
        showToast('success', '已复制到剪贴板');
    } catch (error) {
        // Fallback for older browsers
        const input = document.getElementById('subscription-url');
        input.select();
        document.execCommand('copy');
        showToast('success', '已复制到剪贴板');
    }
}

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');

    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// ===================================
// Event Listeners Setup
// ===================================

function setupEventListeners() {
    // Logout button
    const btnLogout = document.getElementById('btn-top-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }

    // Action buttons
    document.getElementById('btn-refresh').addEventListener('click', handleRefresh);
    document.getElementById('btn-api-settings').addEventListener('click', () => {
        // Pre-fill current settings
        const { url, token } = getApiConfig();
        document.getElementById('api-url').value = url;
        document.getElementById('api-token').value = token;
        openModal('modal-api-settings');
    });
    document.getElementById('btn-add-node').addEventListener('click', handleAddNode);
    document.getElementById('btn-generate-subscription').addEventListener('click', handleGenerateSubscription);
    document.getElementById('btn-configure-api').addEventListener('click', () => {
        const { url, token } = getApiConfig();
        document.getElementById('api-url').value = url;
        document.getElementById('api-token').value = token;
        openModal('modal-api-settings');
    });

    // API Settings Modal
    document.getElementById('close-api-settings').addEventListener('click', () => closeModal('modal-api-settings'));
    document.getElementById('btn-save-settings').addEventListener('click', handleSaveApiSettings);
    document.getElementById('btn-clear-settings').addEventListener('click', handleClearSettings);
    document.getElementById('toggle-token-visibility').addEventListener('click', function () {
        togglePasswordVisibility('api-token', this);
    });

    // Node Modal
    document.getElementById('close-node-modal').addEventListener('click', () => closeModal('modal-node'));
    document.getElementById('btn-cancel-node').addEventListener('click', () => closeModal('modal-node'));
    document.getElementById('btn-save-node').addEventListener('click', handleSaveNode);
    document.getElementById('toggle-psk-visibility').addEventListener('click', function () {
        togglePasswordVisibility('node-psk', this);
    });

    // Subscription Modal
    document.getElementById('close-subscription-modal').addEventListener('click', () => closeModal('modal-subscription'));
    document.getElementById('btn-copy-subscription').addEventListener('click', handleCopySubscription);
    document.getElementById('btn-regenerate-subscription').addEventListener('click', updateSubscriptionUrl);
    document.getElementById('sub-via').addEventListener('input', updateSubscriptionUrl);
    document.getElementById('sub-filter').addEventListener('input', updateSubscriptionUrl);
    document.getElementById('sub-show-flag').addEventListener('change', updateSubscriptionUrl);

    // Confirm Delete Modal
    document.getElementById('close-confirm-modal').addEventListener('click', () => closeModal('modal-confirm-delete'));
    document.getElementById('btn-cancel-delete').addEventListener('click', () => closeModal('modal-confirm-delete'));
    document.getElementById('btn-confirm-delete').addEventListener('click', handleConfirmDelete);

    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce((e) => {
        filterNodes(e.target.value);
    }, CONFIG.DEBOUNCE_DELAY));

    // Close modals on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', closeAllModals);
    });

    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Enter key for forms
    document.getElementById('api-url').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('api-token').focus();
        }
    });
    document.getElementById('api-token').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleSaveApiSettings();
        }
    });

    // ===================================
    // Advanced Options Event Listeners
    // ===================================

    // Toggle advanced options visibility
    document.getElementById('toggle-advanced-options').addEventListener('change', function () {
        const content = document.getElementById('advanced-options-content');
        content.style.display = this.checked ? 'block' : 'none';
    });

    // Rule preset selection
    document.getElementById('rule-preset').addEventListener('change', function () {
        applyRulePreset(this.value);
    });

    // View tabs switching
    document.getElementById('tab-form-view').addEventListener('click', function () {
        switchCustomRulesView('form');
    });
    document.getElementById('tab-json-view').addEventListener('click', function () {
        switchCustomRulesView('json');
    });

    // Add custom rule button
    document.getElementById('btn-add-custom-rule').addEventListener('click', addCustomRule);

    // Clear all custom rules
    document.getElementById('btn-clear-custom-rules').addEventListener('click', clearCustomRules);

    // Login listeners
    const loginBtn = document.getElementById('btn-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    document.getElementById('login-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

// ===================================
// Advanced Options Functions
// ===================================

// Custom rules state
const customRulesState = {
    rules: [],
    currentView: 'form'
};

/**
 * Apply rule preset
 */
function applyRulePreset(preset) {
    const ruleCheckboxes = document.querySelectorAll('.rules-grid input[type="checkbox"]');

    // Clear all first
    ruleCheckboxes.forEach(cb => cb.checked = false);

    const presets = {
        minimal: ['private', 'china-direct'],
        balanced: ['ad-block', 'private', 'china-direct', 'google', 'telegram', 'github'],
        comprehensive: ['ad-block', 'ai-services', 'youtube', 'google', 'private', 'china-direct', 'telegram', 'github', 'microsoft', 'apple', 'social-media', 'streaming']
    };

    if (presets[preset]) {
        presets[preset].forEach(rule => {
            const checkbox = document.querySelector(`.rules-grid input[value="${rule}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

/**
 * Switch custom rules view (form/json)
 */
function switchCustomRulesView(view) {
    customRulesState.currentView = view;

    // Update tab active state
    document.getElementById('tab-form-view').classList.toggle('active', view === 'form');
    document.getElementById('tab-json-view').classList.toggle('active', view === 'json');

    // Show/hide views
    document.getElementById('custom-rules-form').style.display = view === 'form' ? 'block' : 'none';
    document.getElementById('custom-rules-json').style.display = view === 'json' ? 'block' : 'none';

    // Sync data between views
    if (view === 'json') {
        // Convert form data to JSON
        document.getElementById('custom-rules-textarea').value = JSON.stringify(customRulesState.rules, null, 2);
    } else {
        // Try to parse JSON and update form
        try {
            const jsonText = document.getElementById('custom-rules-textarea').value.trim();
            if (jsonText) {
                customRulesState.rules = JSON.parse(jsonText);
                renderCustomRulesList();
            }
        } catch (e) {
            showToast('error', 'JSON 格式错误', e.message);
        }
    }
}

/**
 * Add a new custom rule
 */
function addCustomRule() {
    const newRule = {
        id: Date.now(),
        type: 'DOMAIN-SUFFIX',
        value: '',
        policy: 'PROXY'
    };
    customRulesState.rules.push(newRule);
    renderCustomRulesList();
}

/**
 * Remove a custom rule
 */
function removeCustomRule(ruleId) {
    customRulesState.rules = customRulesState.rules.filter(r => r.id !== ruleId);
    renderCustomRulesList();
}

/**
 * Update a custom rule
 */
function updateCustomRule(ruleId, field, value) {
    const rule = customRulesState.rules.find(r => r.id === ruleId);
    if (rule) {
        rule[field] = value;
    }
}

/**
 * Clear all custom rules
 */
function clearCustomRules() {
    if (customRulesState.rules.length === 0) {
        showToast('info', '没有规则需要清除');
        return;
    }
    customRulesState.rules = [];
    renderCustomRulesList();
    document.getElementById('custom-rules-textarea').value = '';
    showToast('success', '已清空所有自定义规则');
}

/**
 * Render custom rules list
 */
function renderCustomRulesList() {
    const container = document.getElementById('custom-rules-list');

    if (customRulesState.rules.length === 0) {
        container.innerHTML = `
            <div class="custom-rules-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                <span>暂无自定义规则</span>
            </div>
        `;
        return;
    }

    container.innerHTML = customRulesState.rules.map(rule => `
        <div class="custom-rule-item" data-rule-id="${rule.id}">
            <select onchange="updateCustomRule(${rule.id}, 'type', this.value)">
                <option value="DOMAIN" ${rule.type === 'DOMAIN' ? 'selected' : ''}>DOMAIN</option>
                <option value="DOMAIN-SUFFIX" ${rule.type === 'DOMAIN-SUFFIX' ? 'selected' : ''}>DOMAIN-SUFFIX</option>
                <option value="DOMAIN-KEYWORD" ${rule.type === 'DOMAIN-KEYWORD' ? 'selected' : ''}>DOMAIN-KEYWORD</option>
                <option value="IP-CIDR" ${rule.type === 'IP-CIDR' ? 'selected' : ''}>IP-CIDR</option>
                <option value="GEOIP" ${rule.type === 'GEOIP' ? 'selected' : ''}>GEOIP</option>
                <option value="USER-AGENT" ${rule.type === 'USER-AGENT' ? 'selected' : ''}>USER-AGENT</option>
            </select>
            <input type="text" value="${escapeHtml(rule.value)}" 
                   placeholder="例如: example.com" 
                   onchange="updateCustomRule(${rule.id}, 'value', this.value)">
            <select onchange="updateCustomRule(${rule.id}, 'policy', this.value)">
                <option value="PROXY" ${rule.policy === 'PROXY' ? 'selected' : ''}>PROXY</option>
                <option value="DIRECT" ${rule.policy === 'DIRECT' ? 'selected' : ''}>DIRECT</option>
                <option value="REJECT" ${rule.policy === 'REJECT' ? 'selected' : ''}>REJECT</option>
            </select>
            <button class="btn-remove" onclick="removeCustomRule(${rule.id})" title="删除">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
}

/**
 * Get selected rules from checkboxes
 */
function getSelectedRules() {
    const checked = document.querySelectorAll('.rules-grid input[type="checkbox"]:checked');
    return Array.from(checked).map(cb => cb.value);
}

/**
 * Get advanced options configuration
 */
function getAdvancedOptionsConfig() {
    const isAdvancedEnabled = document.getElementById('toggle-advanced-options').checked;

    if (!isAdvancedEnabled) {
        return null;
    }

    return {
        preset: document.getElementById('rule-preset').value,
        selectedRules: getSelectedRules(),
        customRules: customRulesState.rules.filter(r => r.value.trim() !== '')
    };
}

// ===================================
// Initialization
// ===================================

function init() {
    setupEventListeners();

    // Check if API is configured
    checkLoginStatus();
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

