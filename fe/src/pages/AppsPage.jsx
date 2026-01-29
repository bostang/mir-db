import { useState, useEffect, useMemo, memo } from 'react';
import { getApps, createApp, deleteApp, updateApp } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card } from 'react-bootstrap';

// --- KOMPONEN FORM (Terisolasi agar tidak re-render tabel saat mengetik) ---
const AppForm = ({ initialData, editingId, onSave, onCancel }) => {
    const [localData, setLocalData] = useState({ 
        application_id: '', nama_aplikasi: '', deskripsi_aplikasi: '', business_owner: '' 
    });

    // Update form saat tombol 'Edit' di tabel ditekan
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
        // Reset form jika bukan mode edit
        if (!editingId) {
            setLocalData({ application_id: '', nama_aplikasi: '', deskripsi_aplikasi: '', business_owner: '' });
        }
    };

    return (
        <Card className="mb-4">
            <Card.Header>{editingId ? 'Edit Aplikasi' : 'Tambah Aplikasi Baru'}</Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" name="application_id" placeholder="Application ID" value={localData.application_id} onChange={handleChange} required disabled={!!editingId} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" name="nama_aplikasi" placeholder="Nama Aplikasi" value={localData.nama_aplikasi} onChange={handleChange} required />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" name="deskripsi_aplikasi" placeholder="Deskripsi Singkat" value={localData.deskripsi_aplikasi} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Control type="text" name="business_owner" placeholder="Business Owner" value={localData.business_owner} onChange={handleChange} />
                            </Form.Group>
                        </Col>
                        <Col xs="auto">
                            <Button variant="primary" type="submit">
                                {editingId ? 'Simpan Perubahan' : 'Tambah'}
                            </Button>
                            {editingId && (
                                <Button variant="secondary" className="ms-2" onClick={onCancel}>Batal</Button>
                            )}
                        </Col>
                    </Row>
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
    const [selectedApp, setSelectedApp] = useState(null); // Data yang dikirim ke form saat edit

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
        // Scroll ke atas agar user tahu form sedang dalam mode edit
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

    // Logic Pencarian Tetap Real-time (useMemo untuk efisiensi tabel)
    const filteredApps = useMemo(() => {
        return apps.filter(app =>
            app.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (app.deskripsi_aplikasi && app.deskripsi_aplikasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (app.business_owner && app.business_owner.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [apps, searchTerm]);

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

            {/* Form sekarang berdiri sendiri, mengetik di sini tidak mengganggu tabel */}
            <AppForm 
                initialData={selectedApp} 
                editingId={editingId} 
                onSave={handleFormSubmit}
                onCancel={() => { setEditingId(null); setSelectedApp(null); }}
            />

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
                            <td>{app.deskripsi_aplikasi}</td>
                            <td>{app.business_owner}</td>
                            <td>
                                <Button variant="warning" size="sm" className="me-2" onClick={() => handleEdit(app)}>Edit</Button>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(app.application_id)}>Hapus</Button>
                            </td>
                        </tr>
                    ))}
                    {filteredApps.length === 0 && (
                        <tr>
                            <td colSpan="5" className="text-center">Data tidak ditemukan</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
}

export default AppsPage;