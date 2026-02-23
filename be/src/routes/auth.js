const express = require('express');
const router = express.Router();
const dbAuth = require('../config/dbAuth'); // Menggunakan dbAuth khusus
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username = ? AND is_active = 1";
    dbAuth.query(query, [username], async (err, rows) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (rows.length === 0) return res.status(401).json({ message: "User tidak ditemukan" });

        const user = rows[0];
        
        // Bandingkan password yang diinput dengan hash di database
        const match = await bcrypt.compare(password, user.password_hash);
        
        if (match) {
            // Buat Token (Gunakan secret key yang kuat!)
            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                process.env.JWT_SECRET, // Gunakan env
                { expiresIn: '8h' }
            );
            res.json({ token, role: user.role });
        } else {
            res.status(401).json({ message: "Password salah" });
        }
    });
});

module.exports = router;