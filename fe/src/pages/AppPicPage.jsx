import { useState, useEffect } from 'react';
import { getApps, getPics, addAppPicRelation } from '../services/api';
import { Container, Form, Button, Row, Col, Card, Alert } from 'react-bootstrap';

function AppPicPage() {
    const [apps, setApps] = useState([]);
    const [pics, setPics] = useState([]);
    const [selectedApp, setSelectedApp] = useState('');
    const [selectedPic, setSelectedPic] = useState('');
    const [note, setNote] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [appsRes, picsRes] = await Promise.all([getApps(), getPics()]);
                setApps(appsRes.data);
                setPics(picsRes.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setMessage('Gagal memuat data aplikasi dan PIC.');
            }
        };
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
        } catch (error) {
            console.error('Failed to add relation:', error);
            setMessage('Gagal menambahkan relasi. Relasi mungkin sudah ada.');
        }
    };

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Tambahkan Relasi PIC ke Aplikasi</h1>
            {message && <Alert variant={message.includes('Gagal') ? 'danger' : 'success'}>{message}</Alert>}
            <Card>
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
        </Container>
    );
}

export default AppPicPage;