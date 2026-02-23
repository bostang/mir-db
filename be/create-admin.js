// be/create-admin.js
const dbAuth = require('./src/config/dbAuth');
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

const start = async () => {
    console.log("=== Setup User Admin Baru ===");
    
    const username = await askQuestion("Masukkan Username: ");
    const password = await askQuestion("Masukkan Password: ");
    const role = await askQuestion("Masukkan Role (admin/editor/viewer): ");

    try {
        // Enkripsi password
        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const query = "INSERT INTO users (username, password_hash, role, is_active) VALUES (?, ?, ?, 1)";
        
        dbAuth.query(query, [username, hash, role], (err, result) => {
            if (err) {
                console.error("Gagal membuat user:", err.message);
            } else {
                console.log(`\n✅ Sukses! User '${username}' berhasil dibuat.`);
            }
            rl.close();
            process.exit();
        });
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

start();