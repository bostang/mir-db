import { useState, useEffect } from 'react';
import { getPeople, updatePeople, createPeople, deletePeople } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card, Pagination } from 'react-bootstrap';

function PeoplePage() {
    const [peoples, setPeople] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({ npp: '', nama: '', posisi: '', division: '', email: '', phone: ''});
    const [editingNpp, setEditingNpp] = useState(null);

    // Ambil data dari server berdasarkan halaman dan pencarian
    const fetchPeople = async () => {
        try {
            const res = await getPeople(currentPage, 50, searchTerm);
            setPeople(res.data);
        } catch (error) {
            console.error('Failed to fetch peoples:', error);
        }
    };

    // Trigger fetch saat halaman berubah atau saat tombol search ditekan
    useEffect(() => {
        fetchPeople();
    }, [currentPage]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset ke hal 1 saat cari baru
        fetchPeople();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNpp) {
                await updatePeople(editingNpp, formData);
            } else {
                await createPeople(formData);
            }
            setFormData({ npp: '', nama: '', posisi: '', division: '', email: '', phone: ''});
            setEditingNpp(null);
            fetchPeople();
        } catch (error) {
            console.error('Failed to save PIC:', error);
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
        <Container className="mt-4">
            <h1 className="mb-4">Daftar PIC</h1>

            {/* Form Pencarian (Server-side) */}
            <Form className="mb-4" onSubmit={handleSearchSubmit}>
                <Row>
                    <Col md={10}>
                        <Form.Control
                            type="text"
                            placeholder="Cari Nama atau NPP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Col>
                    <Col md={2}>
                        <Button variant="secondary" type="submit" className="w-100">Cari</Button>
                    </Col>
                </Row>
            </Form>

            <Card className="mb-4">
                <Card.Header>{editingNpp ? 'Edit PIC' : 'Tambah PIC Baru'}</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>NPP</Form.Label>
                                    <Form.Control type="text" name="npp" value={formData.npp} onChange={handleChange} required disabled={!!editingNpp} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nama</Form.Label>
                                    <Form.Control type="text" name="nama" value={formData.nama} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Posisi</Form.Label>
                                    <Form.Control type="text" name="posisi" value={formData.posisi} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Divisi</Form.Label>
                                    <Form.Control type="text" name="division" value={formData.division} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>No. Telp</Form.Label>
                                    <Form.Control type="text" name="phone" value={formData.phone} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="text-end">
                                {editingNpp && <Button variant="light" className="me-2" onClick={() => {setEditingNpp(null); setFormData({npp:'',nama:'',posisi:'',division:'',email:'',phone:''})}}>Batal</Button>}
                                <Button variant="primary" type="submit">{editingNpp ? 'Simpan Perubahan' : 'Tambah'}</Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
            
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>NPP</th>
                        <th>Nama</th>
                        <th>Posisi</th>
                        <th>Divisi</th>
                        <th>Email</th>
                        <th>No. Telp</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {peoples.length > 0 ? (
                        peoples.map((person, index) => (
                            <tr key={person.npp || index}>
                                <td>{person.npp}</td>
                                <td>{person.nama}</td>
                                <td>{person.posisi}</td>
                                <td>{person.division}</td>
                                <td>{person.email}</td>
                                <td>{person.phone}</td>
                                <td>
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(person)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(person.npp)}>Hapus</Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="7" className="text-center">Data tidak ditemukan</td></tr>
                    )}
                </tbody>
            </Table>

            {/* Pagination Controls */}
            <div className="d-flex justify-content-between align-items-center mt-3">
                <span>Halaman: {currentPage}</span>
                <Pagination>
                    <Pagination.Prev 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => prev - 1)} 
                    />
                    <Pagination.Item active>{currentPage}</Pagination.Item>
                    <Pagination.Next 
                        disabled={peoples.length < 50} 
                        onClick={() => setCurrentPage(prev => prev + 1)} 
                    />
                </Pagination>
            </div>
        </Container>
    );
}

export default PeoplePage;