-- 1. Buat Database Rahasia
CREATE DATABASE mim_auth;
GO

USE mim_auth;
GO

-- 2. Buat Tabel Users
CREATE TABLE users (
    id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Untuk menyimpan hasil hash bcrypt
    role VARCHAR(20) DEFAULT 'viewer',   -- admin, editor, viewer
    created_at DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);
GO