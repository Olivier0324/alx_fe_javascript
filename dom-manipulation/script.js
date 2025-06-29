// Initial declarations
let quotes = [];
let lastSyncTime = null;
const syncInterval = 30000; // 30 seconds
let syncTimeout;

// DOM elements
const elements = {
    quoteDisplay: document.getElementById('quoteDisplay'),
    newQuoteBtn: document.getElementById('newQuote'),
    categoryFilter: document.getElementById('categoryFilter'),
    exportBtn: document.getElementById('exportBtn'),
    importFile: document.getElementById('importFile'),
    syncStatus: document.getElementById('syncStatus'),
    conflictModal: document.getElementById('conflictModal'),
    conflictList: document.getElementById('conflictList'),
    acceptServerBtn: document.getElementById('acceptServerBtn'),
    keepLocalBtn: document.getElementById('keepLocalBtn')
};

// Initialize application
function init() {
    createAddQuoteForm();
    loadQuotes();
    setupEventListeners();
    startSyncTimer();
}

// Server functions
async function fetchQuotesFromServer() {
    try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
        const serverData = localStorage.getItem('serverQuotes') || '[]';
        return JSON.parse(serverData);
    } catch (error) {
        console.error('Fetch error:', error);
        showNotification('Server fetch failed', 'error');
        return [];
    }
}

async function postQuotesToServer(quotes) {
    try {
        await new Promise(resolve => setTimeout(resolve, 500)); // Mock delay
        localStorage.setItem('serverQuotes', JSON.stringify(quotes));
        return true;
    } catch (error) {
        console.error('Post error:', error);
        showNotification('Server post failed', 'error');
        return false;
    }
}

// Sync functions
async function syncQuotes() {
    updateSyncStatus('Syncing...');

    try {
        const serverQuotes = await fetchQuotesFromServer();
        const conflicts = findConflicts(quotes, serverQuotes);

        if (conflicts.length > 0) {
            showConflicts(conflicts, serverQuotes);
        } else {
            quotes = mergeQuotes(quotes, serverQuotes);
            saveQuotes();
            showNotification('Sync complete', 'success');
        }

        await postQuotesToServer(quotes);
        updateSyncStatus(`Synced: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('Sync failed');
    }

    startSyncTimer();
}

// Conflict resolution
function findConflicts(local, server) {
    return local.filter(localQuote => {
        const serverQuote = server.find(sq => sq.text === localQuote.text);
        return serverQuote && serverQuote.category !== localQuote.category;
    });
}

function mergeQuotes(local, server) {
    const localTexts = local.map(q => q.text);
    const serverOnly = server.filter(q => !localTexts.includes(q.text));
    return [...local, ...serverOnly];
}

// UI functions
function showConflicts(conflicts, serverQuotes) {
    elements.conflictList.innerHTML = conflicts.map(conflict => {
        const serverVer = serverQuotes.find(sq => sq.text === conflict.text);
        return `
            <div class="conflict-item">
                <p><strong>Quote:</strong> "${conflict.text}"</p>
                <p><strong>Local:</strong> ${conflict.category}</p>
                <p><strong>Server:</strong> ${serverVer.category}</p>
            </div>
        `;
    }).join('');
    elements.conflictModal.style.display = 'block';
}

function resolveConflicts(acceptServer) {
    const serverQuotes = JSON.parse(localStorage.getItem('serverQuotes') || []);
    quotes = acceptServer ? mergeQuotes(quotes, serverQuotes) : quotes;
    saveQuotes();
    elements.conflictModal.style.display = 'none';
    showNotification(acceptServer ? 'Used server changes' : 'Kept local changes', 'success');
}

// Helper functions
function updateSyncStatus(message) {
    if (elements.syncStatus) elements.syncStatus.textContent = message;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function startSyncTimer() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(syncQuotes, syncInterval);
}

// Initialize
document.addEventListener('DOMContentLoaded', init);