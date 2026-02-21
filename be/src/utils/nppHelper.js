// src/utils/nppHelper.js
const db = require('../config/db');

// --- HELPER UNTUK GENERATE NEXT NPP ---
// Fungsi ini mengembalikan angka terakhir dari NPP berformat X0000
const getNextNppNumber = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT TOP 1 npp 
            FROM people 
            WHERE npp LIKE 'X%' AND ISNUMERIC(SUBSTRING(npp, 2, LEN(npp))) = 1
            ORDER BY CAST(SUBSTRING(npp, 2, LEN(npp)) AS INT) DESC
        `;
        db.query(query, (err, rows) => {
            if (err) return reject(err);
            if (rows.length > 0) {
                const lastNum = parseInt(rows[0].npp.replace(/\D/g, ''), 10);
                resolve(lastNum + 1);
            } else {
                resolve(154); // Start default jika tabel kosong
            }
        });
    });
};

module.exports = { getNextNppNumber };