// Admin panel functionality
class AdminPanel {
    constructor() {
        this.currentSection = 'blogs';
        this.currentItem = null;
        this.initializeAdmin();
    }

    initializeAdmin() {
        this.checkLogin();
        this.bindEvents();
        this.loadSection('blogs');
    }

    checkLogin() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        const loginScreen = document.getElementById('loginScreen');
        const adminPanel = document.getElementById('adminPanel');

        if (isLoggedIn) {
            loginScreen.classList.add('d-none');
            adminPanel.classList.remove('d-none');
        } else {
            loginScreen.classList.remove('d-none');
            adminPanel.classList.add('d-none');
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Section navigation
        const sectionButtons = document.querySelectorAll('[data-section]');
        sectionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.loadSection(section);
            });
        });

        // Save button
        const saveBtn = document.getElementById('saveItem');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveItem());
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const adminPassword = '@nsugist@11';

        if (password === adminPassword) {
            localStorage.setItem('adminLoggedIn', 'true');
            this.checkLogin();
        } else {
            document.getElementById('loginError').classList.remove('d-none');
        }
    }

    handleLogout() {
        localStorage.removeItem('adminLoggedIn');
        this.checkLogin();
    }

    async loadSection(section) {
        this.currentSection = section;
        
        // Update active button
        document.querySelectorAll('[data-section]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Load content
        const content = document.getElementById('adminContent');
        content.innerHTML = '<div class="text-center"><div class="spinner"></div><p>Loading...</p></div>';
        
        try {
            switch (section) {
                case 'blogs':
                    content.innerHTML = await this.generateBlogsTable();
                    break;
                case 'tickets':
                    content.innerHTML = await this.generateTicketsTable();
                    break;
                case 'ads':
                    content.innerHTML = await this.generateAdsTable();
                    break;
                case 'carousel':
                    content.innerHTML = await this.generateCarouselTable();
                    break;
            }
        } catch (error) {
            console.error('Error loading section:', error);
            content.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error loading ${section}. Please try again.
                </div>
            `;
        }

        this.bindTableEvents();
    }

    async generateBlogsTable() {
        if (!window.db || !window.firebaseModules) {
            throw new Error('Firebase not initialized');
        }

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
        
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Manage Blog Posts</h3>
                <button class="btn btn-primary" onclick="admin.addItem('blog')">
                    <i class="fas fa-plus me-2"></i>Add Blog Post
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${blogs.map(blog => `
                            <tr>
                                <td><img src="${blog.image}" class="img-thumbnail" alt="${blog.title}"></td>
                                <td>${blog.title}</td>
                                <td><span class="badge bg-secondary">${blog.category || 'General'}</span></td>
                                <td>${window.ansugistUtils.formatDate(blog.date)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-2" onclick="admin.editItem('blog', '${blog.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteItem('blog', '${blog.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async generateTicketsTable() {
        if (!window.db || !window.firebaseModules) {
            throw new Error('Firebase not initialized');
        }

        const { collection, getDocs } = window.firebaseModules;
        const querySnapshot = await getDocs(collection(window.db, 'tickets'));
        const tickets = [];
        querySnapshot.forEach((doc) => {
            tickets.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by creation date (newest first)
        tickets.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
        });
        
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Manage Tickets</h3>
                <button class="btn btn-primary" onclick="admin.addItem('ticket')">
                    <i class="fas fa-plus me-2"></i>Add Ticket
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Date</th>
                            <th>WhatsApp</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tickets.map(ticket => `
                            <tr>
                                <td><img src="${ticket.image}" class="img-thumbnail" alt="${ticket.title}"></td>
                                <td>${ticket.title}</td>
                                <td>$${ticket.price}</td>
                                <td>${window.ansugistUtils.formatDate(ticket.date)}</td>
                                <td>${ticket.whatsapp}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-2" onclick="admin.editItem('ticket', '${ticket.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteItem('ticket', '${ticket.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async generateAdsTable() {
        if (!window.db || !window.firebaseModules) {
            throw new Error('Firebase not initialized');
        }

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
        
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3>Manage Advertisements</h3>
                <button class="btn btn-primary" onclick="admin.addItem('ad')">
                    <i class="fas fa-plus me-2"></i>Add Advertisement
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>WhatsApp</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ads.map(ad => `
                            <tr>
                                <td><img src="${ad.image}" class="img-thumbnail" alt="${ad.title}"></td>
                                <td>${ad.title}</td>
                                <td><span class="badge bg-secondary">${ad.category}</span></td>
                                <td>${window.ansugistUtils.formatDate(ad.date)}</td>
                                <td>${ad.whatsapp}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary me-2" onclick="admin.editItem('ad', '${ad.id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteItem('ad', '${ad.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    async generateCarouselTable() {
        if (!window.db || !window.firebaseModules) {
            throw new Error('Firebase not initialized');
        }

        const { collection, getDocs } = window.firebaseModules;
        
        // Get featured carousel items
        const featuredSnapshot = await getDocs(collection(window.db, 'featuredCarousel'));
        const featured = [];
        featuredSnapshot.forEach((doc) => {
            featured.push({ id: doc.id, ...doc.data() });
        });
        
        // Get events carousel items
        const eventsSnapshot = await getDocs(collection(window.db, 'eventsCarousel'));
        const events = [];
        eventsSnapshot.forEach((doc) => {
            events.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort both by creation date
        featured.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
        });
        
        events.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
                return b.createdAt.toDate() - a.createdAt.toDate();
            }
            return 0;
        });
        
        return `
            <div class="row">
                <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4>Featured Carousel</h4>
                        <button class="btn btn-primary btn-sm" onclick="admin.addItem('featured')">
                            <i class="fas fa-plus me-2"></i>Add Featured
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${featured.map(item => `
                                    <tr>
                                        <td><img src="${item.image}" class="img-thumbnail" alt="${item.title}"></td>
                                        <td>${item.title}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-2" onclick="admin.editItem('featured', '${item.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteItem('featured', '${item.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h4>Events Carousel</h4>
                        <button class="btn btn-primary btn-sm" onclick="admin.addItem('events')">
                            <i class="fas fa-plus me-2"></i>Add Event
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-striped admin-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${events.map(item => `
                                    <tr>
                                        <td><img src="${item.image}" class="img-thumbnail" alt="${item.title}"></td>
                                        <td>${item.title}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-2" onclick="admin.editItem('events', '${item.id}')">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="admin.deleteItem('events', '${item.id}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    bindTableEvents() {
        // Events are bound through onclick attributes in the HTML
    }

    addItem(type) {
        this.currentItem = null;
        this.showEditModal(type);
    }

    async editItem(type, id) {
        this.currentItem = { type, id };
        await this.showEditModal(type, id);
    }

    async showEditModal(type, id = null) {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('editModalTitle');
        const formContent = document.getElementById('editFormContent');

        // Set modal title
        title.textContent = id ? `Edit ${type}` : `Add ${type}`;

        // Generate form based on type
        let formHTML = '';
        let existingData = {};

        if (id) {
            try {
                existingData = await this.getItemData(type, id);
            } catch (error) {
                console.error('Error loading item data:', error);
                window.ansugistUtils.showAlert('Error loading item data', 'error');
                return;
            }
        }

        switch (type) {
            case 'blog':
                formHTML = this.generateBlogForm(existingData);
                break;
            case 'ticket':
                formHTML = this.generateTicketForm(existingData);
                break;
            case 'ad':
                formHTML = this.generateAdForm(existingData);
                break;
            case 'featured':
            case 'events':
                formHTML = this.generateCarouselForm(existingData);
                break;
        }

        formContent.innerHTML = formHTML;
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    }

    generateBlogForm(data) {
        return `
            <div class="mb-3">
                <label for="blogTitle" class="form-label">Title</label>
                <input type="text" class="form-control" id="blogTitle" value="${data.title || ''}" required>
            </div>
            <div class="mb-3">
                <label for="blogCategory" class="form-label">Category</label>
                <input type="text" class="form-control" id="blogCategory" value="${data.category || ''}" placeholder="e.g., Education, Events">
            </div>
            <div class="mb-3">
                <label for="blogImage" class="form-label">Image URL</label>
                <input type="url" class="form-control" id="blogImage" value="${data.image || ''}" required>
            </div>
            <div class="mb-3">
                <label for="blogContent" class="form-label">Content</label>
                <textarea class="form-control" id="blogContent" rows="5" required>${data.content || ''}</textarea>
            </div>
            <div class="mb-3">
                <label for="blogDate" class="form-label">Date</label>
                <input type="date" class="form-control" id="blogDate" value="${data.date || new Date().toISOString().split('T')[0]}" required>
            </div>
        `;
    }

    generateTicketForm(data) {
        return `
            <div class="mb-3">
                <label for="ticketTitle" class="form-label">Title</label>
                <input type="text" class="form-control" id="ticketTitle" value="${data.title || ''}" required>
            </div>
            <div class="mb-3">
                <label for="ticketDescription" class="form-label">Description</label>
                <textarea class="form-control" id="ticketDescription" rows="3" required>${data.description || ''}</textarea>
            </div>
            <div class="mb-3">
                <label for="ticketPrice" class="form-label">Price</label>
                <input type="number" class="form-control" id="ticketPrice" value="${data.price || ''}" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="ticketLocation" class="form-label">Location</label>
                <input type="text" class="form-control" id="ticketLocation" value="${data.location || ''}" required>
            </div>
            <div class="mb-3">
                <label for="ticketImage" class="form-label">Image URL</label>
                <input type="url" class="form-control" id="ticketImage" value="${data.image || ''}" required>
            </div>
            <div class="mb-3">
                <label for="ticketDate" class="form-label">Event Date</label>
                <input type="date" class="form-control" id="ticketDate" value="${data.date || ''}" required>
            </div>
            <div class="mb-3">
                <label for="ticketWhatsapp" class="form-label">WhatsApp Number</label>
                <input type="tel" class="form-control" id="ticketWhatsapp" value="${data.whatsapp || ''}" placeholder="1234567890" required>
            </div>
        `;
    }

    generateAdForm(data) {
        return `
            <div class="mb-3">
                <label for="adTitle" class="form-label">Title</label>
                <input type="text" class="form-control" id="adTitle" value="${data.title || ''}" required>
            </div>
            <div class="mb-3">
                <label for="adCategory" class="form-label">Category</label>
                <select class="form-control" id="adCategory" required>
                    <option value="">Select Category</option>
                    <option value="Tutoring" ${data.category === 'Tutoring' ? 'selected' : ''}>Tutoring</option>
                    <option value="Books" ${data.category === 'Books' ? 'selected' : ''}>Books</option>
                    <option value="Supplies" ${data.category === 'Supplies' ? 'selected' : ''}>Supplies</option>
                    <option value="Services" ${data.category === 'Services' ? 'selected' : ''}>Services</option>
                    <option value="Other" ${data.category === 'Other' ? 'selected' : ''}>Other</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="adDescription" class="form-label">Description</label>
                <textarea class="form-control" id="adDescription" rows="3" required>${data.description || ''}</textarea>
            </div>
            <div class="mb-3">
                <label for="adImage" class="form-label">Image URL</label>
                <input type="url" class="form-control" id="adImage" value="${data.image || ''}" required>
            </div>
            <div class="mb-3">
                <label for="adWhatsapp" class="form-label">WhatsApp Number</label>
                <input type="tel" class="form-control" id="adWhatsapp" value="${data.whatsapp || ''}" placeholder="1234567890" required>
            </div>
        `;
    }

    generateCarouselForm(data) {
        return `
            <div class="mb-3">
                <label for="carouselTitle" class="form-label">Title</label>
                <input type="text" class="form-control" id="carouselTitle" value="${data.title || ''}" required>
            </div>
            <div class="mb-3">
                <label for="carouselDescription" class="form-label">Description</label>
                <textarea class="form-control" id="carouselDescription" rows="3" required>${data.description || ''}</textarea>
            </div>
            <div class="mb-3">
                <label for="carouselImage" class="form-label">Image URL</label>
                <input type="url" class="form-control" id="carouselImage" value="${data.image || ''}" required>
            </div>
        `;
    }

    async getItemData(type, id) {
        if (!window.db || !window.firebaseModules) {
            throw new Error('Firebase not initialized');
        }

        let collectionName;
        switch (type) {
            case 'blog':
                collectionName = 'blogs';
                break;
            case 'ticket':
                collectionName = 'tickets';
                break;
            case 'ad':
                collectionName = 'ads';
                break;
            case 'featured':
                collectionName = 'featuredCarousel';
                break;
            case 'events':
                collectionName = 'eventsCarousel';
                break;
        }

        const { doc, getDoc } = window.firebaseModules;
        const docRef = doc(window.db, collectionName, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            return {};
        }
    }

    async saveItem() {
        if (!window.db || !window.firebaseModules) {
            window.ansugistUtils.showAlert('Database not available', 'error');
            return;
        }

        try {
            if (!this.currentItem) {
                // Adding new item
                const type = this.getFormType();
                const data = this.getFormData(type);
                
                if (this.validateFormData(data, type)) {
                    await this.saveToFirebase(type, data);
                    this.closeModal();
                    await this.loadSection(this.currentSection);
                    window.ansugistUtils.showAlert('Item added successfully!');
                }
            } else {
                // Editing existing item
                const data = this.getFormData(this.currentItem.type);
                
                if (this.validateFormData(data, this.currentItem.type)) {
                    await this.updateInFirebase(this.currentItem.type, this.currentItem.id, data);
                    this.closeModal();
                    await this.loadSection(this.currentSection);
                    window.ansugistUtils.showAlert('Item updated successfully!');
                }
            }
        } catch (error) {
            console.error('Error saving item:', error);
            window.ansugistUtils.showAlert('Error saving item. Please try again.', 'error');
        }
    }

    getFormType() {
        // Determine form type based on current section
        if (this.currentSection === 'blogs') return 'blog';
        if (this.currentSection === 'tickets') return 'ticket';
        if (this.currentSection === 'ads') return 'ad';
        if (this.currentSection === 'carousel') {
            // Check which carousel form is being used
            const featuredTitle = document.getElementById('carouselTitle');
            return featuredTitle ? 'featured' : 'events';
        }
        return 'blog';
    }

    getFormData(type) {
        const data = {};
        
        switch (type) {
            case 'blog':
                data.title = document.getElementById('blogTitle').value;
                data.category = document.getElementById('blogCategory').value;
                data.image = document.getElementById('blogImage').value;
                data.content = document.getElementById('blogContent').value;
                data.date = document.getElementById('blogDate').value;
                break;
            case 'ticket':
                data.title = document.getElementById('ticketTitle').value;
                data.description = document.getElementById('ticketDescription').value;
                data.price = parseFloat(document.getElementById('ticketPrice').value);
                data.location = document.getElementById('ticketLocation').value;
                data.image = document.getElementById('ticketImage').value;
                data.date = document.getElementById('ticketDate').value;
                data.whatsapp = document.getElementById('ticketWhatsapp').value;
                break;
            case 'ad':
                data.title = document.getElementById('adTitle').value;
                data.category = document.getElementById('adCategory').value;
                data.description = document.getElementById('adDescription').value;
                data.image = document.getElementById('adImage').value;
                data.whatsapp = document.getElementById('adWhatsapp').value;
                data.date = new Date().toISOString().split('T')[0];
                break;
            case 'featured':
            case 'events':
                data.title = document.getElementById('carouselTitle').value;
                data.description = document.getElementById('carouselDescription').value;
                data.image = document.getElementById('carouselImage').value;
                break;
        }
        
        return data;
    }

    validateFormData(data, type) {
        const requiredFields = this.getRequiredFields(type);
        const errors = window.ansugistUtils.validateForm(data, requiredFields);
        
        if (errors.length > 0) {
            window.ansugistUtils.showAlert(errors.join('<br>'), 'danger');
            return false;
        }
        
        return true;
    }

    getRequiredFields(type) {
        switch (type) {
            case 'blog':
                return ['title', 'image', 'content', 'date'];
            case 'ticket':
                return ['title', 'description', 'price', 'location', 'image', 'date', 'whatsapp'];
            case 'ad':
                return ['title', 'category', 'description', 'image', 'whatsapp'];
            case 'featured':
            case 'events':
                return ['title', 'description', 'image'];
            default:
                return [];
        }
    }

    async saveToFirebase(type, data) {
        const { collection, addDoc } = window.firebaseModules;
        
        let collectionName;
        switch (type) {
            case 'blog':
                collectionName = 'blogs';
                break;
            case 'ticket':
                collectionName = 'tickets';
                break;
            case 'ad':
                collectionName = 'ads';
                break;
            case 'featured':
                collectionName = 'featuredCarousel';
                break;
            case 'events':
                collectionName = 'eventsCarousel';
                break;
        }

        // Add timestamp for sorting
        data.createdAt = new Date();
        
        const docRef = await addDoc(collection(window.db, collectionName), data);
        return docRef.id;
    }

    async updateInFirebase(type, id, data) {
        const { doc, updateDoc } = window.firebaseModules;
        
        let collectionName;
        switch (type) {
            case 'blog':
                collectionName = 'blogs';
                break;
            case 'ticket':
                collectionName = 'tickets';
                break;
            case 'ad':
                collectionName = 'ads';
                break;
            case 'featured':
                collectionName = 'featuredCarousel';
                break;
            case 'events':
                collectionName = 'eventsCarousel';
                break;
        }

        // Add update timestamp
        data.updatedAt = new Date();
        
        const docRef = doc(window.db, collectionName, id);
        await updateDoc(docRef, data);
    }

    async deleteItem(type, id) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const { doc, deleteDoc } = window.firebaseModules;
                
                let collectionName;
                switch (type) {
                    case 'blog':
                        collectionName = 'blogs';
                        break;
                    case 'ticket':
                        collectionName = 'tickets';
                        break;
                    case 'ad':
                        collectionName = 'ads';
                        break;
                    case 'featured':
                        collectionName = 'featuredCarousel';
                        break;
                    case 'events':
                        collectionName = 'eventsCarousel';
                        break;
                }

                const docRef = doc(window.db, collectionName, id);
                await deleteDoc(docRef);
                
                await this.loadSection(this.currentSection);
                window.ansugistUtils.showAlert('Item deleted successfully!');
            } catch (error) {
                console.error('Error deleting item:', error);
                window.ansugistUtils.showAlert('Error deleting item. Please try again.', 'error');
            }
        }
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        if (modal) {
            modal.hide();
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.admin = new AdminPanel();
});
