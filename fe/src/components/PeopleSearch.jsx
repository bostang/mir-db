import { useState, useEffect } from 'react';
import { getAppsByPeopleNpp, getPeople } from '../services/api';
import { Container, Form, Button, Table, Card, ListGroup } from 'react-bootstrap';

function PeopleSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [apps, setApps] = useState([]);
  const [message, setMessage] = useState('');

  // Live Suggestion Logic dengan Guarding
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2 && !selectedPerson) {
        try {
          const res = await getPeople(1, 10, searchTerm);
          // Pastikan data adalah array
          const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          setSuggestions(data);
        } catch (err) {
          console.error('Error fetching suggestions', err);
          setSuggestions([]);
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
      // Guarding: pastikan data result adalah array
      const dataResult = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      
      if (dataResult.length === 0) {
        setMessage(`Karyawan ${person.nama} tidak mengelola aplikasi apapun.`);
        setApps([]);
      } else {
        setApps(dataResult);
        setMessage('');
      }
    } catch (error) {
      console.error("Gagal load apps:", error);
      setMessage('Gagal memuat data aplikasi.');
      setApps([]);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedPerson(null);
    setApps([]);
    setMessage('');
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 fw-bold text-center">🔎 Cari Aplikasi Berdasarkan PIC</h2>
      
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="p-4">
          <Form.Group className="position-relative">
            <Form.Label className="fw-bold text-secondary">Ketik Nama atau NPP PIC</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control 
                type="text" 
                className="py-2 px-3 border shadow-sm"
                value={searchTerm} 
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (selectedPerson) setSelectedPerson(null);
                }} 
                placeholder="Contoh: Budi atau 70556..." 
              />
              {(selectedPerson || searchTerm) && (
                <Button variant="outline-dark" onClick={handleClear}>Reset</Button>
              )}
            </div>

            {/* Dropdown Saran */}
            {suggestions.length > 0 && (
              <ListGroup className="position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1000 }}>
                {suggestions.map((p) => (
                  <ListGroup.Item 
                    action 
                    key={p.npp} 
                    className="py-2"
                    onClick={() => handleSelectPerson(p)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span><strong>{p.nama}</strong> <small className="text-muted">({p.npp})</small></span>
                      <small className="badge bg-light text-dark border">{p.division}</small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Form.Group>
        </Card.Body>
      </Card>

      {message && <div className="alert alert-info border-0 shadow-sm text-center">{message}</div>}

      {apps.length > 0 && (
        <Card className="border shadow-sm overflow-hidden">
          <Table hover responsive className="mb-0">
            <thead className="bg-light border-bottom">
              <tr className="align-middle text-center">
                <th className="py-3 text-secondary" style={{ width: '20%' }}>ID Aplikasi</th>
                <th className="py-3 text-secondary" style={{ width: '30%' }}>Nama Aplikasi</th>
                <th className="py-3 text-secondary">Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.application_id} className="align-middle border-bottom">
                  <td className="text-center">
                    <code className="bg-light px-2 py-1 text-danger border rounded small">
                      {app.application_id}
                    </code>
                  </td>
                  <td className="fw-bold text-primary px-3">
                    {app.nama_aplikasi}
                  </td>
                  <td className="text-muted px-3 small">
                    {app.deskripsi_aplikasi || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
}

export default PeopleSearch;