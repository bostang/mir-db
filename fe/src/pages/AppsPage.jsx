// fe/src/pages/AppsPage.jsx
import { useState, useEffect } from 'react';
import { getApps, createApp, deleteApp, updateApp } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card } from 'react-bootstrap';

function AppsPage() {
    const [apps, setApps] = useState([]);
    const [formData, setFormData] = useState({ application_id: '', nama_aplikasi: '', deskripsi_singkat: '', business_owner: '' });
    const [searchTerm, setSearchTerm] = useState(''); // State baru untuk search bar

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createApp(formData);
            setFormData({ application_id: '', nama_aplikasi: '', deskripsi_singkat: '', business_owner: '' });
            fetchApps();
        } catch (error) {
            console.error('Failed to create app:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteApp(id);
            fetchApps();
        } catch (error) {
            console.error('Failed to delete app:', error);
        }
    };

    // Filter aplikasi berdasarkan searchTerm
    const filteredApps = apps.filter(app =>
        app.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.deskripsi_singkat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.business_owner.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Daftar Aplikasi</h1>

            {/* Tambahkan Search Bar di sini */}
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
                <Card.Header>Tambah Aplikasi Baru</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" name="application_id" placeholder="Application ID" value={formData.application_id} onChange={handleChange} required />
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
                                <Button variant="primary" type="submit">Tambah</Button>
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
                    {/* Gunakan data yang sudah difilter */}
                    {filteredApps.map((app) => (
                        <tr key={app.application_id}>
                            <td>{app.application_id}</td>
                            <td>{app.nama_aplikasi}</td>
                            <td>{app.deskripsi_singkat}</td>
                            <td>{app.business_owner}</td>
                            <td>
                                <Button variant="danger" onClick={() => handleDelete(app.application_id)}>Hapus</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default AppsPage;