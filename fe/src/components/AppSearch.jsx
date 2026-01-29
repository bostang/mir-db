import { useState, useEffect } from 'react';
import { getPeopleByAppId, getApps } from '../services/api';
import { Container, Form, Button, Table, ListGroup, Card } from 'react-bootstrap';

function AppSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allApps, setAllApps] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [people, setPeople] = useState([]);
  const [message, setMessage] = useState('');

  // Load semua aplikasi untuk pencarian lokal yang cepat
  useEffect(() => {
    getApps().then(res => setAllApps(res.data)).catch(err => console.error(err));
  }, []);

  // Logic saran aplikasi (lokal)
  useEffect(() => {
    if (searchTerm.length >= 1 && !selectedApp) {
      const filtered = allApps.filter(app => 
        app.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_id.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8); // Batasi 8 saran
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, allApps, selectedApp]);

  const handleSelectApp = async (app) => {
    setSelectedApp(app);
    setSearchTerm(`${app.nama_aplikasi} (${app.application_id})`);
    setSuggestions([]);
    setMessage('');
    
    try {
      const res = await getPeopleByAppId(app.application_id);
      if (res.data.length === 0) {
        setMessage('Tidak ada PIC yang terkait dengan aplikasi ini.');
        setPeople([]);
      } else {
        setPeople(res.data);
      }
    } catch (error) {
      setMessage('Gagal mencari PIC.');
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedApp(null);
    setPeople([]);
    setMessage('');
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Cari PIC Berdasarkan Aplikasi</h1>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group className="position-relative">
            <Form.Label className="fw-bold">Ketik Nama atau ID Aplikasi</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedApp) setSelectedApp(null);
                }}
                placeholder="Contoh: BNI Direct atau AP001..."
              />
              {(selectedApp || searchTerm) && (
                <Button variant="secondary" onClick={handleClear}>Reset</Button>
              )}
            </div>

            {/* Dropdown Saran */}
            {suggestions.length > 0 && (
              <ListGroup className="position-absolute w-100 shadow-lg" style={{ zIndex: 1000 }}>
                {suggestions.map((app) => (
                  <ListGroup.Item 
                    action 
                    key={app.application_id} 
                    onClick={() => handleSelectApp(app)}
                  >
                    <strong>{app.nama_aplikasi}</strong> <small className="text-muted">({app.application_id})</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {message && <p className="alert alert-info">{message}</p>}

      {people.length > 0 && (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>NPP</th>
              <th>Nama</th>
              <th>Posisi</th>
              <th>Divisi</th>
              <th>Email</th>
              <th>No. Telp</th>
            </tr>
          </thead>
          <tbody>
            {people.map((p, index) => (
              <tr key={index}>
                <td>{p.npp}</td>
                <td className="fw-bold text-primary">{p.nama}</td>
                <td>{p.posisi}</td>
                <td>{p.division}</td>
                <td>{p.email}</td>
                <td>{p.phone}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default AppSearch;