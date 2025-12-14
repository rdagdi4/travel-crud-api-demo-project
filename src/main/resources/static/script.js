// Global variables
let currentEditingId = null;
let allTravels = [];

// API Base URL
const API_BASE_URL = '/api/travels';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupTabNavigation();
    setupFormHandlers();
    setupSearchHandlers();
    loadTravels();
    setupDateDefaults();
}

// Tab Navigation
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
            
            // Load data when switching to specific tabs
            if (targetTab === 'dashboard') {
                loadTravels();
            } else if (targetTab === 'search-travel') {
                setupSearchType('all');
            }
        });
    });
}

// Setup Form Handlers
function setupFormHandlers() {
    // Add Travel Form
    const travelForm = document.getElementById('travel-form');
    travelForm.addEventListener('submit', handleAddTravel);
    
    // Edit Travel Form
    const editForm = document.getElementById('edit-travel-form');
    editForm.addEventListener('submit', handleEditTravel);
    
    // Search Form
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', handleSearch);
}

// Setup Search Handlers
function setupSearchHandlers() {
    const searchTabButtons = document.querySelectorAll('.search-tab-btn');
    searchTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const searchType = this.getAttribute('data-search-type');
            setupSearchType(searchType);
            
            // Update active state
            searchTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// Setup Date Defaults
function setupDateDefaults() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById('departureDate').value = today.toISOString().split('T')[0];
    document.getElementById('returnDate').value = nextWeek.toISOString().split('T')[0];
}

// API Functions
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return await response.text();
    } catch (error) {
        console.error('API Request failed:', error);
        showNotification('Error: ' + error.message, 'error');
        throw error;
    }
}

// Load all travels
async function loadTravels() {
    try {
        const travels = await apiRequest('');
        allTravels = travels;
        displayTravels(travels);
        updateStats(travels);
    } catch (error) {
        console.error('Failed to load travels:', error);
    }
}

// Display travels in table
function displayTravels(travels) {
    const tbody = document.getElementById('travels-tbody');
    
    if (travels.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="no-results">No travel records found</td></tr>';
        return;
    }
    
    tbody.innerHTML = travels.map(travel => `
        <tr>
            <td>${travel.id}</td>
            <td>${travel.origin}</td>
            <td>${travel.destination}</td>
            <td>${formatDate(travel.departureDate)}</td>
            <td>${formatDate(travel.returnDate)}</td>
            <td><span class="travel-type-badge">${travel.travelType}</span></td>
            <td>${travel.currency} ${travel.price.toFixed(2)}</td>
            <td>${travel.passengers}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editTravel(${travel.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="deleteTravel(${travel.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update dashboard statistics
function updateStats(travels) {
    const totalTravels = travels.length;
    const upcomingTravels = travels.filter(travel => {
        const departureDate = new Date(travel.departureDate);
        return departureDate > new Date();
    }).length;
    
    const totalCost = travels.reduce((sum, travel) => sum + travel.price, 0);
    const avgCost = totalTravels > 0 ? totalCost / totalTravels : 0;
    
    document.getElementById('total-travels').textContent = totalTravels;
    document.getElementById('upcoming-travels').textContent = upcomingTravels;
    document.getElementById('avg-cost').textContent = '$' + avgCost.toFixed(2);
}

// Handle Add Travel Form
async function handleAddTravel(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const travelData = Object.fromEntries(formData.entries());
    
    // Convert date strings to proper format
    travelData.departureDate = new Date(travelData.departureDate).toISOString().split('T')[0];
    travelData.returnDate = new Date(travelData.returnDate).toISOString().split('T')[0];
    travelData.price = parseFloat(travelData.price);
    travelData.passengers = parseInt(travelData.passengers);
    
    try {
        await apiRequest('', {
            method: 'POST',
            body: JSON.stringify(travelData)
        });
        
        showNotification('Travel record added successfully!', 'success');
        event.target.reset();
        setupDateDefaults(); // Reset dates
        loadTravels(); // Refresh the list
        
        // Switch to dashboard tab
        document.querySelector('[data-tab="dashboard"]').click();
        
    } catch (error) {
        console.error('Failed to add travel:', error);
    }
}

// Handle Edit Travel
async function handleEditTravel(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const travelData = Object.fromEntries(formData.entries());
    
    // Convert data types
    travelData.id = parseInt(travelData.id);
    travelData.departureDate = new Date(travelData.departureDate).toISOString().split('T')[0];
    travelData.returnDate = new Date(travelData.returnDate).toISOString().split('T')[0];
    travelData.price = parseFloat(travelData.price);
    travelData.passengers = parseInt(travelData.passengers);
    
    try {
        await apiRequest(`/${travelData.id}`, {
            method: 'PUT',
            body: JSON.stringify(travelData)
        });
        
        showNotification('Travel record updated successfully!', 'success');
        closeEditModal();
        loadTravels(); // Refresh the list
        
    } catch (error) {
        console.error('Failed to update travel:', error);
    }
}

// Edit Travel
function editTravel(id) {
    const travel = allTravels.find(t => t.id === id);
    if (!travel) return;
    
    // Populate edit form
    document.getElementById('edit-id').value = travel.id;
    document.getElementById('edit-origin').value = travel.origin;
    document.getElementById('edit-destination').value = travel.destination;
    document.getElementById('edit-departureDate').value = travel.departureDate;
    document.getElementById('edit-returnDate').value = travel.returnDate;
    document.getElementById('edit-travelType').value = travel.travelType;
    document.getElementById('edit-price').value = travel.price;
    document.getElementById('edit-currency').value = travel.currency;
    document.getElementById('edit-passengers').value = travel.passengers;
    document.getElementById('edit-notes').value = travel.notes || '';
    
    // Show modal
    document.getElementById('edit-modal').style.display = 'block';
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

// Delete Travel
async function deleteTravel(id) {
    if (!confirm('Are you sure you want to delete this travel record?')) {
        return;
    }
    
    try {
        await apiRequest(`/${id}`, {
            method: 'DELETE'
        });
        
        showNotification('Travel record deleted successfully!', 'success');
        loadTravels(); // Refresh the list
        
    } catch (error) {
        console.error('Failed to delete travel:', error);
    }
}

// Refresh Travels
function refreshTravels() {
    loadTravels();
    showNotification('Travel records refreshed!', 'success');
}

// Search Functions
function setupSearchType(searchType) {
    const searchInputs = document.getElementById('search-inputs');
    
    switch (searchType) {
        case 'all':
            searchInputs.innerHTML = `
                <button type="button" class="btn btn-primary" onclick="searchAllTravels()">
                    <i class="fas fa-list"></i> Show All Travels
                </button>
            `;
            break;
        case 'destination':
            searchInputs.innerHTML = `
                <div class="form-group">
                    <label for="search-destination">Destination</label>
                    <input type="text" id="search-destination" placeholder="Enter destination">
                </div>
            `;
            break;
        case 'origin':
            searchInputs.innerHTML = `
                <div class="form-group">
                    <label for="search-origin">Origin</label>
                    <input type="text" id="search-origin" placeholder="Enter origin">
                </div>
            `;
            break;
        case 'type':
            searchInputs.innerHTML = `
                <div class="form-group">
                    <label for="search-type">Travel Type</label>
                    <select id="search-type">
                        <option value="">Select Travel Type</option>
                        <option value="Round-trip">Round-trip</option>
                        <option value="One-way">One-way</option>
                        <option value="Multi-city">Multi-city</option>
                        <option value="Business">Business</option>
                        <option value="Leisure">Leisure</option>
                    </select>
                </div>
            `;
            break;
        case 'price':
            searchInputs.innerHTML = `
                <div class="form-group">
                    <label for="search-min-price">Min Price</label>
                    <input type="number" id="search-min-price" step="0.01" placeholder="0.00">
                </div>
                <div class="form-group">
                    <label for="search-max-price">Max Price</label>
                    <input type="number" id="search-max-price" step="0.01" placeholder="1000.00">
                </div>
            `;
            break;
    }
    
    // Clear previous results
    displaySearchResults([]);
}

// Handle Search
async function handleSearch(event) {
    event.preventDefault();
    
    const activeSearchTab = document.querySelector('.search-tab-btn.active');
    const searchType = activeSearchTab.getAttribute('data-search-type');
    
    try {
        let endpoint = '';
        let results = [];
        
        switch (searchType) {
            case 'destination':
                const destination = document.getElementById('search-destination').value;
                if (destination) {
                    endpoint = `/search/destination/${encodeURIComponent(destination)}`;
                    results = await apiRequest(endpoint);
                }
                break;
            case 'origin':
                const origin = document.getElementById('search-origin').value;
                if (origin) {
                    endpoint = `/search/origin/${encodeURIComponent(origin)}`;
                    results = await apiRequest(endpoint);
                }
                break;
            case 'type':
                const travelType = document.getElementById('search-type').value;
                if (travelType) {
                    endpoint = `/search/type/${encodeURIComponent(travelType)}`;
                    results = await apiRequest(endpoint);
                }
                break;
            case 'price':
                const minPrice = document.getElementById('search-min-price').value;
                const maxPrice = document.getElementById('search-max-price').value;
                if (minPrice && maxPrice) {
                    endpoint = `/search/price?minPrice=${minPrice}&maxPrice=${maxPrice}`;
                    results = await apiRequest(endpoint);
                }
                break;
        }
        
        displaySearchResults(results);
        
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// Search All Travels
async function searchAllTravels() {
    try {
        const results = await apiRequest('');
        displaySearchResults(results);
    } catch (error) {
        console.error('Failed to load all travels:', error);
    }
}

// Display Search Results
function displaySearchResults(travels) {
    const tbody = document.getElementById('search-results-tbody');
    const resultsCount = document.getElementById('results-count');
    
    // Update results count
    resultsCount.textContent = `${travels.length} result${travels.length !== 1 ? 's' : ''} found`;
    
    if (travels.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="no-results">No travel records found matching your criteria</td></tr>';
        return;
    }
    
    tbody.innerHTML = travels.map(travel => `
        <tr>
            <td>${travel.id}</td>
            <td>${travel.origin}</td>
            <td>${travel.destination}</td>
            <td>${formatDate(travel.departureDate)}</td>
            <td>${formatDate(travel.returnDate)}</td>
            <td><span class="travel-type-badge">${travel.travelType}</span></td>
            <td>${travel.currency} ${travel.price.toFixed(2)}</td>
            <td>${travel.passengers}</td>
        </tr>
    `).join('');
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    messageElement.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideNotification();
    }, 3000);
}

function hideNotification() {
    const notification = document.getElementById('notification');
    notification.style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('edit-modal');
    if (event.target === modal) {
        closeEditModal();
    }
}

// Add some CSS for travel type badges
const style = document.createElement('style');
style.textContent = `
    .travel-type-badge {
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
    }
`;
document.head.appendChild(style);