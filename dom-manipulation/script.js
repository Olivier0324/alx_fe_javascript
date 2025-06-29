// Initial quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const exportBtn = document.getElementById('exportBtn');

// Initialize the application
function init() {
    // Create the add quote form
    createAddQuoteForm();

    // Load quotes from local storage
    loadQuotes();

    // Display a random quote on page load
    showRandomQuote();

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    exportBtn.addEventListener('click', exportToJson);
}

// Function to create the add quote form
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

    // Add event listener to the new button
    document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
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
    updateCategoryFilter();
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

    // Add the new quote
    const newQuote = { text, category };
    quotes.push(newQuote);

    // Save to local storage
    saveQuotes();

    // Update the category filter
    updateCategoryFilter();

    // Clear the form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);