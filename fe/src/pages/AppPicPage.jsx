import { useState, useEffect } from 'react';
import { getApps, getPics, addAppPicRelation, getAppPicRelations, deleteAppPicRelation } from '../services/api';
import { Container, Form, Button, Row, Col, Card, Alert, Table } from 'react-bootstrap';

function AppPicPage() {
    const [apps, setApps] = useState([]);
    const [pics, setPics] = useState([]);
    const [relations, setRelations] = useState([]);
    const [selectedApp, setSelectedApp] = useState('');
    const [selectedPic, setSelectedPic] = useState('');
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // State baru untuk search bar

    const fetchData = async () => {
        try {
            const [appsRes, picsRes, relationsRes] = await Promise.all([getApps(), getPics(), getAppPicRelations()]);
            setApps(appsRes.data);
            setPics(picsRes.data);
            setRelations(relationsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            setMessage('Gagal memuat data aplikasi, PIC, dan relasi.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!selectedApp || !selectedPic) {
            setMessage('Mohon pilih Aplikasi dan PIC.');
            return;
        }

        const relationData = {
            application_id: selectedApp,
            npp: selectedPic,
            note: note
        };

        try {
            await addAppPicRelation(relationData);
            setMessage('Relasi berhasil ditambahkan!');
            setSelectedApp('');
            setSelectedPic('');
            setNote('');
            fetchData();
        } catch (error) {
            console.error('Failed to add relation:', error);
            setMessage('Gagal menambahkan relasi. Relasi mungkin sudah ada.');
        }
    };

    const handleDelete = async (application_id, npp) => {
        try {
            await deleteAppPicRelation(application_id, npp);
            setMessage('Relasi berhasil dihapus!');
            fetchData();
        } catch (error) {
            console.error('Failed to delete relation:', error);
            setMessage('Gagal menghapus relasi.');
        }
    };

    // Filter relasi berdasarkan searchTerm
    const filteredRelations = relations.filter(rel =>
        rel.application_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rel.nama_aplikasi && rel.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rel.npp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (rel.nama_pic && rel.nama_pic.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Kelola Relasi PIC ke Aplikasi</h1>
            {message && <Alert variant={message.includes('Gagal') ? 'danger' : 'success'}>{message}</Alert>}
            
            {/* Form Tambah Relasi */}
            <Card className="mb-4">
                <Card.Header>Tambah Relasi Baru</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pilih Aplikasi</Form.Label>
                                    <Form.Control as="select" value={selectedApp} onChange={(e) => setSelectedApp(e.target.value)} required>
                                        <option value="">-- Pilih Aplikasi --</option>
                                        {apps.map((app) => (
                                            <option key={app.application_id} value={app.application_id}>{app.nama_aplikasi} ({app.application_id})</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Pilih PIC</Form.Label>
                                    <Form.Control as="select" value={selectedPic} onChange={(e) => setSelectedPic(e.target.value)} required>
                                        <option value="">-- Pilih PIC --</option>
                                        {pics.map((pic) => (
                                            <option key={pic.npp} value={pic.npp}>{pic.nama} ({pic.npp})</option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Catatan (Opsional)</Form.Label>
                            <Form.Control as="textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                        </Form.Group>
                        <div className="d-grid gap-2">
                            <Button variant="primary" type="submit">
                                Tambahkan Relasi
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            {/* Tabel untuk menampilkan dan mengelola relasi yang sudah ada */}
            {relations.length > 0 && (
                <>
                    <h2 className="mt-5 mb-3">Relasi yang Sudah Ada</h2>
                    {/* Tambahkan Search Bar di sini */}
                    <Form className="mb-4">
                        <Form.Group>
                            <Form.Control
                                type="text"
                                placeholder="Cari relasi (ID Aplikasi, Nama Aplikasi, NPP PIC, atau Nama PIC)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>ID Aplikasi</th>
                                <th>Nama Aplikasi</th>
                                <th>NPP PIC</th>
                                <th>Nama PIC</th>
                                <th>Catatan</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Gunakan data yang sudah difilter */}
                            {filteredRelations.map((rel, index) => (
                                <tr key={index}>
                                    <td>{rel.application_id}</td>
                                    <td>{rel.nama_aplikasi}</td>
                                    <td>{rel.npp}</td>
                                    <td>{rel.nama_pic}</td>
                                    <td>{rel.note}</td>
                                    <td>
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(rel.application_id, rel.npp)}>Hapus</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </Container>
    );
}

export default AppPicPage;