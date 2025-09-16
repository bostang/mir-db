import { useState, useEffect } from 'react';
import { getApps, createApp, deleteApp, updateApp } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card } from 'react-bootstrap';

function AppsPage() {
    const [apps, setApps] = useState([]);
    const [formData, setFormData] = useState({ application_id: '', nama_aplikasi: '', deskripsi_singkat: '', business_owner: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null); // State baru untuk menyimpan ID yang sedang diedit

    // ... (kode fetchApps, handleChange, handleSubmit yang sudah ada)
    const fetchApps = async () => {
        try {
            const res = await getApps();
            setApps(res.data);
        } catch (error) {
            console.error('Failed to fetch apps:', error);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Jika sedang dalam mode edit, panggil updateApp
                await updateApp(editingId, formData);
            } else {
                // Jika tidak, panggil createApp
                await createApp(formData);
            }
            setFormData({ application_id: '', nama_aplikasi: '', deskripsi_singkat: '', business_owner: '' });
            setEditingId(null); // Keluar dari mode edit
            fetchApps();
        } catch (error) {
            console.error('Failed to save app:', error);
        }
    };

    const handleEdit = (app) => {
        setEditingId(app.application_id);
        setFormData({
            application_id: app.application_id,
            nama_aplikasi: app.nama_aplikasi,
            deskripsi_singkat: app.deskripsi_singkat,
            business_owner: app.business_owner,
        });
    };
    
    // ... (kode handleDelete dan filteredApps yang sudah ada)
    const handleDelete = async (id) => {
        try {
            await deleteApp(id);
            fetchApps();
        } catch (error) {
            console.error('Failed to delete app:', error);
        }
    };

    const filteredApps = apps.filter(app =>
        app.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.deskripsi_singkat && app.deskripsi_singkat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.business_owner && app.business_owner.toLowerCase().includes(searchTerm.toLowerCase()))
    );


    return (
        <Container className="mt-4">
            <h1 className="mb-4">Daftar Aplikasi</h1>
            <Form className="mb-4">
                <Form.Group>
                    <Form.Control
                        type="text"
                        placeholder="Cari Aplikasi (Nama, ID, Deskripsi, atau Business Owner)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>
            </Form>
            <Card className="mb-4">
                <Card.Header>{editingId ? 'Edit Aplikasi' : 'Tambah Aplikasi Baru'}</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleFormSubmit}>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="application_id" placeholder="Application ID" value={formData.application_id} onChange={handleChange} required disabled={!!editingId} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="nama_aplikasi" placeholder="Nama Aplikasi" value={formData.nama_aplikasi} onChange={handleChange} required />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="deskripsi_singkat" placeholder="Deskripsi Singkat" value={formData.deskripsi_singkat} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="business_owner" placeholder="Business Owner" value={formData.business_owner} onChange={handleChange} />
                                </Form.Group>
                            </Col>
                            <Col xs="auto">
                                <Button variant="primary" type="submit">{editingId ? 'Simpan Perubahan' : 'Tambah'}</Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Aplikasi</th>
                        <th>Deskripsi</th>
                        <th>Business Owner</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredApps.map((app) => (
                        <tr key={app.application_id}>
                            <td>{app.application_id}</td>
                            <td>{app.nama_aplikasi}</td>
                            <td>{app.deskripsi_singkat}</td>
                            <td>{app.business_owner}</td>
                            <td>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(app)}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(app.application_id)}>Hapus</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default AppsPage;