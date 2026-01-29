-- Menampilkan PIC dari suatu aplikas
-- contoh : BNI Direct Supply Chain
SELECT [application_id], [nama_aplikasi]
    FROM [mir_db].[dbo].[apps]
    WHERE [application_id] = 'ABOAST0111';

SELECT p.*
FROM [dbo].[pics] p
JOIN [dbo].[people_apps_map] apm ON p.npp = apm.npp
WHERE apm.application_id = 'ABOAST0111';

-- Menampilkan aplikasi yang dipegang suatu PIC
SELECT a.*
FROM [dbo].[apps] a
JOIN [dbo].[people_apps_map] apm ON a.application_id = apm.application_id
WHERE apm.npp = '64202';


-- Menampilkan semua aplikasi : SPECIAL APP

SELECT [application_id], [nama_aplikasi], [deskripsi_aplikasi]
    FROM [mir_db].[dbo].[apps]
    -- WHERE [nama_aplikasi] LIKE '%SKA%';
    -- WHERE [nama_aplikasi] LIKE '%CMS%';
    WHERE [deskripsi_aplikasi] LIKE '%Special%';

-- special code :

-- SECURITY__ : Security (PAM)
-- L1________ : L1
-- APP_______ : aplikasi tanpa id aplikasi yang konsisten
-- LDAP______ : LDAP
-- NETWORK___ : Network
-- DATABASE__ : Database
-- SERVER____ : server
-- SORX______ : SORX
-- ERM_______ : ERM
-- SSO_______ : SSO
-- KCLN______ : KCLN
-- EKSTERNAL_ : EKSTERNAL
-- BISNIS____ : USER BISNIS

-- MENAMPILKAN SEMUA ELEMEN TABEL

SELECT
        *
    FROM
        [dbo].[apps];

SELECT
        *
    FROM
        [dbo].[people_apps_map];

SELECT
        *
    FROM
        [dbo].[pics];