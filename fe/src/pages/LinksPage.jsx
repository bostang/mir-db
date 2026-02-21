import { useState, useEffect, useMemo, memo } from 'react';
import { getLinks, getApps, createLink, updateLink, deleteLink } from '../services/api';
import { Container, Table, Form, Button, Row, Col, Card, Badge, ListGroup } from 'react-bootstrap';

// --- KOMPONEN FORM TERISOLASI ---
const LinkForm = memo(({ apps, editingId, initialData, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ 
        application_id: '', 
        docs_link: '', 
        warroom_link: '', 
        mini_warroom_link: '',
        notes: '' 
    });
    const [appSearch, setAppSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Sync state saat mode edit atau data awal berubah
    useEffect(() => {
        if (initialData) {
            setFormData({
                application_id: initialData.application_id || '',
                docs_link: initialData.docs_link || '',
                warroom_link: initialData.warroom_link || '',
                mini_warroom_link: initialData.mini_warroom_link || '',
                notes: initialData.notes || ''
            });
            setAppSearch(initialData.nama_aplikasi ? `${initialData.nama_aplikasi} (${initialData.application_id})` : initialData.application_id);
        } else {
            setFormData({ application_id: '', docs_link: '', warroom_link: '', mini_warroom_link: '', notes: '' });
            setAppSearch('');
        }
    }, [initialData, editingId]);

    const filteredApps = useMemo(() => {
        if (!appSearch || editingId || appSearch.includes('(')) return [];
        const s = appSearch.toLowerCase();
        return apps.filter(app => 
            app.nama_aplikasi.toLowerCase().includes(s) ||
            app.application_id.toLowerCase().includes(s)
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
                                    required
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
                                    value={formData.docs_link || ''} 
                                    onChange={(e) => setFormData({...formData, docs_link: e.target.value})} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Link Warroom</Form.Label>
                                <Form.Control 
                                    type="url" 
                                    value={formData.warroom_link || ''} 
                                    onChange={(e) => setFormData({...formData, warroom_link: e.target.value})} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Link MINI-Warroom</Form.Label>
                                <Form.Control 
                                    type="url" 
                                    value={formData.mini_warroom_link || ''} 
                                    onChange={(e) => setFormData({...formData, mini_warroom_link: e.target.value})} 
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-bold">Catatan</Form.Label>
                                <Form.Control 
                                    as="textarea" 
                                    rows={1}
                                    value={formData.notes || ''} 
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
            // Menangani berbagai kemungkinan struktur response axios
            setLinks(linksRes.data?.data || linksRes.data || []);
            setApps(appsRes.data?.data || appsRes.data || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => { fetchLinksAndApps(); }, []);

    const handleSave = async (formData) => {
        try {
            // Bersihkan payload dari null/undefined
            const cleanData = {
                ...formData,
                docs_link: formData.docs_link || '',
                warroom_link: formData.warroom_link || '',
                mini_warroom_link: formData.mini_warroom_link || '',
                notes: formData.notes || ''
            };

            if (editingId) {
                await updateLink(editingId, cleanData);
            } else {
                await createLink(cleanData);
            }
            
            setEditingId(null);
            setEditData(null);
            fetchLinksAndApps();
        } catch (error) {
            // Jika backend kirim 404 karena row tidak berubah, tetap anggap sukses di UI
            if (error.response?.status === 404 && editingId) {
                setEditingId(null);
                setEditData(null);
                fetchLinksAndApps();
            } else {
                alert(`Gagal: ${error.response?.data?.message || error.message}`);
            }
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
            (link.application_id || '').toLowerCase().includes(s) ||
            (link.nama_aplikasi || '').toLowerCase().includes(s) ||
            (link.notes || '').toLowerCase().includes(s)
        );
    }, [links, searchTerm]);

    return (
            <Container className="py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '1.5rem' }}>🔗</span>
                        <h2 className="fw-bold text-dark mb-0">Pranala Aplikasi</h2>
                    </div>
                    <Badge bg="dark" className="px-3 py-2">{filteredLinks.length} Terhubung</Badge>
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
                    className="mb-4 py-2 px-3 shadow-sm border" // Pastikan ada class 'border'
                    placeholder="🔍 Cari ID, Nama Aplikasi, atau Catatan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Card className="border shadow-sm overflow-hidden"> {/* overflow-hidden agar radius card tidak terpotong table */}
                    <Table bordered hover responsive className="mb-0">
                        <thead className="bg-light border-bottom"> {/* Tambah garis bawah pada header */}
                            <tr className="align-middle"> {/* Menambah align-middle agar teks center secara vertikal */}
                                <th className="px-3 py-3 text-secondary text-center" style={{ width: '30%' }}>Aplikasi</th>
                                <th className="text-center py-3 text-secondary">Pranala Cepat</th>
                                <th className="py-3 text-secondary text-center">Catatan</th>
                                <th className="text-center py-3 text-secondary" style={{ width: '15%' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="border-top-0">
                            {filteredLinks.length > 0 ? filteredLinks.map((link) => (
                                <tr key={link.application_id} className="align-middle border-bottom">
                                    <td className="px-3 py-3">
                                        <div className="fw-bold text-primary">{link.nama_aplikasi}</div>
                                        <code className="small bg-light px-1 text-danger">{link.application_id}</code>
                                    </td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-1">
                                            {link.docs_link && <Button href={link.docs_link} target="_blank" size="sm" variant="info" className="text-white btn-xs">Docs</Button>}
                                            {link.warroom_link && <Button href={link.warroom_link} target="_blank" size="sm" variant="danger" className="btn-xs">WR</Button>}
                                            {link.mini_warroom_link && <Button href={link.mini_warroom_link} target="_blank" size="sm" variant="success" className="btn-xs">Mini</Button>}
                                            {!link.docs_link && !link.warroom_link && !link.mini_warroom_link && <span className="text-muted small italic">Belum ada link</span>}
                                        </div>
                                    </td>
                                    <td className="small text-muted">{link.notes || '-'}</td>
                                    <td className="text-center">
                                        <div className="d-flex justify-content-center gap-2">
                                            <Button 
                                                variant="outline-warning" 
                                                size="sm" 
                                                onClick={() => {
                                                    setEditingId(link.application_id);
                                                    setEditData(link);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                onClick={() => handleDelete(link.application_id)}
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-5 text-muted">
                                        <div className="mb-2">📭</div>
                                        Data tidak ditemukan
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Card>
            </Container>
        );
}

export default LinksPage;