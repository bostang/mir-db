import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti jika port backend berbeda

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fungsi untuk mendapatkan semua PIC
// export const getPeople = () => api.get('/people');
// Tambahkan parameter page, limit, dan search
export const getPeople = (page = 1, limit = 50, search = '') => 
    api.get('/people', { 
        params: { page, limit, search } 
    });

export const bulkCheckPeople = (emails) => 
    api.post('/people/bulk-check', { emails });

// Fungsi untuk mendapatkan semua aplikasi
export const getApps = () => api.get('/apps');

export const getAppById = (id) => api.get(`/apps/${id}`);
export const createApp = (appData) => api.post('/apps', appData);
export const updateApp = (id, appData) => api.put(`/apps/${id}`, appData);
export const deleteApp = (id) => api.delete(`/apps/${id}`);

export const getPeopleByAppId = (appId) => api.get(`/apps/${appId}/people`);
export const getAppsByPeopleNpp = (npp) => api.get(`/people/${npp}/apps`);
export const getPeopleByNpp = (npp) => api.get(`/people/${npp}`);

// Fungsi untuk mengupdate PIC
export const updatePeople = (npp, peopleData) => api.put(`/people/${npp}`, peopleData);

// Fungsi untuk membuat PIC baru
export const createPeople = (peopleData) => api.post('/people', peopleData);

// Fungsi untuk menghapus PIC
export const deletePeople = (npp) => api.delete(`/people/${npp}`);

// Fungsi untuk menambahkan relasi App-PIC
export const addAppPeopleRelation = (relationData) => api.post('/app-people-map', relationData);

// Fungsi untuk mendapatkan semua relasi App-PIC
export const getAppPeopleRelations = () => api.get('/app-people-map');

// Fungsi untuk menghapus relasi App-PIC
export const deleteAppPeopleRelation = (application_id, npp) => api.delete('/app-people-map', { data: { application_id, npp } });

// Fungsi untuk mengunduh data aplikasi sebagai CSV
export const downloadAppsCsv = () => api.get('/apps/download/csv', { responseType: 'blob' });

// Fungsi untuk mengunduh data PIC sebagai CSV
export const downloadPeopleCsv = () => api.get('/people/download/csv', { responseType: 'blob' });

// Fungsi untuk mengunduh data relasi sebagai CSV
export const downloadAppPeopleRelationsCsv = () => api.get('/app-people-map/download/csv', { responseType: 'blob' });

// fungsi update relasi
export const updateAppPeopleRelation = (relationData) => api.put('/app-people-map', relationData);

// Tambahkan ini di bagian bawah api.js
export const downloadLinksCsv = () => api.get('/links/download/csv', { responseType: 'blob' });

export const getLinks = () => api.get('/links');
export const createLink = (linkData) => api.post('/links', linkData);
export const updateLink = (applicationId, linkData) => api.put(`/links/${applicationId}`, linkData);
export const deleteLink = (applicationId) => api.delete(`/links/${applicationId}`);