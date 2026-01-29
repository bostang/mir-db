import { useState, useEffect } from 'react';
import { getAppsByPeopleNpp, getPeople } from '../services/api';
import { Container, Form, Button, Table, Card, ListGroup } from 'react-bootstrap';

function PeopleSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState('');

  // Live Suggestion Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2 && !selectedPerson) {
        try {
          const res = await getPeople(1, 10, searchTerm); // Ambil 10 saran teratas
          setSuggestions(res.data);
        } catch (err) {
          console.error('Error fetching suggestions', err);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedPerson]);

  const handleSelectPerson = async (person) => {
    setSelectedPerson(person);
    setSearchTerm(`${person.nama} (${person.npp})`);
    setSuggestions([]);
    setMessage('');
    
    try {
      const res = await getAppsByPeopleNpp(person.npp);
      if (res.data.length === 0) {
        setMessage(`Karyawan ${person.nama} tidak mengelola aplikasi apapun.`);
        setApps([]);
      } else {
        setApps(res.data);
      }
    } catch (error) {
      setMessage('Gagal memuat data aplikasi.');
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedPerson(null);
    setApps([]);
    setMessage('');
  };

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Cari Aplikasi Berdasarkan PIC</h1>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form.Group className="position-relative">
            <Form.Label className="fw-bold">Ketik Nama atau NPP PIC</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control 
                type="text" 
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedPerson) setSelectedPerson(null);
                }} 
                placeholder="Contoh: Budi atau 12345..." 
              />
              {(selectedPerson || searchTerm) && (
                <Button variant="secondary" onClick={handleClear}>Reset</Button>
              )}
            </div>

            {/* Dropdown Saran */}
            {suggestions.length > 0 && (
              <ListGroup className="position-absolute w-100 shadow-lg" style={{ zIndex: 1000 }}>
                {suggestions.map((p) => (
                  <ListGroup.Item 
                    action 
                    key={p.npp} 
                    onClick={() => handleSelectPerson(p)}
                  >
                    <strong>{p.nama}</strong> <small className="text-muted">({p.npp}) - {p.division}</small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {message && <p className="alert alert-info">{message}</p>}

      {apps.length > 0 && (
        <Table striped bordered hover responsive className="shadow-sm">
          <thead className="table-dark">
            <tr>
              <th>ID Aplikasi</th>
              <th>Nama Aplikasi</th>
              <th>Deskripsi</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((app) => (
              <tr key={app.application_id}>
                <td><code>{app.application_id}</code></td>
                <td className="fw-bold">{app.nama_aplikasi}</td>
                <td>{app.deskripsi_aplikasi || '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default PeopleSearch;