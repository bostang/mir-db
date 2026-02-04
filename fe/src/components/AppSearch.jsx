import { useState, useEffect, useMemo } from 'react'; // Tambahkan useMemo
import { getPeopleByAppId, getApps } from '../services/api';
import { Container, Form, Button, Table, ListGroup, Card, Row, Col } from 'react-bootstrap';

function AppSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allApps, setAllApps] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [people, setPeople] = useState([]);
  const [message, setMessage] = useState('');
  
  // State baru untuk filter divisi
  const [selectedDivision, setSelectedDivision] = useState('All');

  useEffect(() => {
    getApps().then(res => setAllApps(res.data)).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 1 && !selectedApp) {
      const filtered = allApps.filter(app => 
        app.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_id.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, allApps, selectedApp]);

  // Ekstrak daftar divisi unik dari data people yang sedang ditampilkan
  const divisions = useMemo(() => {
    const distinct = [...new Set(people.map(p => p.division))].filter(Boolean);
    return ['All', ...distinct.sort()];
  }, [people]);

  // Filter data people berdasarkan divisi yang dipilih
  const filteredPeople = useMemo(() => {
    if (selectedDivision === 'All') return people;
    return people.filter(p => p.division === selectedDivision);
  }, [people, selectedDivision]);

  const handleSelectApp = async (app) => {
    setSelectedApp(app);
    setSearchTerm(`${app.nama_aplikasi} (${app.application_id})`);
    setSuggestions([]);
    setMessage('');
    setSelectedDivision('All'); // Reset filter divisi setiap ganti aplikasi
    
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
    setSelectedDivision('All');
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4 text-center">Cari PIC Berdasarkan Aplikasi</h1>

      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={selectedApp ? 8 : 12}>
              <Form.Group className="position-relative">
                <Form.Label className="fw-bold">1. Cari Nama atau ID Aplikasi</Form.Label>
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
                    <Button variant="outline-secondary" onClick={handleClear}>Reset</Button>
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
            </Col>

            {/* Filter Divisi - Hanya muncul jika aplikasi sudah dipilih */}
            {selectedApp && (
              <Col md={4} className="mt-3 mt-md-0">
                <Form.Group>
                  <Form.Label className="fw-bold text-success">2. Filter Divisi</Form.Label>
                  <Form.Select 
                    value={selectedDivision} 
                    onChange={(e) => setSelectedDivision(e.target.value)}
                  >
                    {divisions.map(div => (
                      <option key={div} value={div}>{div}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>

      {message && <p className="alert alert-info text-center">{message}</p>}

      {filteredPeople.length > 0 && (
        <div className="animate__animated animate__fadeIn">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Daftar PIC:</h5>
            <small className="text-muted">Menampilkan {filteredPeople.length} orang</small>
          </div>
          <Table striped bordered hover responsive className="shadow-sm">
            <thead className="table-dark text-nowrap">
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
              {filteredPeople.map((p, index) => (
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
        </div>
      )}
    </Container>
  );
}

export default AppSearch;