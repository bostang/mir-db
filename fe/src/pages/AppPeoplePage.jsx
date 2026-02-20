import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { getApps, getPeople, addAppPeopleRelation, getAppPeopleRelations, deleteAppPeopleRelation, updateAppPeopleRelation } from '../services/api';
import { Container, Form, Button, Row, Col, Card, Alert, Table, Badge, Modal } from 'react-bootstrap';

// --- KOMPONEN FORM TERISOLASI (Tetap sama) ---
const RelationForm = memo(({ apps, onSave, fetchPICs, people }) => {
    const [selectedApp, setSelectedApp] = useState('');
    const [selectedPeople, setSelectedPeople] = useState('');
    const [note, setNote] = useState('');
    const [layer, setLayer] = useState('');
    const [appSearchTerm, setAppSearchTerm] = useState('');
    const [picSearchTerm, setPicSearchTerm] = useState('');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPICs(picSearchTerm);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [picSearchTerm, fetchPICs]);

    const filteredAppsForDropdown = useMemo(() => {
        return apps.filter(app => 
            (app.nama_aplikasi || '').toLowerCase().includes(appSearchTerm.toLowerCase()) ||
            (app.application_id || '').toLowerCase().includes(appSearchTerm.toLowerCase())
        ).slice(0, 50);
    }, [apps, appSearchTerm]);

    const handleInternalSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            application_id: selectedApp, 
            npp: selectedPeople, 
            note: note,
            layer: layer 
        });
        setSelectedApp('');
        setSelectedPeople('');
        setNote('');
        setLayer('');
        setAppSearchTerm('');
        setPicSearchTerm('');
    };

    return (
        <Card className="shadow-sm mb-5">
            <Card.Header className="bg-primary text-white">Tambah Relasi Baru</Card.Header>
            <Card.Body>
                <Form onSubmit={handleInternalSubmit}>
                    <Row>
                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-bold">1. Cari & Pilih Aplikasi</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ketik ID atau Nama Aplikasi..." 
                                className="mb-2"
                                value={appSearchTerm}
                                onChange={(e) => setAppSearchTerm(e.target.value)}
                            />
                            <Form.Select 
                                value={selectedApp} 
                                onChange={(e) => setSelectedApp(e.target.value)}
                                required
                            >
                                <option value="">-- Hasil Pencarian Aplikasi --</option>
                                {filteredAppsForDropdown.map((app) => (
                                    <option key={app.application_id} value={app.application_id}>
                                        {app.nama_aplikasi} ({app.application_id})
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        <Col md={6} className="mb-3">
                            <Form.Label className="fw-bold">2. Cari & Pilih PIC</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Ketik Nama atau NPP PIC..." 
                                className="mb-2"
                                value={picSearchTerm}
                                onChange={(e) => setPicSearchTerm(e.target.value)}
                            />
                            <Form.Select 
                                value={selectedPeople} 
                                onChange={(e) => setSelectedPeople(e.target.value)}
                                required
                            >
                                <option value="">-- Hasil Pencarian PIC --</option>
                                {people.map((pic) => (
                                    <option key={pic.npp} value={pic.npp}>
                                        {pic.nama} ({pic.npp})
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>
                        
                        <Col md={12} className="mb-3">
                            <Form.Label className="fw-bold">3. Layer</Form.Label>
                            <Form.Select 
                                value={layer} 
                                onChange={(e) => setLayer(e.target.value)}
                                required
                            >
                                <option value="">-- Pilih Layer --</option>
                                <option value="L1">L1</option>
                                <option value="L2">L2</option>
                                <option value="L3">L3</option>
                                <option value="Business">Business</option>
                                <option value="Surroundings">Surroundings</option>
                                <option value="Management">Management</option>
                                <option value="Principal">Principal</option>
                                <option value="Others">Others</option>
                            </Form.Select>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">4. Catatan (Khusus Relasi Ini)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={2} 
                            placeholder="Contoh: PIC Utama, Cadangan, atau Role spesifik..."
                            value={note} 
                            onChange={(e) => setNote(e.target.value)} 
                        />
                    </Form.Group>

                    <div className="d-grid">
                        <Button variant="primary" type="submit" size="lg">
                            Hubungkan PIC ke Aplikasi
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
});

// Fungsi Helper untuk warna badge
const getLayerBadgeColor = (layer) => {
    switch (layer?.toUpperCase()) {
        case 'L1': return 'danger';    // Merah (Urgent/Frontline)
        case 'L2': return 'success';   // Hijau (IT Support)
        case 'L3': return 'primary';   // Biru (Developer/Expert)
        case 'BUSINESS': return 'info'; // Biru Muda/Cyan
        case 'MANAGEMENT': return 'dark'; // Hitam
        default: return 'secondary';   // Abu-abu (Others/NA)
    }
};

// --- HALAMAN UTAMA ---
function AppPeoplePage() {
    const [apps, setApps] = useState([]);
    const [people, setPeople] = useState([]);
    const [relations, setRelations] = useState([]);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // State Filter
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedLayer, setSelectedLayer] = useState('');

    const [showEdit, setShowEdit] = useState(false);
    const [editData, setEditData] = useState({ application_id: '', npp: '', note: '', layer: '', nama_pic: '', nama_aplikasi: '' });

    const fetchPICs = useCallback(async (search = '') => {
        try {
            const res = await getPeople(1, 100, search); 
            setPeople(res.data);
        } catch (error) {
            console.error('Failed to fetch PICs:', error);
        }
    }, []);

    const fetchData = async () => {
        try {
            const [appsRes, relationsRes] = await Promise.all([
                getApps(), 
                getAppPeopleRelations()
            ]);
            setApps(appsRes.data);
            setRelations(relationsRes.data);
            fetchPICs(); 
        } catch (error) {
            setMessage('Gagal memuat data.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- LOGIKA FILTER BERLAPIS (MULTI-LEVEL FILTER) ---

    // 1. Filter awal berdasarkan Search Term
    const filteredBySearch = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return relations.filter(rel => 
            (rel.application_id || '').toLowerCase().includes(s) ||
            (rel.nama_aplikasi || '').toLowerCase().includes(s) ||
            (rel.npp || '').toLowerCase().includes(s) ||
            (rel.nama_pic || '').toLowerCase().includes(s)
        );
    }, [relations, searchTerm]);

    // 2. Tentukan Divisi yang tersedia berdasarkan hasil Search
    const availableDivisions = useMemo(() => {
        const divs = filteredBySearch
            .map(rel => rel.division)
            .filter(div => div && div.trim() !== ''); 
        return [...new Set(divs)].sort(); 
    }, [filteredBySearch]);

    // 3. Tentukan Layer yang tersedia berdasarkan hasil Search + Filter Divisi
    const availableLayers = useMemo(() => {
        const dataForLayerDropdown = filteredBySearch.filter(rel => 
            selectedDivision === '' || rel.division === selectedDivision
        );
        const layers = dataForLayerDropdown
            .map(rel => rel.layer)
            .filter(l => l && l.trim() !== '');
        return [...new Set(layers)].sort();
    }, [filteredBySearch, selectedDivision]);

    // 4. Final Filter untuk Tabel
    const finalFilteredRelations = useMemo(() => {
        return filteredBySearch.filter(rel => {
            const matchDiv = selectedDivision === '' || rel.division === selectedDivision;
            const matchLayer = selectedLayer === '' || rel.layer === selectedLayer;
            return matchDiv && matchLayer;
        });
    }, [filteredBySearch, selectedDivision, selectedLayer]);

    // 5. Auto-reset jika filter menjadi tidak valid
    useEffect(() => {
        if (selectedDivision && !availableDivisions.includes(selectedDivision)) {
            setSelectedDivision('');
        }
    }, [availableDivisions, selectedDivision]);

    useEffect(() => {
        if (selectedLayer && !availableLayers.includes(selectedLayer)) {
            setSelectedLayer('');
        }
    }, [availableLayers, selectedLayer]);


    const handleSaveRelation = async (relationData) => {
        try {
            await addAppPeopleRelation(relationData);
            setMessage('Relasi berhasil ditambahkan!');
            fetchData();
        } catch (error) {
            setMessage('Gagal menambahkan relasi. Data mungkin duplikat.');
        }
    };

    const handleDelete = async (application_id, npp) => {
        if (!window.confirm('Hapus relasi ini?')) return;
        try {
            await deleteAppPeopleRelation(application_id, npp);
            setMessage('Relasi berhasil dihapus!');
            fetchData();
        } catch (error) {
            setMessage('Gagal menghapus relasi.');
        }
    };

    const handleEditClick = (rel) => {
        setEditData(rel);
        setShowEdit(true);
    };

    const handleUpdate = async () => {
        try {
            await updateAppPeopleRelation(editData);
            setShowEdit(false);
            setMessage('Relasi berhasil diperbarui!');
            fetchData();
        } catch (error) { 
            setMessage('Gagal memperbarui relasi.'); 
        }
    };

    return (
        <Container className="mt-4 pb-5">
            <h1 className="mb-4 text-center">Kelola Relasi PIC ke Aplikasi</h1>
            
            {message && (
                <Alert variant={message.includes('Gagal') ? 'danger' : 'success'} dismissible onClose={() => setMessage('')}>
                    {message}
                </Alert>
            )}
            
            <RelationForm 
                apps={apps} 
                people={people}
                fetchPICs={fetchPICs}
                onSave={handleSaveRelation} 
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Daftar Relasi Aktif</h2>
                <Badge bg="info">{finalFilteredRelations.length} Data ditemukan</Badge>
            </div>

            {/* --- UI FILTER (SEARCH, DIVISI, LAYER) --- */}
            <Row className="mb-4 g-2">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        className="shadow-sm"
                        placeholder="🔍 Cari keyword (Nama, ID, NPP)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col md={3}>
                    <Form.Select 
                        className="shadow-sm"
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                    >
                        <option value="">-- Semua Divisi ({availableDivisions.length}) --</option>
                        {availableDivisions.map(div => (
                            <option key={div} value={div}>{div}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select 
                        className="shadow-sm"
                        value={selectedLayer}
                        onChange={(e) => setSelectedLayer(e.target.value)}
                    >
                        <option value="">-- Semua Layer ({availableLayers.length}) --</option>
                        {availableLayers.map(l => (
                            <option key={l} value={l}>{l}</option>
                        ))}
                    </Form.Select>
                </Col>
            </Row>

            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID Aplikasi</th>
                        <th>Nama Aplikasi</th>
                        <th>NPP PIC</th>
                        <th>Nama PIC</th>
                        <th>Posisi</th>
                        <th>Divisi</th>
                        <th>Layer</th>
                        <th>Catatan</th>
                        <th className="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {finalFilteredRelations.map((rel, index) => (
                        <tr key={`${rel.application_id}-${rel.npp}-${index}`}>
                            <td><code className="text-dark fw-bold">{rel.application_id}</code></td>
                            <td>{rel.nama_aplikasi}</td>
                            <td>{rel.npp}</td>
                            <td className="fw-bold text-primary">{rel.nama_pic}</td>
                            <td><small>{rel.posisi || '-'}</small></td>
                            <td><small>{rel.division || '-'}</small></td>
                            
                            {/* BADGE LAYER DENGAN WARNA DINAMIS */}
                            <td>
                                <Badge 
                                    bg={getLayerBadgeColor(rel.layer)} 
                                    style={{ width: '80px', fontSize: '0.75rem' }}
                                >
                                    {rel.layer || 'N/A'}
                                </Badge>
                            </td>

                            <td className="fst-italic text-muted"><small>{rel.note || '-'}</small></td>
                            <td className="text-center">
                                <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleEditClick(rel)}>
                                    Edit
                                </Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(rel.application_id, rel.npp)}>
                                    Hapus
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {finalFilteredRelations.length === 0 && (
                        <tr>
                            <td colSpan="9" className="text-center py-4 text-muted">Data tidak ditemukan.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
                <Modal.Header closeButton className="bg-warning text-dark">
                    <Modal.Title>Edit Relasi PIC</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Aplikasi</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={`${editData.nama_aplikasi} (${editData.application_id})`} 
                                disabled 
                            />
                            <Form.Text className="text-muted">Aplikasi tidak dapat diubah (Hapus dan buat baru jika salah).</Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">PIC</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={`${editData.nama_pic} (${editData.npp})`} 
                                disabled 
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Layer</Form.Label>
                            <Form.Select 
                                value={editData.layer || ''} 
                                onChange={(e) => setEditData({ ...editData, layer: e.target.value })}
                            >
                                <option value="">-- Pilih Layer --</option>
                                <option value="L1">L1</option>
                                <option value="L2">L2</option>
                                <option value="L3">L3</option>
                                <option value="Business">Business</option>
                                <option value="Management">Management</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Catatan Relasi</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3}
                                value={editData.note || ''} 
                                onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEdit(false)}>
                        Batal
                    </Button>
                    <Button variant="warning" onClick={handleUpdate}>
                        Simpan Perubahan
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default AppPeoplePage;