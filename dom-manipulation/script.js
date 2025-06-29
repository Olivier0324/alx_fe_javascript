// Initial quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportBtn = document.getElementById('exportBtn');
const addQuoteBtn = document.getElementById('addQuoteBtn');

// Initialize the application
function init() {
    // Load quotes from local storage
    loadQuotes();

    // Populate category dropdown
    updateCategoryFilter();

    // Display a random quote on page load
    showRandomQuote();

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    exportBtn.addEventListener('click', exportToJson);

    // Store last viewed time in session storage
    sessionStorage.setItem('lastViewed', new Date().toLocaleString());
}

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "work" },
            { text: "Life is what happens when you're busy making other plans.", category: "life" }
        ];
        saveQuotes();
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    let filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(quote => quote.category === selectedCategory);

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    displayQuote(filteredQuotes[randomIndex]);
}

// Display a quote in the DOM
function displayQuote(quote) {
    quoteDisplay.innerHTML = `
        <p class="quote-text">"${quote.text}"</p>
        <p class="quote-category">— ${quote.category}</p>
    `;
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Add a new quote
function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();

    if (!text || !category) {
        alert('Please enter both a quote and a category');
        return;
    }

    // Add the new quote
    const newQuote = { text, category };
    quotes.push(newQuote);

    // Save to local storage
    saveQuotes();

    // Update the category filter
    updateCategoryFilter();

    // Clear the form
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Show the new quote
    categorySelect.value = category;
    displayQuote(newQuote);
}

// Update category filter dropdown
function updateCategoryFilter() {
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];
    categorySelect.innerHTML = categories.map(category =>
        `<option value="${category}">${category.charAt(0).toUpperCase() + category.slice(1)}</option>`
    ).join('');
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

// Import quotes from JSON
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
        try {
            const imported = JSON.parse(e.target.result);
            if (!Array.isArray(imported)) throw new Error('Invalid format');

            quotes = imported;
            saveQuotes();
            updateCategoryFilter();
            showRandomQuote();
            alert(`Imported ${imported.length} quotes`);
        } catch (error) {
            alert('Import failed: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);