// Initial quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const exportBtn = document.getElementById('exportBtn');

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
    categorySelect.addEventListener('change', showRandomQuote);
    exportBtn.addEventListener('click', exportToJson);

    // Store last viewed time in session storage
    const lastViewed = new Date().toLocaleString();
    sessionStorage.setItem('lastViewed', lastViewed);
    console.log('Session started at:', lastViewed);
}

// Load quotes from local storage
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        // Default quotes if none in storage
        quotes = [
            { text: "The only way to do great work is to love what you do.", category: "work" },
            { text: "Life is what happens when you're busy making other plans.", category: "life" },
            { text: "In the middle of difficulty lies opportunity.", category: "inspiration" }
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
    let filteredQuotes = quotes;

    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }

    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
        return;
    }

    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];

    quoteDisplay.innerHTML = `
        <p class="quote-text">"${quote.text}"</p>
        <p class="quote-category">— ${quote.category}</p>
    `;

    // Store last viewed quote in session storage
    sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Update the category filter dropdown
function updateCategoryFilter() {
    // Get all unique categories
    const categories = ['all', ...new Set(quotes.map(quote => quote.category))];

    // Clear existing options
    categorySelect.innerHTML = '';

    // Add new options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categorySelect.appendChild(option);
    });
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
    quotes.push({ text, category });

    // Save to local storage
    saveQuotes();

    // Update the category filter
    updateCategoryFilter();

    // Clear the form
    newQuoteText.value = '';
    newQuoteCategory.value = '';

    // Show a success message
    alert('Quote added successfully!');

    // Show the new quote
    categorySelect.value = category;
    showRandomQuote();
}

// Export quotes to JSON file
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'quotes.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid format: Expected an array of quotes');
            }

            quotes = importedQuotes;
            saveQuotes();
            updateCategoryFilter();
            showRandomQuote();
            alert(`Successfully imported ${importedQuotes.length} quotes!`);
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    fileReader.readAsText(file);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);