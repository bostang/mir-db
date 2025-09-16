import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Ganti jika port backend berbeda

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fungsi untuk mendapatkan semua PIC
export const getPics = () => api.get('/pics');

// Fungsi untuk mendapatkan semua aplikasi
export const getApps = () => api.get('/apps');

export const getAppById = (id) => api.get(`/apps/${id}`);
export const createApp = (appData) => api.post('/apps', appData);
export const updateApp = (id, appData) => api.put(`/apps/${id}`, appData);
export const deleteApp = (id) => api.delete(`/apps/${id}`);

export const getPicsByAppId = (appId) => api.get(`/apps/${appId}/pics`);
export const getAppsByPicNpp = (npp) => api.get(`/pics/${npp}/apps`);
export const getPicByNpp = (npp) => api.get(`/pics/${npp}`);

// Fungsi untuk mengupdate PIC
export const updatePic = (npp, picData) => api.put(`/pics/${npp}`, picData);

// Fungsi untuk membuat PIC baru
export const createPic = (picData) => api.post('/pics', picData);

// Fungsi untuk menghapus PIC
export const deletePic = (npp) => api.delete(`/pics/${npp}`);
