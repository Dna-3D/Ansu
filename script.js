// Global variables
let currentTheme = localStorage.getItem('theme') || 'light';
let isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeNavigation();
    initializeContent();
    initializeSearch();
});

// Theme management
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('#darkModeToggle i');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Navigation management
function initializeNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Content initialization based on current page
function initializeContent() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (currentPage) {
        case 'index.html':
        case '':
            loadHomePage();
            break;
        case 'blog.html':
            loadBlogPage();
            break;
        case 'tickets.html':
            loadTicketsPage();
            break;
        case 'ads.html':
            loadAdsPage();
            break;
        case 'admin.html':
            // Admin page is handled by admin.js
            break;
    }
}

// Home page functionality
function loadHomePage() {
    loadCarousel('featured', 'featuredCarousel');
    loadCarousel('events', 'eventsCarousel');
}

async function loadCarousel(type, carouselId) {
    const carouselData = await getCarouselData(type);
    const carousel = document.getElementById(carouselId);
    
    if (!carousel) return;
    
    const carouselInner = carousel.querySelector('.carousel-inner');
    const indicators = carousel.querySelector('.carousel-indicators');
    
    if (carouselData.length === 0) {
        carouselInner.innerHTML = `
            <div class="carousel-item active">
                <img src="https://via.placeholder.com/800x400/dc3545/ffffff?text=No+Content+Available" 
                     class="d-block w-100" alt="No content">
                <div class="carousel-caption">
                    <h5>No content available</h5>
                    <p>Please check back later or contact the administrator.</p>
                </div>
            </div>
        `;
        return;
    }
    
    carouselInner.innerHTML = '';
    indicators.innerHTML = '';
    
    carouselData.forEach((item, index) => {
        // Create carousel item
        const carouselItem = document.createElement('div');
        carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
        carouselItem.innerHTML = `
            <img src="${item.image}" class="d-block w-100" alt="${item.title}">
            <div class="carousel-caption">
                <h5>${item.title}</h5>
                <p>${item.description}</p>
            </div>
        `;
        carouselInner.appendChild(carouselItem);
        
        // Create indicator
        const indicator = document.createElement('button');
        indicator.type = 'button';
        indicator.setAttribute('data-bs-target', `#${carouselId}`);
        indicator.setAttribute('data-bs-slide-to', index);
        if (index === 0) indicator.classList.add('active');
        indicators.appendChild(indicator);
    });
}

async function getCarouselData(type) {
    const collectionName = type === 'featured' ? 'featured' : 'events';
    
    if (!window.db || !window.firebaseModules) {
        console.warn('Firebase not yet initialized, returning empty array');
        return [];
    }
    
    try {
        const { collection, getDocs } = window.firebaseModules;
        const querySnapshot = await getDocs(collection(window.db, `carousel_${collectionName}`));
        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        return items.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
        });
    } catch (error) {
        console.error(`Error getting ${type} carousel data:`, error);
        return [];
    }
}

// Blog page functionality
async function loadBlogPage() {
    if (!window.db || !window.firebaseModules) {
        console.warn('Firebase not yet initialized');
        setTimeout(loadBlogPage, 1000); // Retry after 1 second
        return;
    }

    try {
        const { collection, getDocs } = window.firebaseModules;
        const querySnapshot = await getDocs(collection(window.db, 'blogs'));
        const blogs = [];
        querySnapshot.forEach((doc) => {
            blogs.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by creation date (newest first)
        blogs.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
        });

        const blogContainer = document.getElementById('blogPosts');
        const emptyState = document.getElementById('emptyState');
        
        if (blogs.length === 0) {
            blogContainer.innerHTML = '';
            emptyState.classList.remove('d-none');
            return;
        }
        
        emptyState.classList.add('d-none');
        blogContainer.innerHTML = '';
        
        blogs.forEach(blog => {
            const blogCard = createBlogCard(blog);
            blogContainer.appendChild(blogCard);
        });
    } catch (error) {
        console.error('Error loading blogs:', error);
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.classList.remove('d-none');
            emptyState.innerHTML = `
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="text-muted">Error loading blogs</h4>
                <p class="text-muted">There was an error connecting to the database. Please try again later.</p>
            `;
        }
    }
}

function createBlogCard(blog) {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';
    
    col.innerHTML = `
        <div class="card blog-card h-100" onclick="showBlogModal('${blog.id}')">
            <img src="${blog.image}" class="card-img-top" alt="${blog.title}">
            <div class="card-body">
                <h5 class="card-title">${blog.title}</h5>
                <p class="card-text text-truncate-3">${blog.content}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${formatDate(blog.date)}</small>
                    <span class="badge bg-primary">${blog.category || 'General'}</span>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

async function showBlogModal(blogId) {
    if (!window.db || !window.firebaseModules) {
        console.warn('Firebase not initialized');
        return;
    }

    try {
        const { doc, getDoc } = window.firebaseModules;
        const blogDoc = await getDoc(doc(window.db, 'blogs', blogId));
        
        if (!blogDoc.exists()) {
            console.error('Blog not found');
            return;
        }
        
        const blog = blogDoc.data();
        
        document.getElementById('blogModalTitle').textContent = blog.title;
        document.getElementById('blogModalImage').src = blog.image;
        document.getElementById('blogModalContent').innerHTML = blog.content;
        document.getElementById('blogModalDate').textContent = formatDate(blog.date || blog.createdAt?.toDate());
        
        const modal = new bootstrap.Modal(document.getElementById('blogModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading blog:', error);
    }
}

// Tickets page functionality
async function loadTicketsPage() {
    if (!window.db || !window.firebaseModules) {
        console.warn('Firebase not yet initialized');
        setTimeout(loadTicketsPage, 1000);
        return;
    }

    try {
        const { collection, getDocs } = window.firebaseModules;
        const querySnapshot = await getDocs(collection(window.db, 'tickets'));
        const tickets = [];
        querySnapshot.forEach((doc) => {
            tickets.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by event date
        tickets.sort((a, b) => new Date(a.date) - new Date(b.date));

        const ticketsContainer = document.getElementById('ticketsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (tickets.length === 0) {
            ticketsContainer.innerHTML = '';
            emptyState.classList.remove('d-none');
            return;
        }
        
        emptyState.classList.add('d-none');
        ticketsContainer.innerHTML = '';
        
        tickets.forEach(ticket => {
            const ticketCard = createTicketCard(ticket);
            ticketsContainer.appendChild(ticketCard);
        });
    } catch (error) {
        console.error('Error loading tickets:', error);
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.classList.remove('d-none');
            emptyState.innerHTML = `
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="text-muted">Error loading tickets</h4>
                <p class="text-muted">There was an error connecting to the database. Please try again later.</p>
            `;
        }
    }
}

function createTicketCard(ticket) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    col.innerHTML = `
        <div class="card ticket-card h-100">
            <img src="${ticket.image}" class="card-img-top" alt="${ticket.title}">
            <div class="card-body">
                <h5 class="card-title">${ticket.title}</h5>
                <p class="card-text">${ticket.description}</p>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="price">$${ticket.price}</span>
                    <small class="text-muted">
                        <i class="fas fa-calendar-alt me-1"></i>
                        ${formatDate(ticket.date)}
                    </small>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                        <i class="fas fa-map-marker-alt me-1"></i>
                        ${ticket.location}
                    </small>
                    <a href="https://wa.me/${ticket.whatsapp}?text=${encodeURIComponent(`I'm interested in ${ticket.title} ticket`)}" 
                       class="btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        Buy Now
                    </a>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Ads page functionality
async function loadAdsPage() {
    if (!window.db || !window.firebaseModules) {
        console.warn('Firebase not yet initialized');
        setTimeout(loadAdsPage, 1000);
        return;
    }

    try {
        const { collection, getDocs } = window.firebaseModules;
        const querySnapshot = await getDocs(collection(window.db, 'ads'));
        const ads = [];
        querySnapshot.forEach((doc) => {
            ads.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by creation date (newest first)
        ads.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
        });

        const adsContainer = document.getElementById('adsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (ads.length === 0) {
            adsContainer.innerHTML = '';
            emptyState.classList.remove('d-none');
            return;
        }
        
        emptyState.classList.add('d-none');
        adsContainer.innerHTML = '';
        
        ads.forEach(ad => {
            const adCard = createAdCard(ad);
            adsContainer.appendChild(adCard);
        });
    } catch (error) {
        console.error('Error loading ads:', error);
        const emptyState = document.getElementById('emptyState');
        if (emptyState) {
            emptyState.classList.remove('d-none');
            emptyState.innerHTML = `
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 class="text-muted">Error loading advertisements</h4>
                <p class="text-muted">There was an error connecting to the database. Please try again later.</p>
            `;
        }
    }
}

function createAdCard(ad) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4';
    
    col.innerHTML = `
        <div class="card ad-card h-100">
            <img src="${ad.image}" class="card-img-top" alt="${ad.title}">
            <div class="card-body">
                <h5 class="card-title">${ad.title}</h5>
                <p class="card-text">${ad.description}</p>
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="badge bg-primary">${ad.category}</span>
                    <small class="text-muted">
                        <i class="fas fa-clock me-1"></i>
                        ${formatDate(ad.date)}
                    </small>
                </div>
                <div class="text-center">
                    <a href="https://wa.me/${ad.whatsapp}?text=${encodeURIComponent(`I'm interested in ${ad.title}`)}" 
                       class="btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        Contact Now
                    </a>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const blogs = JSON.parse(localStorage.getItem('blogs')) || [];
    
    if (!searchTerm) {
        loadBlogPage();
        return;
    }
    
    const filteredBlogs = blogs.filter(blog => 
        blog.title.toLowerCase().includes(searchTerm) ||
        blog.content.toLowerCase().includes(searchTerm) ||
        (blog.category && blog.category.toLowerCase().includes(searchTerm))
    );
    
    const blogContainer = document.getElementById('blogPosts');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredBlogs.length === 0) {
        blogContainer.innerHTML = '';
        emptyState.classList.remove('d-none');
        emptyState.innerHTML = `
            <i class="fas fa-search fa-3x text-muted mb-3"></i>
            <h4 class="text-muted">No results found</h4>
            <p class="text-muted">No blog posts match your search term: "${searchTerm}"</p>
        `;
        return;
    }
    
    emptyState.classList.add('d-none');
    blogContainer.innerHTML = '';
    
    filteredBlogs.forEach(blog => {
        const blogCard = createBlogCard(blog);
        blogContainer.appendChild(blogCard);
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function validateForm(formData, requiredFields) {
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!formData[field] || formData[field].toString().trim() === '') {
            errors.push(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
    });
    
    return errors;
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.insertBefore(alertDiv, document.body.firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Image validation and preview
function validateImageUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    showAlert('An error occurred. Please refresh the page and try again.', 'danger');
});

// Service worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Export functions for use in other scripts
window.ansugistUtils = {
    formatDate,
    generateId,
    validateForm,
    showAlert,
    validateImageUrl,
    previewImage
};
