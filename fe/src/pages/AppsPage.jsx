import { useState, useEffect, useMemo, memo } from 'react';
import { getApps, createApp, deleteApp, updateApp } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card } from 'react-bootstrap';

// --- KOMPONEN FORM ---
const AppForm = ({ initialData, editingId, onSave, onCancel }) => {
    const [localData, setLocalData] = useState({ 
        application_id: '', nama_aplikasi: '', deskripsi_aplikasi: '', business_owner: '' 
    });

    useEffect(() => {
        if (initialData) {
            setLocalData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        setLocalData({ ...localData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(localData);
        if (!editingId) {
            setLocalData({ application_id: '', nama_aplikasi: '', deskripsi_aplikasi: '', business_owner: '' });
        }
    };

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
                {editingId ? 'Edit Aplikasi' : 'Tambah Aplikasi Baru'}
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={2}>
                            <Form.Group className="mb-3">
                                <Form.Label>App ID</Form.Label>
                                <Form.Control type="text" name="application_id" value={localData.application_id} onChange={handleChange} required disabled={!!editingId} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Nama Aplikasi</Form.Label>
                                <Form.Control type="text" name="nama_aplikasi" value={localData.nama_aplikasi} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Deskripsi</Form.Label>
                                <Form.Control type="text" name="deskripsi_aplikasi" value={localData.deskripsi_aplikasi} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Business Owner</Form.Label>
                                <Form.Control type="text" name="business_owner" value={localData.business_owner} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit">
                            {editingId ? 'Simpan Perubahan' : 'Tambah Aplikasi'}
                        </Button>
                        {editingId && (
                            <Button variant="secondary" className="ms-2" onClick={onCancel}>Batal</Button>
                        )}
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

// --- HALAMAN UTAMA ---
function AppsPage() {
    const [apps, setApps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);

    // --- LOGIKA RBAC ---
    // Mengambil role dari localStorage
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'admin';

    const fetchApps = async () => {
        try {
            const res = await getApps();
            const appData = res.data?.data || res.data || [];
            setApps(Array.isArray(appData) ? appData : []);
        } catch (error) {
            console.error('Failed to fetch apps:', error);
            setApps([]);
        }
    };

    useEffect(() => {
        fetchApps();
    }, []);

    const handleFormSubmit = async (data) => {
        try {
            if (editingId) {
                await updateApp(editingId, data);
            } else {
                await createApp(data);
            }
            setEditingId(null);
            setSelectedApp(null);
            fetchApps();
        } catch (error) {
            console.error('Failed to save app:', error);
        }
    };

    const handleEdit = (app) => {
        setEditingId(app.application_id);
        setSelectedApp(app);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus aplikasi ini?")) {
            try {
                await deleteApp(id);
                fetchApps();
            } catch (error) {
                console.error('Failed to delete app:', error);
            }
        }
    };

    const filteredApps = useMemo(() => {
        if (!Array.isArray(apps)) return [];
        return apps.filter(app =>
            (app.nama_aplikasi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.application_id || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [apps, searchTerm]);

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Daftar Aplikasi</h1>
                <span className="badge bg-info text-dark">Role: {userRole}</span>
            </div>
            
            <Form className="mb-4">
                <Form.Control
                    type="text"
                    placeholder="Cari Aplikasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </Form>

            {/* MODIFIKASI 1: Form Tambah/Edit hanya muncul jika isAdmin = true */}
            {isAdmin && (
                <AppForm 
                    initialData={selectedApp} 
                    editingId={editingId} 
                    onSave={handleFormSubmit}
                    onCancel={() => { setEditingId(null); setSelectedApp(null); }}
                />
            )}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nama Aplikasi</th>
                        <th>Deskripsi</th>
                        <th>Business Owner</th>
                        {/* MODIFIKASI 2: Header kolom Aksi hanya muncul untuk Admin */}
                        {isAdmin && <th className="text-center">Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {filteredApps.map((app) => (
                        <tr key={app.application_id}>
                            <td>{app.application_id}</td>
                            <td>{app.nama_aplikasi}</td>
                            <td>{app.deskripsi_aplikasi}</td>
                            <td>{app.business_owner}</td>
                            {/* MODIFIKASI 3: Tombol Edit/Delete hanya muncul untuk Admin */}
                            {isAdmin && (
                                <td className="text-center">
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(app)}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(app.application_id)}>Hapus</Button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {filteredApps.length === 0 && (
                        <tr>
                            <td colSpan={isAdmin ? 5 : 4} className="text-center">Data tidak ditemukan</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
}

export default AppsPage;