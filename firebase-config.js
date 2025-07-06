// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD7MD_4GF3e3-V9IMyuti0rusvb32QluF4",
    authDomain: "ansugistmedia.firebaseapp.com",
    projectId: "ansugistmedia",
    storageBucket: "ansugistmedia.firebasestorage.app",
    messagingSenderId: "119586245604",
    appId: "1:119586245604:web:f65d5d13d395a904c415f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Anonymous authentication for public access
signInAnonymously(auth).catch((error) => {
    console.error('Firebase auth error:', error);
});

// Firebase helper functions
const FirebaseService = {
    // Blog operations
    async addBlog(blogData) {
        try {
            const docRef = await addDoc(collection(db, 'blogs'), {
                ...blogData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding blog:', error);
            throw error;
        }
    },

    async getBlogs() {
        try {
            const querySnapshot = await getDocs(collection(db, 'blogs'));
            const blogs = [];
            querySnapshot.forEach((doc) => {
                blogs.push({ id: doc.id, ...doc.data() });
            });
            return blogs.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        } catch (error) {
            console.error('Error getting blogs:', error);
            return [];
        }
    },

    async updateBlog(blogId, blogData) {
        try {
            const blogRef = doc(db, 'blogs', blogId);
            await updateDoc(blogRef, {
                ...blogData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating blog:', error);
            throw error;
        }
    },

    async deleteBlog(blogId) {
        try {
            await deleteDoc(doc(db, 'blogs', blogId));
            return true;
        } catch (error) {
            console.error('Error deleting blog:', error);
            throw error;
        }
    },

    // Ticket operations
    async addTicket(ticketData) {
        try {
            const docRef = await addDoc(collection(db, 'tickets'), {
                ...ticketData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding ticket:', error);
            throw error;
        }
    },

    async getTickets() {
        try {
            const querySnapshot = await getDocs(collection(db, 'tickets'));
            const tickets = [];
            querySnapshot.forEach((doc) => {
                tickets.push({ id: doc.id, ...doc.data() });
            });
            return tickets.sort((a, b) => new Date(a.date) - new Date(b.date));
        } catch (error) {
            console.error('Error getting tickets:', error);
            return [];
        }
    },

    async updateTicket(ticketId, ticketData) {
        try {
            const ticketRef = doc(db, 'tickets', ticketId);
            await updateDoc(ticketRef, {
                ...ticketData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating ticket:', error);
            throw error;
        }
    },

    async deleteTicket(ticketId) {
        try {
            await deleteDoc(doc(db, 'tickets', ticketId));
            return true;
        } catch (error) {
            console.error('Error deleting ticket:', error);
            throw error;
        }
    },

    // Advertisement operations
    async addAd(adData) {
        try {
            const docRef = await addDoc(collection(db, 'ads'), {
                ...adData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding ad:', error);
            throw error;
        }
    },

    async getAds() {
        try {
            const querySnapshot = await getDocs(collection(db, 'ads'));
            const ads = [];
            querySnapshot.forEach((doc) => {
                ads.push({ id: doc.id, ...doc.data() });
            });
            return ads.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        } catch (error) {
            console.error('Error getting ads:', error);
            return [];
        }
    },

    async updateAd(adId, adData) {
        try {
            const adRef = doc(db, 'ads', adId);
            await updateDoc(adRef, {
                ...adData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating ad:', error);
            throw error;
        }
    },

    async deleteAd(adId) {
        try {
            await deleteDoc(doc(db, 'ads', adId));
            return true;
        } catch (error) {
            console.error('Error deleting ad:', error);
            throw error;
        }
    },

    // Carousel operations
    async addCarouselItem(type, itemData) {
        try {
            const docRef = await addDoc(collection(db, `carousel_${type}`), {
                ...itemData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error(`Error adding ${type} carousel item:`, error);
            throw error;
        }
    },

    async getCarouselItems(type) {
        try {
            const querySnapshot = await getDocs(collection(db, `carousel_${type}`));
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            return items.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());
        } catch (error) {
            console.error(`Error getting ${type} carousel items:`, error);
            return [];
        }
    },

    async updateCarouselItem(type, itemId, itemData) {
        try {
            const itemRef = doc(db, `carousel_${type}`, itemId);
            await updateDoc(itemRef, {
                ...itemData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error(`Error updating ${type} carousel item:`, error);
            throw error;
        }
    },

    async deleteCarouselItem(type, itemId) {
        try {
            await deleteDoc(doc(db, `carousel_${type}`, itemId));
            return true;
        } catch (error) {
            console.error(`Error deleting ${type} carousel item:`, error);
            throw error;
        }
    }
};

// Export for use in other files
window.FirebaseService = FirebaseService;
window.db = db;
window.auth = auth;