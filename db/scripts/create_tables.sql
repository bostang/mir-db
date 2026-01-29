-- HAPUS SEMUA TABEL
DROP TABLE IF EXISTS [dbo].[people_apps_map];
DROP TABLE IF EXISTS [dbo].[pics];
DROP TABLE IF EXISTS [dbo].[links];
DROP TABLE IF EXISTS [dbo].[apps];


-- BUAT TABEL APLIKASI
CREATE TABLE [dbo].[apps] (
    [application_id]    CHAR (10)     UNIQUE NOT NULL,
    [nama_aplikasi]     VARCHAR (255) NOT NULL,
    [deskripsi_aplikasi] TEXT          NULL,
    [business_owner]    VARCHAR (255) NULL,
    [system_owner]      VARCHAR (255) NULL,
    [criticality]       VARCHAR (50)  NULL,
    [touch_point]       VARCHAR (50)  NULL,
    [fo_mo_bo]          VARCHAR (50)  NULL,
    [pengembang]        VARCHAR (50)  NULL,
    [status]            VARCHAR (50)  NULL,
    [customer_facing]   VARCHAR (50)  NULL,
    [status_ARIS]       VARCHAR (50)  NULL,
    [remarks]           TEXT          NULL,
    [param_rep_cust]    INT           NULL,
    CONSTRAINT [PK_apps] PRIMARY KEY CLUSTERED ([application_id])
);

-- BUAT TABEL PIC
CREATE TABLE [dbo].[pics] (
    [id]             INT           IDENTITY (1, 1) NOT NULL,
    [nama]           VARCHAR (100) NULL,
    [role]           VARCHAR (50)  NULL,
    [jabatan]        VARCHAR (50)  NULL,
    [no_telp]        VARCHAR (20)  NULL,
    [email]          VARCHAR (100) NULL,
    [entity]         VARCHAR (50)  NULL,
    [grup]           VARCHAR (50)  NULL,
    [rubrik]           VARCHAR (50)  NULL,
    [npp]           VARCHAR(6) NOT NULL, -- I've made this NOT NULL
    CONSTRAINT [PK_pics] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_pics_npp] UNIQUE ([npp]) -- ADDED THIS UNIQUE CONSTRAINT
);

-- BUAT TABEL PRANALA
CREATE TABLE [dbo].[links] (
    [id]             INT           IDENTITY (1, 1) NOT NULL,
    [application_id] CHAR(10)  NOT NULL,
    [aod_doc_link]   VARCHAR (255) NULL,
    [warroom_link]   VARCHAR (255) NULL,
    CONSTRAINT [PK_links] PRIMARY KEY CLUSTERED ([id] ASC),
    UNIQUE NONCLUSTERED ([application_id] ASC),
    FOREIGN KEY ([application_id]) REFERENCES [apps]([application_id]),
);

-- BUAT TABEL PENGHUBUNG APLIKASI DENGAN PIC (MANY-TO-MANY)
CREATE TABLE [dbo].[people_apps_map] (
    [application_id] CHAR(10)  NULL,
    [note] TEXT NULL,
    [npp] VARCHAR(6) NULL
    FOREIGN KEY ([application_id]) REFERENCES [apps]([application_id]),
    FOREIGN KEY ([npp]) REFERENCES [pics]([npp])
);