import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { getApps, getPeople, addAppPeopleRelation, getAppPeopleRelations, deleteAppPeopleRelation } from '../services/api';
import { Container, Form, Button, Row, Col, Card, Alert, Table, Badge } from 'react-bootstrap';

// --- KOMPONEN FORM TERISOLASI (Mencegah Lagging saat Mengetik) ---
const RelationForm = memo(({ apps, onSave, fetchPICs, people }) => {
    const [selectedApp, setSelectedApp] = useState('');
    const [selectedPeople, setSelectedPeople] = useState('');
    const [note, setNote] = useState('');
    const [appSearchTerm, setAppSearchTerm] = useState('');
    const [picSearchTerm, setPicSearchTerm] = useState('');

    // Debounced search untuk PIC
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
            note: note 
        });
        // Reset local state setelah save
        setSelectedApp('');
        setSelectedPeople('');
        setNote('');
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
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">3. Catatan (Khusus Relasi Ini)</Form.Label>
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

// --- HALAMAN UTAMA ---
function AppPeoplePage() {
    const [apps, setApps] = useState([]);
    const [people, setPeople] = useState([]);
    const [relations, setRelations] = useState([]);
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

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
            console.error('Failed to fetch data:', error);
            setMessage('Gagal memuat data.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

    const filteredRelations = useMemo(() => {
        const s = searchTerm.toLowerCase();
        return relations.filter(rel => 
            (rel.application_id || '').toLowerCase().includes(s) ||
            (rel.nama_aplikasi || '').toLowerCase().includes(s) ||
            (rel.npp || '').toLowerCase().includes(s) ||
            (rel.nama_pic || '').toLowerCase().includes(s) ||
            (rel.note || '').toLowerCase().includes(s)
        );
    }, [relations, searchTerm]);

    return (
        <Container className="mt-4">
            <h1 className="mb-4 text-center">Kelola Relasi PIC ke Aplikasi</h1>
            {message && (
                <Alert variant={message.includes('Gagal') ? 'danger' : 'success'} dismissible onClose={() => setMessage('')}>
                    {message}
                </Alert>
            )}
            
            {/* Form sekarang diisolasi dalam komponen RelationForm */}
            <RelationForm 
                apps={apps} 
                people={people}
                fetchPICs={fetchPICs}
                onSave={handleSaveRelation} 
            />

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Daftar Relasi Aktif</h2>
                <Badge bg="info">{filteredRelations.length} Data ditemukan</Badge>
            </div>

            <Form.Control
                type="text"
                className="mb-4 shadow-sm"
                placeholder="🔍 Cari relasi berdasarkan keyword apapun..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <Table striped bordered hover responsive className="shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID Aplikasi</th>
                        <th>Nama Aplikasi</th>
                        <th>NPP PIC</th>
                        <th>Nama PIC</th>
                        <th>Catatan Relasi</th>
                        <th className="text-center">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRelations.map((rel, index) => (
                        <tr key={`${rel.application_id}-${rel.npp}-${index}`}>
                            <td><code className="text-dark fw-bold">{rel.application_id}</code></td>
                            <td>{rel.nama_aplikasi}</td>
                            <td>{rel.npp}</td>
                            <td className="fw-bold text-primary">{rel.nama_pic || 'Tidak Diketahui'}</td>
                            <td className="fst-italic text-muted">{rel.note || '-'}</td>
                            <td className="text-center">
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(rel.application_id, rel.npp)}>
                                    Hapus
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default AppPeoplePage;