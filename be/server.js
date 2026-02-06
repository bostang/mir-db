const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Pastikan fallback nilai jika .env tidak terbaca
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5000;

// 1. Middleware Global (Harus di atas rute)
app.use(cors());
app.use(express.json());

// 2. Route Dasar untuk Cek Health
app.get('/', (req, res) => res.send('API berjalan dengan sukses!'));

// 3. Import & Gunakan Routes
app.use('/api/apps', require('./src/routes/apps'));
app.use('/api/links', require('./src/routes/links'));
app.use('/api/people', require('./src/routes/people'));
app.use('/api/app-people-map', require('./src/routes/relations'));

// 4. Error Handler (Harus paling bawah setelah semua rute)
app.use((err, req, res, next) => {
    console.error("Terjadi kesalahan detail:", err.stack); // Gunakan .stack agar lebih jelas
    res.status(500).send('Server Error');
});

// 5. Listen
app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di http://${HOST}:${PORT}`);
});