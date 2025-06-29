// Initial quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');

// Initialize the application
function init() {
    createAddQuoteForm();
    loadQuotes();
    populateCategories();
    restoreLastFilter();
    showRandomQuote();

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    exportBtn.addEventListener('click', exportToJson);
    importFileInput.addEventListener('change', importFromJsonFile);
    categoryFilter.addEventListener('change', filterQuotes);
}

// Create the add quote form
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    formContainer.className = 'add-quote-form';
    formContainer.innerHTML = `
        <h3>Add a New Quote</h3>
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" required>
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" required>
        <button id="addQuoteBtn">Add Quote</button>
    `;
    document.body.appendChild(formContainer);
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    quotes = storedQuotes ? JSON.parse(storedQuotes) : [
        { text: "The only way to do great work is to love what you do.", category: "work" },
        { text: "Life is what happens when you're busy making other plans.", category: "life" }
    ];
    saveQuotes();
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate category dropdown with unique categories
function populateCategories() {
    // Extract unique categories
    const uniqueCategories = [...new Set(quotes.map(quote => quote.category))];

    // Clear existing options
    categoryFilter.innerHTML = '';

    // Add default "All" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Categories';
    categoryFilter.appendChild(allOption);

    // Add each unique category
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category; // Using textContent here
        categoryFilter.appendChild(option);
    });
}

// Filter quotes by selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;

    // Save selected category to local storage
    localStorage.setItem('lastSelectedCategory', selectedCategory);

    // Filter quotes based on selection
    let filteredQuotes = quotes;
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    // Update display
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        displayQuote(filteredQuotes[randomIndex]);
    } else {
        quoteDisplay.textContent = `No quotes found in category: ${selectedCategory}`;
    }
}

// Restore last selected category from local storage
function restoreLastFilter() {
    const lastCategory = localStorage.getItem('lastSelectedCategory');
    if (lastCategory && categoryFilter.querySelector(`option[value="${lastCategory}"]`)) {
        categoryFilter.value = lastCategory;
    }
}

// Show a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    displayQuote(quotes[randomIndex]);
}

// Display a quote
function displayQuote(quote) {
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${quote.text}"</p>
        <p class="quote-category">— ${quote.category}</p>
    `;
}

// Add a new quote
function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();

    if (!text || !category) {
        alert('Please enter both a quote and a category');
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();

    // Update categories if new category was added
    const categories = [...new Set(quotes.map(q => q.category))];
    if (!categories.includes(category)) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    }

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    // Show the new quote if its category is selected
    if (categoryFilter.value === 'all' || categoryFilter.value === category) {
        displayQuote(newQuote);
    }
}

// Export quotes to JSON
function exportToJson() {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();

    fileReader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (!Array.isArray(importedQuotes)) throw new Error('Invalid format');

            quotes = importedQuotes;
            saveQuotes();
            populateCategories();
            showRandomQuote();
            alert(`Imported ${importedQuotes.length} quotes!`);
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };

    fileReader.readAsText(file);
}
// Initial quotes array
let quotes = [];
let lastSyncTime = null;
const syncInterval = 30000; // Sync every 30 seconds
let syncTimeout;

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');
const syncStatus = document.getElementById('syncStatus');
const conflictResolutionModal = document.getElementById('conflictResolutionModal');
const conflictList = document.getElementById('conflictList');
const acceptServerChangesBtn = document.getElementById('acceptServerChanges');
const keepLocalChangesBtn = document.getElementById('keepLocalChanges');

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
    acceptServerChangesBtn.addEventListener('click', () => resolveConflicts(true));
    keepLocalChangesBtn.addEventListener('click', () => resolveConflicts(false));
}

// Server simulation functions
async function fetchFromServer() {
    try {
        // Simulate API call with random delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        // Get server data from localStorage (simulating server storage)
        const serverData = localStorage.getItem('serverQuotes') || '[]';
        return JSON.parse(serverData);
    } catch (error) {
        console.error('Error fetching from server:', error);
        return [];
    }
}

async function postToServer(quotesToSend) {
    try {
        // Simulate API call with random delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));

        // Save to localStorage (simulating server storage)
        localStorage.setItem('serverQuotes', JSON.stringify(quotesToSend));
        return true;
    } catch (error) {
        console.error('Error posting to server:', error);
        return false;
    }
}

// Sync functions
async function syncWithServer() {
    updateSyncStatus('Syncing...');

    try {
        const serverQuotes = await fetchFromServer();
        const conflicts = findConflicts(quotes, serverQuotes);

        if (conflicts.length > 0) {
            showConflictResolution(conflicts, serverQuotes);
        } else {
            // No conflicts, merge changes
            const mergedQuotes = mergeQuotes(quotes, serverQuotes);
            quotes = mergedQuotes;
            saveQuotes();
            updateSyncStatus('Synced at ' + new Date().toLocaleTimeString());
        }

        // Post our local changes to server
        await postToServer(quotes);
        lastSyncTime = new Date();
    } catch (error) {
        console.error('Sync failed:', error);
        updateSyncStatus('Sync failed');
    }

    startSyncTimer();
}

function findConflicts(localQuotes, serverQuotes) {
    // Simple conflict detection - quotes with same text but different categories
    return localQuotes.filter(localQuote => {
        const serverQuote = serverQuotes.find(sq => sq.text === localQuote.text);
        return serverQuote && serverQuote.category !== localQuote.category;
    });
}

function mergeQuotes(localQuotes, serverQuotes) {
    // Merge strategy: prefer server version for conflicts
    const localTexts = localQuotes.map(q => q.text);
    const serverOnly = serverQuotes.filter(q => !localTexts.includes(q.text));
    return [...localQuotes, ...serverOnly];
}

// Conflict resolution
function showConflictResolution(conflicts, serverQuotes) {
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

    conflictResolutionModal.style.display = 'block';
}

function resolveConflicts(acceptServerChanges) {
    const serverQuotes = JSON.parse(localStorage.getItem('serverQuotes') || []);

    if (acceptServerChanges) {
        // Accept server changes for conflicts
        quotes = mergeQuotes(quotes, serverQuotes);
    } else {
        // Keep local changes - post them to server
        postToServer(quotes);
    }

    saveQuotes();
    populateCategories();
    conflictResolutionModal.style.display = 'none';
    updateSyncStatus('Synced at ' + new Date().toLocaleTimeString());
}

// UI functions
function updateSyncStatus(message) {
    if (syncStatus) {
        syncStatus.textContent = message;
    }
}

function startSyncTimer() {
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => syncWithServer(), syncInterval);
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
    `;
    document.body.appendChild(formContainer);
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
}

function addQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim();

    if (!text || !category) {
        alert('Please enter both a quote and a category');
        return;
    }

    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotes();

    // Update categories if new category was added
    const categories = [...new Set(quotes.map(q => q.category))];
    if (!categories.includes(category)) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    }

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    // Show the new quote if its category is selected
    if (categoryFilter.value === 'all' || categoryFilter.value === category) {
        displayQuote(newQuote);
    }

    // Trigger sync after local change
    syncWithServer();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);