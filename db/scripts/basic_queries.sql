SELECT [application_id], [nama_aplikasi]
FROM [dbo].[apps]
WHERE [application_id] = 'ABOAST0111';

-- menampilkan pic dari aplikasi FSCM
SELECT p.*
FROM [dbo].[pics] p
JOIN [dbo].[app_pic_map] apm ON p.npp = apm.npp
WHERE apm.application_id = 'ABOAST0111';

-- menampilkan pic dari aplikasi iCONS
SELECT p.*
FROM [dbo].[pics] p
JOIN [dbo].[app_pic_map] apm ON p.npp = apm.npp
WHERE apm.application_id = 'ABOAST0135';


-- menampilkan aplikasi yg dipegang oleh mas Ahmadi Agra
SELECT a.*
FROM [dbo].[apps] a
JOIN [dbo].[app_pic_map] apm ON a.application_id = apm.application_id
WHERE apm.npp = '57873';

-- menampilkan 3 pic
SELECT TOP 3 p.*
FROM [dbo].[pics] p;

-- menamplilkan pic dengan npp 70556
SELECT p.*
FROM [dbo].[pics] p
WHERE p.npp = '70556';

-- menampilkan semua link
SELECT l.*
FROM [dbo].[links] l;