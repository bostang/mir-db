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
