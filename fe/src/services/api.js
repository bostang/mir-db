import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- INTERCEPTOR: Otomatis Tambah Token Ke Setiap Request ---
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --- FUNGSI AUTENTIKASI ---
export const login = (credentials) => api.post('/auth/login', credentials);

// --- FUNGSI EXISTING (DISEDERHANAKAN) ---
export const getPeople = (page = 1, limit = 50, search = '') => 
    api.get('/people', { params: { page, limit, search } });

export const bulkCheckPeople = (emails) => api.post('/people/bulk-check', { emails });
export const getApps = () => api.get('/apps');
export const getAppById = (id) => api.get(`/apps/${id}`);
export const createApp = (appData) => api.post('/apps', appData);
export const updateApp = (id, appData) => api.put(`/apps/${id}`, appData);
export const deleteApp = (id) => api.delete(`/apps/${id}`);
export const getPeopleByAppId = (appId) => api.get(`/apps/${appId}/people`);
export const getAppsByPeopleNpp = (npp) => api.get(`/people/${npp}/apps`);
export const getPeopleByNpp = (npp) => api.get(`/people/${npp}`);
export const updatePeople = (npp, peopleData) => api.put(`/people/${npp}`, peopleData);
export const createPeople = (peopleData) => api.post('/people', peopleData);
export const deletePeople = (npp) => api.delete(`/people/${npp}`);
export const addAppPeopleRelation = (relationData) => api.post('/app-people-map', relationData);
export const getAppPeopleRelations = () => api.get('/app-people-map');
export const deleteAppPeopleRelation = (application_id, npp) => api.delete('/app-people-map', { data: { application_id, npp } });
export const downloadAppsCsv = () => api.get('/apps/download/csv', { responseType: 'blob' });
export const downloadPeopleCsv = () => api.get('/people/download/csv', { responseType: 'blob' });
export const downloadAppPeopleRelationsCsv = () => api.get('/app-people-map/download/csv', { responseType: 'blob' });
export const updateAppPeopleRelation = (relationData) => api.put('/app-people-map', relationData);
export const downloadLinksCsv = () => api.get('/links/download/csv', { responseType: 'blob' });
export const getLinks = () => api.get('/links');
export const createLink = (linkData) => api.post('/links', linkData);
export const updateLink = (applicationId, linkData) => api.put(`/links/${applicationId}`, linkData);
export const deleteLink = (applicationId) => api.delete(`/links/${applicationId}`);
export const instantRegisterPIC = (data) => api.post('/app-people-map/instant-register', data);
export const bulkUpdatePeopleCompany = (data) => api.put('/people/bulk-update', data);
export const bulkInsertPeople = (data) => api.post('/people/bulk-insert', { people: data });
export const bulkDeletePeople = (npps) => api.delete('/people/bulk-delete', { data: { npps } });
export const getRelations = () => api.get('/app-people-map');
export const bulkInsertRelations = (relations) => api.post('/app-people-map/bulk-insert', { relations });
export const bulkDeleteRelations = (relations) => api.delete('/app-people-map/bulk-delete', { data: { relations } });
export const bulkUpdateRelations = (data) => api.put('/app-people-map/bulk-update', data);
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;