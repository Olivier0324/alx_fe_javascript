// Initial declarations
let quotes = [];
let lastSyncTime = null;
const syncInterval = 30000; // 30 seconds
let syncTimeout;

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const syncStatus = document.getElementById('syncStatus');
const conflictModal = document.getElementById('conflictModal');
const conflictList = document.getElementById('conflictList');
const acceptServerBtn = document.getElementById('acceptServerBtn');
const keepLocalBtn = document.getElementById('keepLocalBtn');

// Initialize the application
function init() {
    createAddQuoteForm();
    loadQuotes();
    populateCategories();
    restoreLastFilter();
    showRandomQuote();
    setupEventListeners();
    startSyncTimer();
}

function setupEventListeners() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    exportBtn.addEventListener('click', exportToJson);
    importFileInput.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);
    acceptServerBtn.addEventListener('click', resolveServerConflicts);
    keepLocalBtn.addEventListener('click', resolveLocalConflicts);
}

// Server simulation functions
async function fetchQuotesFromServer() {
    try {
        // Simulate API call with random delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        // Get server data from localStorage (mock API)
        const serverData = localStorage.getItem('serverQuotes') || '[]';
        return JSON.parse(serverData);
    } catch (error) {
        console.error('Error fetching from server:', error);
        showNotification('Failed to fetch from server', 'error');
        return [];
    }
}

async function postQuotesToServer(quotesToSend) {
    try {
        // Simulate API call with random delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        // Save to localStorage (mock API)
        localStorage.setItem('serverQuotes', JSON.stringify(quotesToSend));
        return true;
    } catch (error) {
        console.error('Error posting to server:', error);
        showNotification('Failed to post to server', 'error');
        return false;
    }
}

// Sync functions
async function syncQuotes() {
    updateSyncStatus('Syncing with server...');

    try {
        const serverQuotes = await fetchQuotesFromServer();
        const conflicts = findConflicts(quotes, serverQuotes);

        if (conflicts.length > 0) {
            showConflicts(conflicts, serverQuotes);
        } else {
            // No conflicts, merge changes
            quotes = mergeQuotes(quotes, serverQuotes);
            saveQuotes();
            updateSyncStatus(`Synced at ${new Date().toLocaleTimeString()}`);
            showNotification('Quotes updated from server', 'success');
        }

        // Post our local changes to server
        await postQuotesToServer(quotes);
        lastSyncTime = new Date();
    } catch (error) {
        console.error('Sync failed:', error);
        updateSyncStatus('Sync failed');
        showNotification('Sync failed', 'error');
    }

    startSyncTimer();
}

function findConflicts(localQuotes, serverQuotes) {
    return localQuotes.filter(localQuote => {
        const serverQuote = serverQuotes.find(sq => sq.text === localQuote.text);
        return serverQuote && serverQuote.category !== localQuote.category;
    });
}

function mergeQuotes(localQuotes, serverQuotes) {
    // Simple merge strategy - prefer server version for conflicts
    const localTexts = localQuotes.map(q => q.text);
    const serverOnly = serverQuotes.filter(q => !localTexts.includes(q.text));
    return [...localQuotes, ...serverOnly];
}

// Conflict resolution
function showConflicts(conflicts, serverQuotes) {
    conflictList.innerHTML = conflicts.map(conflict => {
        const serverVersion = serverQuotes.find(q => q.text === conflict.text);
        return `
            <div class="conflict-item">
                <p><strong>Quote:</strong> "${conflict.text}"</p>
                <p><strong>Local category:</strong> ${conflict.category}</p>
                <p><strong>Server category:</strong> ${serverVersion.category}</p>
            </div>
        `;
    }).join('');

    conflictModal.style.display = 'block';
}

function resolveServerConflicts() {
    const serverQuotes = JSON.parse(localStorage.getItem('serverQuotes') || '[]');
    quotes = mergeQuotes(quotes, serverQuotes);
    saveQuotes();
    closeConflictModal();
    showNotification('Accepted server changes', 'success');
}

function resolveLocalConflicts() {
    postQuotesToServer(quotes);
    closeConflictModal();
    showNotification('Kept local changes', 'success');
}

function closeConflictModal() {
    conflictModal.style.display = 'none';
    populateCategories();
    updateSyncStatus(`Synced at ${new Date().toLocaleTimeString()}`);
}

// UI functions
function updateSyncStatus(message) {
    if (syncStatus) syncStatus.textContent = message;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function startSyncTimer() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => syncQuotes(), syncInterval);
}

// Existing functions (updated as needed)
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form';
    formContainer.innerHTML = `
        <h3>Add a New Quote</h3>
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" required>
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" required>
        <button id="addQuoteBtn">Add Quote</button>
        <div id="syncStatus">Not synced yet</div>
        <div id="notificationArea"></div>
    `;
    document.body.appendChild(formContainer);
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);