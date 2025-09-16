import { useState } from 'react';
import { getPicsByAppId } from '../services/api';
import { Container, Form, Button, Table } from 'react-bootstrap';

function AppSearch() {
  const [appId, setAppId] = useState('');
  const [pics, setPics] = useState([]);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setPics([]);
    setMessage('');
    try {
      if (!appId) {
        setMessage('Mohon masukkan ID Aplikasi.');
        return;
      }
      const res = await getPicsByAppId(appId);
      if (res.data.length === 0) {
        setMessage('Tidak ada PIC yang terkait dengan ID Aplikasi ini.');
      } else {
        setPics(res.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setMessage('ID Aplikasi tidak ditemukan.');
      } else {
        setMessage('Terjadi kesalahan saat mencari PIC. Pastikan ID Aplikasi benar.');
      }
      console.error('Failed to fetch PICs:', error);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Cari PIC Berdasarkan ID Aplikasi</h1>
      <Form onSubmit={handleSearch} className="mb-4">
        <Form.Group className="d-flex gap-2">
          <Form.Control
            type="text"
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="Masukkan ID Aplikasi"
            required
          />
          <Button variant="primary" type="submit">Cari</Button>
        </Form.Group>
      </Form>

      {message && <p className="alert alert-info">{message}</p>}

      {pics.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>NPP</th>
              <th>Nama</th>
              <th>Role</th>
              <th>Jabatan</th>
              <th>No. Telp</th>
              <th>Email</th>
              <th>Entity</th>
              <th>Grup</th>
              <th>Rubrik</th>
            </tr>
          </thead>
          <tbody>
            {pics.map((pic, index) => (
              <tr key={index}>
                <td>{pic.npp}</td>
                <td>{pic.nama}</td>
                <td>{pic.role}</td>
                <td>{pic.jabatan}</td>
                <td>{pic.no_telp}</td>
                <td>{pic.email}</td>
                <td>{pic.entity}</td>
                <td>{pic.grup}</td>
                <td>{pic.rubrik}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default AppSearch;