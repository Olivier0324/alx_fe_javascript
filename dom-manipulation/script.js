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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);