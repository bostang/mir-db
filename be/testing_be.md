# Testing BE.md

## JALANKAN BE

```bash
node server.js
```

## CREATE

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "application_id": "APISUBMIT1",
    "nama_aplikasi": "API Submission Test",
    "deskripsi_singkat": "Aplikasi untuk mengetes endpoint",
    "business_owner": "Tim API"
  }' \
  http://localhost:5000/api/apps
```

## READ

```bash
curl -X GET http://localhost:5000/api/apps/APISUBMIT1
```

## UPDATE

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{
    "nama_aplikasi": "API Submission Test Updated",
    "deskripsi_singkat": "Deskripsi yang sudah diupdate"
  }' \
  http://localhost:5000/api/apps/APISUBMIT1
```

## DELETE

```bash
curl -X DELETE \
  http://localhost:5000/api/apps/APISUBMIT1
```
