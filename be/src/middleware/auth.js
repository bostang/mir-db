const jwt = require('jsonwebtoken');

// Gunakan secret key yang sama dengan saat login

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Mengambil token setelah 'Bearer '

    if (!token) {
        return res.status(401).json({ message: "Sesi habis, silakan login kembali." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Menyimpan data user (id, role) ke request
        next(); // Lanjutkan ke fungsi rute (database)
    } catch (err) {
        return res.status(403).json({ message: "Token tidak valid atau kadaluwarsa." });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Akses ditolak: Anda bukan Admin." });
    }
};

module.exports = { verifyToken, isAdmin };