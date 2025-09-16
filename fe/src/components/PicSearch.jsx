import { useState } from 'react';
import { getAppsByPicNpp } from '../services/api';
import { Container, Form, Button, Table } from 'react-bootstrap';

function PicSearch() {
  const [npp, setNpp] = useState('');
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setApps([]);
    setMessage('');
    try {
      const res = await getAppsByPicNpp(npp);
      if (res.data.length === 0) {
        setMessage('Tidak ada aplikasi yang di-handle oleh NPP ini.');
      } else {
        setApps(res.data);
      }
    } catch (error) {
      setMessage('Terjadi kesalahan saat mencari aplikasi. Pastikan NPP benar.');
      console.error('Failed to fetch apps by NPP:', error);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Cari Aplikasi Berdasarkan NPP PIC</h1>
      <Form onSubmit={handleSearch} className="mb-4">
        <Form.Group className="d-flex gap-2">
          <Form.Control 
            type="text" 
            value={npp} 
            onChange={(e) => setNpp(e.target.value)} 
            placeholder="Masukkan NPP" 
            required 
          />
          <Button variant="primary" type="submit">Cari</Button>
        </Form.Group>
      </Form>

      {message && <p className="alert alert-info">{message}</p>}

      {apps.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID Aplikasi</th>
              <th>Nama Aplikasi</th>
              <th>Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.application_id}>
                <td>{app.application_id}</td>
                <td>{app.nama_aplikasi}</td>
                <td>{app.deskripsi_singkat}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default PicSearch;