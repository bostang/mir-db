CREATE PROCEDURE GetAppByAppIDAndNPP_Flexible
    @application_id CHAR(10) = NULL,
    @npp VARCHAR(6) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    -- Memastikan setidaknya satu parameter diisi
    IF @application_id IS NULL AND @npp IS NULL
    BEGIN
        RAISERROR('Setidaknya salah satu parameter (@application_id atau @npp) harus diisi.', 16, 1);
        RETURN;
    END

    SELECT
        a.*,
        p.nama,
        p.role,
        p.jabatan,
        p.email
    FROM
        dbo.apps AS a
    JOIN
        dbo.people_apps_map AS apm ON a.application_id = apm.application_id
    JOIN
        dbo.pics AS p ON apm.npp = p.npp
    WHERE
        (@application_id IS NULL OR apm.application_id = @application_id)
        AND (@npp IS NULL OR apm.npp = @npp);
END
GO

-- Cara Menggunakan:
-- Mencari berdasarkan ID Aplikasi dan NPP:
EXEC GetAppByAppIDAndNPP_Flexible @application_id = 'ABOAST0111', @npp = '57873';

-- Mencari hanya berdasarkan ID Aplikasi:
EXEC GetAppByAppIDAndNPP_Flexible @application_id = 'ABOAST0111';

-- Mencari hanya berdasarkan NPP:
EXEC GetAppByAppIDAndNPP_Flexible @npp = '57873';

-- Jika tidak ada parameter yang diisi, stored procedure akan mengembalikan pesan error:
EXEC GetAppByAppIDAndNPP_Flexible;
