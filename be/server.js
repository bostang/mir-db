//be/src/server.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { error } = require('./src/utils/responseHandler');
const { verifyToken } = require('./src/middleware/auth');

const app = express();

// Pastikan fallback nilai jika .env tidak terbaca
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5000;

// 1. Middleware Global (Harus di atas rute)
app.use(cors());
app.use(express.json());


// 2. Route Dasar untuk Cek Health
app.get('/', (req, res) => res.send('API berjalan dengan sukses!'));

app.use('/api/auth', require('./src/routes/auth'));

// 3. Import & Gunakan Routes
// Jika server.js ada di be/src/, maka routenya ada di folder yang sama (./routes)
app.use('/api/apps', verifyToken, require('./src/routes/apps'));
app.use('/api/links', verifyToken, require('./src/routes/links'));
app.use('/api/people', verifyToken, require('./src/routes/people'));
app.use('/api/app-people-map', verifyToken, require('./src/routes/relations'));
app.use('/api/dashboard/stats', verifyToken, require('./src/routes/stats'));

// 4. Error Handler (Harus paling bawah setelah semua rute)
app.use((err, req, res, next) => {
    console.error("ERROR:", err.stack);
    error(res, "Terjadi kesalahan pada server internal", 500, err.message);
});

// 5. Listen
app.listen(PORT, HOST, () => {
    console.log(`Server berjalan di http://${HOST}:${PORT}`);
});