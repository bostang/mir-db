import { useState, useEffect } from 'react';
import { getPeople, updatePeople, createPeople, deletePeople } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card, Pagination, Spinner, Alert } from 'react-bootstrap';

function PeoplePage() {
    const [peoples, setPeople] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({ npp: '', nama: '', posisi: '', division: '', email: '', phone: ''});
    const [editingNpp, setEditingNpp] = useState(null);
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Ambil data dengan Guarding Array
    const fetchPeople = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPeople(currentPage, 50, searchTerm);
            
            // Perbaikan Utama: Pastikan kita mengambil Array
            // Jika res.data adalah array, pakai itu. Jika res.data.data yang array, pakai itu.
            const cleanData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            
            setPeople(cleanData);
        } catch (error) {
            console.error('Failed to fetch peoples:', error);
            setError("Gagal mengambil data dari server.");
            setPeople([]);
        } finally {
            setLoading(false);
        }
    };

    // 2. Trigger fetch saat halaman berubah
    useEffect(() => {
        fetchPeople();
    }, [currentPage]);

    // 3. Handle Search (Cari saat klik tombol atau tekan enter)
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); 
        fetchPeople();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingNpp) {
                await updatePeople(editingNpp, formData);
            } else {
                await createPeople(formData);
            }
            // Reset form
            setFormData({ npp: '', nama: '', posisi: '', division: '', email: '', phone: ''});
            setEditingNpp(null);
            fetchPeople(); // Refresh data
        } catch (error) {
            console.error('Failed to save PIC:', error);
            alert(error.response?.data?.message || "Gagal menyimpan data.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleEdit = (person) => {
        setEditingNpp(person.npp);
        setFormData({
            npp: person.npp,
            nama: person.nama,
            posisi: person.posisi || '',
            division: person.division || '',
            email: person.email || '',
            phone: person.phone || '',
        });
        window.scrollTo(0, 0); // Scroll ke atas agar form terlihat
    };

    const handleDelete = async (npp) => {
        if(window.confirm("Hapus PIC ini?")) {
            try {
                await deletePeople(npp);
                fetchPeople();
            } catch (error) {
                console.error('Failed to delete PIC:', error);
            }
        }
    };

    return (
        <Container className="mt-4 pb-5">
            <h1 className="mb-4">Daftar PIC (Master Data)</h1>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* Form Input/Edit */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Header className={editingNpp ? "bg-warning text-dark fw-bold" : "bg-primary text-white fw-bold"}>
                    {editingNpp ? '📝 Edit PIC Mode' : '➕ Tambah PIC Baru'}
                </Card.Header>
                <Card.Body className="bg-light">
                    <Form onSubmit={handleFormSubmit}>
                        <Row>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">NPP</Form.Label>
                                    <Form.Control type="text" name="npp" value={formData.npp} onChange={handleChange} required disabled={!!editingNpp} placeholder="Contoh: 88123" />
                                </Form.Group>
                            </Col>
                            <Col md={5}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Nama Lengkap</Form.Label>
                                    <Form.Control type="text" name="nama" value={formData.nama} onChange={handleChange} required placeholder="Masukkan nama..." />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Email</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@perusahaan.com" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Posisi / Jabatan</Form.Label>
                                    <Form.Control type="text" name="posisi" value={formData.posisi} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Divisi</Form.Label>
                                    <Form.Control type="text" name="division" value={formData.division} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">No. Telp</Form.Label>
                                    <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="text-end border-top pt-3">
                                {editingNpp && (
                                    <Button variant="outline-secondary" className="me-2" onClick={() => {setEditingNpp(null); setFormData({npp:'',nama:'',posisi:'',division:'',email:'',phone:''})}}>
                                        Batal
                                    </Button>
                                )}
                                <Button variant={editingNpp ? "warning" : "primary"} type="submit" disabled={loading}>
                                    {loading ? <Spinner size="sm" /> : (editingNpp ? 'Simpan Perubahan' : 'Tambah PIC')}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* Form Pencarian */}
            <div className="bg-white p-3 rounded shadow-sm border mb-4">
                <Form onSubmit={handleSearchSubmit}>
                    <Row className="align-items-end">
                        <Col md={9}>
                            <Form.Label className="small fw-bold">Cari PIC</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Cari berdasarkan Nama, NPP, atau Email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Button variant="dark" type="submit" className="w-100">
                                🔍 Cari Data
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>

            {/* Tabel Data */}
            <div className="bg-white rounded shadow-sm border">
                <Table striped hover responsive className="mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>NPP</th>
                            <th>Nama</th>
                            <th>Divisi</th>
                            <th>Email</th>
                            <th>No. Telp</th>
                            <th className="text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center py-4"><Spinner animation="border" /></td></tr>
                        ) : peoples.length > 0 ? (
                            peoples.map((person, index) => (
                                <tr key={person.npp || index}>
                                    <td className="fw-bold">{person.npp}</td>
                                    <td>{person.nama}<br/><small className="text-muted">{person.posisi}</small></td>
                                    <td>{person.division}</td>
                                    <td>{person.email}</td>
                                    <td>{person.phone}</td>
                                    <td className="text-center">
                                        <Button variant="outline-warning" size="sm" className="me-2" onClick={() => handleEdit(person)}>Edit</Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(person.npp)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="6" className="text-center py-4 text-muted">Data tidak ditemukan atau tabel kosong.</td></tr>
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3 p-2">
                <p className="text-muted small">Menampilkan data halaman {currentPage}</p>
                <Pagination className="mb-0">
                    <Pagination.Prev 
                        disabled={currentPage === 1 || loading} 
                        onClick={() => setCurrentPage(prev => prev - 1)} 
                    />
                    <Pagination.Item active>{currentPage}</Pagination.Item>
                    <Pagination.Next 
                        disabled={peoples.length < 50 || loading} 
                        onClick={() => setCurrentPage(prev => prev + 1)} 
                    />
                </Pagination>
            </div>
        </Container>
    );
}

export default PeoplePage;