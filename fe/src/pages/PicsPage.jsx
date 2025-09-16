import { useState, useEffect } from 'react';
import { getPics, updatePic, createPic, deletePic } from '../services/api'; // Import fungsi update, create, dan delete yang dibutuhkan
import { Container, Table, Form, Button, Row, Col, Card } from 'react-bootstrap';

function PicsPage() {
    const [pics, setPics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({ npp: '', nama: '', role: '', jabatan: '', no_telp: '', email: '', entity: '', grup: '', rubrik: '' });
    const [editingNpp, setEditingNpp] = useState(null); // State untuk NPP yang sedang diedit

    const fetchPics = async () => {
        try {
            const res = await getPics();
            setPics(res.data);
        } catch (error) {
            console.error('Failed to fetch pics:', error);
        }
    };

    useEffect(() => {
        fetchPics();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNpp) {
                await updatePic(editingNpp, formData);
            } else {
                await createPic(formData);
            }
            setFormData({ npp: '', nama: '', role: '', jabatan: '', no_telp: '', email: '', entity: '', grup: '', rubrik: '' });
            setEditingNpp(null);
            fetchPics();
        } catch (error) {
            console.error('Failed to save PIC:', error);
        }
    };
    
    const handleEdit = (pic) => {
        setEditingNpp(pic.npp);
        setFormData({
            npp: pic.npp,
            nama: pic.nama,
            role: pic.role,
            jabatan: pic.jabatan,
            no_telp: pic.no_telp,
            email: pic.email,
            entity: pic.entity,
            grup: pic.grup,
            rubrik: pic.rubrik,
        });
    };

    // Tambahkan juga fungsi delete untuk PIC
    const handleDelete = async (npp) => {
        try {
            await deletePic(npp);
            fetchPics();
        } catch (error) {
            console.error('Failed to delete PIC:', error);
        }
    };

    const filteredPics = pics.filter(pic =>
        pic.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pic.npp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pic.jabatan && pic.jabatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pic.email && pic.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return (
        <Container className="mt-4">
            <h1 className="mb-4">Daftar PIC</h1>
            <Form className="mb-4">
                <Form.Group>
                    <Form.Control
                        type="text"
                        placeholder="Cari PIC (Nama, NPP, Jabatan, atau Email)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>
            </Form>
            <Card className="mb-4">
                <Card.Header>{editingNpp ? 'Edit PIC' : 'Tambah PIC Baru'}</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="npp" placeholder="NPP" value={formData.npp} onChange={handleChange} required disabled={!!editingNpp} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="nama" placeholder="Nama" value={formData.nama} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="role" placeholder="Role" value={formData.role} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="jabatan" placeholder="Jabatan" value={formData.jabatan} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="no_telp" placeholder="No. Telp" value={formData.no_telp} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="entity" placeholder="Entity" value={formData.entity} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="grup" placeholder="Grup" value={formData.grup} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="rubrik" placeholder="Rubrik" value={formData.rubrik} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="text-end">
                                <Button variant="primary" type="submit">{editingNpp ? 'Simpan Perubahan' : 'Tambah'}</Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>
            
            <Table striped bordered hover responsive>
                {/* ... (bagian thead dan tbody yang sudah ada) */}
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
                        <th>Aksi</th> {/* Tambahkan kolom Aksi */}
                    </tr>
                </thead>
                <tbody>
                    {filteredPics.map((pic, index) => (
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
                            <td>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(pic)}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(pic.npp)}>Hapus</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default PicsPage;