// Initial quotes array
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "work" },
    { text: "Life is what happens when you're busy making other plans.", category: "life" },
    { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
    { text: "Simplicity is the ultimate sophistication.", category: "wisdom" },
    { text: "Whatever you are, be a good one.", category: "wisdom" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');

// Initialize the application
function init() {
    // Populate category dropdown
    updateCategoryFilter();

    // Display a random quote on page load
    showRandomQuote();

    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    categorySelect.addEventListener('change', showRandomQuote);
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

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);