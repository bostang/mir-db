import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { getLinks, getApps, createLink, updateLink, deleteLink } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';

// --- KOMPONEN FORM TERISOLASI ---
const LinkForm = memo(({ apps, editingId, initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ 
        application_id: '', 
        docs_link: '', 
        warroom_link: '', 
        notes: '' 
    });
    const [appSearch, setAppSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Update form saat mode edit berubah
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setAppSearch(editingId ? `${initialData.application_id}` : '');
        } else {
            setFormData({ application_id: '', docs_link: '', warroom_link: '', notes: '' });
            setAppSearch('');
        }
    }, [initialData, editingId]);

    const filteredApps = useMemo(() => {
        if (!appSearch || editingId) return [];
        return apps.filter(app => 
            app.nama_aplikasi.toLowerCase().includes(appSearch.toLowerCase()) ||
            app.application_id.toLowerCase().includes(appSearch.toLowerCase())
        ).slice(0, 5);
    }, [apps, appSearch, editingId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Card className="mb-4 shadow-sm border-0">
            <Card.Header className={editingId ? "bg-warning text-dark" : "bg-primary text-white"}>
                <h5 className="mb-0">{editingId ? `Edit Pranala: ${editingId}` : 'Tambah Pranala Baru'}</h5>
            </Card.Header>
            <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6} className="position-relative">
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Cari Aplikasi</Form.Label>
                                <Form.Control 
                                    type="text"
                                    placeholder="Ketik Nama atau ID Aplikasi..."
                                    value={appSearch}
                                    onChange={(e) => {
                                        setAppSearch(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    disabled={!!editingId}
                                    required={!formData.application_id}
                                />
                                {showSuggestions && filteredApps.length > 0 && (
                                    <ListGroup className="position-absolute w-100 shadow-lg" style={{ zIndex: 1000 }}>
                                        {filteredApps.map(app => (
                                            <ListGroup.Item 
                                                key={app.application_id} 
                                                action 
                                                onClick={() => {
                                                    setFormData({ ...formData, application_id: app.application_id });
                                                    setAppSearch(`${app.nama_aplikasi} (${app.application_id})`);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {app.nama_aplikasi} <small className="text-muted">({app.application_id})</small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Link Documents</Form.Label>
                                <Form.Control 
                                    type="url" 
                                    placeholder="https://docs.google.com/..." 
                                    value={formData.docs_link} 
                                    onChange={(e) => setFormData({...formData, docs_link: e.target.value})} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Link Warroom</Form.Label>
                                <Form.Control 
                                    type="url" 
                                    placeholder="https://teams.microsoft.com/..." 
                                    value={formData.warroom_link} 
                                    onChange={(e) => setFormData({...formData, warroom_link: e.target.value})} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Catatan</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={1}
                                    placeholder="Keterangan link..." 
                                    value={formData.notes} 
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex gap-2">
                        <Button variant={editingId ? "warning" : "primary"} type="submit">
                            {editingId ? 'Simpan Perubahan' : 'Tambah Pranala'}
                        </Button>
                        {editingId && (
                            <Button variant="secondary" onClick={onCancel}>Batal</Button>
                        )}
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
});

// --- HALAMAN UTAMA ---
function LinksPage() {
    const [links, setLinks] = useState([]);
    const [apps, setApps] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState(null);

    const fetchLinksAndApps = async () => {
        try {
            const [linksRes, appsRes] = await Promise.all([getLinks(), getApps()]);
            setLinks(linksRes.data);
            setApps(appsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => { fetchLinksAndApps(); }, []);

    const handleSave = async (formData) => {
        try {
            if (editingId) {
                await updateLink(editingId, formData);
            } else {
                await createLink(formData);
            }
            setEditingId(null);
            setEditData(null);
            fetchLinksAndApps();
        } catch (error) {
            alert(`Gagal menyimpan: ${error.response?.data || error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Hapus pranala untuk ${id}?`)) {
            try {
                await deleteLink(id);
                fetchLinksAndApps();
            } catch (error) {
                alert("Gagal menghapus.");
            }
        }
    };

    const filteredLinks = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return links.filter(link =>
            link.application_id.toLowerCase().includes(s) ||
            (link.nama_aplikasi || '').toLowerCase().includes(s) ||
            (link.notes || '').toLowerCase().includes(s)
        );
    }, [links, searchTerm]);

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Pranala Aplikasi</h1>
                <Badge bg="dark">{filteredLinks.length} Aplikasi Terhubung</Badge>
            </div>
            
            <LinkForm 
                apps={apps} 
                editingId={editingId} 
                initialData={editData}
                onSave={handleSave}
                onCancel={() => { setEditingId(null); setEditData(null); }}
            />

            <Form.Control
                type="text"
                className="mb-4 shadow-sm"
                placeholder="🔍 Cari ID, Nama Aplikasi, atau Catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Table striped bordered hover responsive className="shadow-sm bg-white">
                <thead className="table-dark">
                    <tr>
                        <th>Aplikasi</th>
                        <th className="text-center">Pranala</th>
                        <th>Catatan</th>
                        <th className="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLinks.map((link) => (
                        <tr key={link.application_id}>
                            <td>
                                <div className="fw-bold">{link.nama_aplikasi}</div>
                                <small className="text-muted">{link.application_id}</small>
                            </td>
                            <td className="text-center">
                                <div className="d-flex flex-column gap-1">
                                    {link.docs_link ? 
                                        <Button as="a" href={link.docs_link} target="_blank" size="sm" variant="outline-info">Docs</Button> : 
                                        <small className="text-muted">No Docs</small>
                                    }
                                    {link.warroom_link ? 
                                        <Button as="a" href={link.warroom_link} target="_blank" size="sm" variant="outline-danger">Warroom</Button> : 
                                        <small className="text-muted">No Warroom</small>
                                    }
                                </div>
                            </td>
                            <td className="small">{link.notes || '-'}</td>
                            <td className="text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                    <Button variant="warning" size="sm" onClick={() => {
                                        setEditingId(link.application_id);
                                        setEditData(link);
                                        window.scrollTo(0,0);
                                    }}>Edit</Button>
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(link.application_id)}>Hapus</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default LinksPage;