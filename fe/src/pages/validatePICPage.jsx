import { useState, useEffect, useMemo } from 'react';
import { Container, Table, Form, Card, Alert, Badge, Row, Col, ButtonGroup, Button, ListGroup, Spinner } from 'react-bootstrap';
import { getApps, getPeopleByAppId, bulkCheckPeople, instantRegisterPIC} from '../services/api';
import axios from 'axios';

function ValidatePICPage() {
    // State Aplikasi & Pencarian
    const [searchTerm, setSearchTerm] = useState('');
    const [allApps, setAllApps] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedApp, setSelectedApp] = useState(null);

    // State Data
    const [masterPeople, setMasterPeople] = useState([]); // Hanya berisi orang yang relevan hasil bulk-check
    const [appPICs, setAppPICs] = useState([]); // Email PIC yang sudah terdaftar di aplikasi terpilih
    const [csvData, setCsvData] = useState([]);
    
    // State UI
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedDivision, setSelectedDivision] = useState('All');
    const [uploadMode, setUploadMode] = useState('teams');

    // 1. Load daftar aplikasi untuk autocomplete
    useEffect(() => {
        getApps()
            .then(res => setAllApps(res.data))
            .catch(err => console.error("Gagal load aplikasi:", err));
    }, []);

    // 2. Logika Autocomplete Saran Aplikasi
    useEffect(() => {
        if (searchTerm.length >= 1 && !selectedApp) {
            const filtered = allApps.filter(app => 
                app.nama_aplikasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.application_id.toLowerCase().includes(searchTerm.toLowerCase())
            ).slice(0, 8);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [searchTerm, allApps, selectedApp]);

    // 3. Ambil data PIC yang sudah terhubung ke aplikasi saat aplikasi dipilih
    useEffect(() => {
        const fetchAppPICs = async () => {
            if (!selectedApp) { setAppPICs([]); return; }
            setLoading(true);
            try {
                const res = await getPeopleByAppId(selectedApp.application_id);
                // Kita ambil emailnya saja untuk mempermudah perbandingan isRegisteredInApp
                const emails = res.data.map(p => (p.email || '').toLowerCase().trim());
                setAppPICs(emails);
            } catch (err) {
                console.error("Gagal fetch PIC aplikasi:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAppPICs();
    }, [selectedApp]);

    // Helper: Parsing MS Teams CSV
    const processTeamsCSV = (text) => {
        const lines = text.split(/\r?\n/);
        let inParticipantsSection = false;
        const results = [];
        const seenEmails = new Set();

        lines.forEach((line) => {
            if (line.includes('2. Participants')) { inParticipantsSection = true; return; }
            if (line.includes('3. In-Meeting Activities')) { inParticipantsSection = false; return; }

            if (inParticipantsSection && line.trim() !== "") {
                const cols = line.split('\t'); 
                if (cols.length >= 5) {
                    const nama = cols[0].trim();
                    const email = cols[4].trim().toLowerCase();
                    if (nama !== "Name" && email !== "" && !seenEmails.has(email)) {
                        results.push({ nama, email });
                        seenEmails.add(email);
                    }
                }
            }
        });
        return results;
    };

    // 4. Handle Upload & Optimized Bulk Check
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setLoading(true);
        setError(null);
        setCsvData([]);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                let parsedData = [];

                if (uploadMode === 'teams') {
                    parsedData = processTeamsCSV(text);
                } else {
                    parsedData = text.split(/\r?\n/)
                        .filter(l => l.trim() !== '')
                        .map(line => ({
                            nama: line.split(';')[0]?.trim(),
                            email: line.split(';')[1]?.trim().toLowerCase()
                        }));
                }

                if (parsedData.length === 0) throw new Error("File kosong atau format tidak sesuai.");

                // --- OPTIMISASI BACKEND CHECK ---
                const uniqueEmails = [...new Set(parsedData.map(d => d.email))];
                const res = await bulkCheckPeople(uniqueEmails);
                
                setMasterPeople(res.data); // Menyimpan data divisi/nama asli dari DB People
                setCsvData(parsedData);
            } catch (err) {
                setError(err.message || "Gagal memproses file.");
            } finally {
                setLoading(false);
            }
        };

        reader.readAsText(file, uploadMode === 'teams' ? 'utf-16le' : 'utf-8');
    };

    // 5. Gabungkan Data CSV, Master People, dan Map Aplikasi
    const finalTableData = useMemo(() => {
        const mapped = csvData.map(item => {
            const emailClean = (item.email || '').trim();
            
            // Cari detail di master people (hasil bulk check)
            const personInMaster = masterPeople.find(p => (p.email || '').toLowerCase().trim() === emailClean);
            
            // Cek apakah sudah terdaftar di aplikasi ini (people_apps_map)
            const isRegisteredInApp = appPICs.includes(emailClean);
            
            return {
                ...item,
                division: personInMaster ? personInMaster.division : 'NOT_IN_MASTER',
                isExistInMaster: !!personInMaster,
                isRegisteredInApp: isRegisteredInApp
            };
        });

        let filtered = mapped;
        if (filterStatus === 'registered') filtered = mapped.filter(d => d.isRegisteredInApp);
        if (filterStatus === 'unregistered') filtered = mapped.filter(d => !d.isRegisteredInApp);
        if (selectedDivision !== 'All') filtered = filtered.filter(d => d.division === selectedDivision);

        return filtered;
    }, [csvData, masterPeople, appPICs, filterStatus, selectedDivision]);

    // Opsi filter divisi berdasarkan data yang tampil
    const divisionOptions = useMemo(() => {
        const divs = csvData.map(item => {
            const found = masterPeople.find(p => (p.email || '').toLowerCase().trim() === item.email);
            return found ? found.division : 'NOT_IN_MASTER';
        });
        return ['All', ...new Set(divs)].sort();
    }, [csvData, masterPeople]);

    const handleInstantAdd = async (person) => {
        if (!selectedApp) return;
        
        setLoading(true);
        setError(null); // Reset error sebelum mulai
        try {
            // Gunakan service yang sudah kita buat
            await instantRegisterPIC({
                application_id: selectedApp.application_id,
                nama: person.nama,
                email: person.email
            });

            alert(`Berhasil menambahkan ${person.nama} sebagai PIC!`);
            
            // Refresh data PIC aplikasi agar status di tabel berubah
            const res = await getPeopleByAppId(selectedApp.application_id);
            const emails = res.data.map(p => (p.email || '').toLowerCase().trim());
            setAppPICs(emails);
            
        } catch (err) {
            // Tangani pesan error dari backend
            const errorMsg = err.response?.data || "Gagal mendaftarkan PIC";
            setError(typeof errorMsg === 'string' ? errorMsg : "Terjadi kesalahan sistem");
            console.error("Detail Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4 pb-5">
            <h1 className="mb-4">Validasi PIC Berbasis Attendance</h1>
            
            <Card className="mb-4 shadow-sm border-0 bg-light">
                <Card.Body>
                    <Row className="g-3 align-items-end">
                        <Col lg={5}>
                            <Form.Group className="position-relative">
                                <Form.Label className="fw-bold">1. Cari Aplikasi Target</Form.Label>
                                <div className="d-flex gap-2">
                                    <Form.Control
                                        type="text"
                                        placeholder="Ketik nama atau ID aplikasi..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            if (selectedApp) setSelectedApp(null);
                                        }}
                                    />
                                    {searchTerm && (
                                        <Button variant="outline-secondary" onClick={() => {
                                            setSearchTerm(''); setSelectedApp(null); setCsvData([]);
                                        }}>Reset</Button>
                                    )}
                                </div>
                                {suggestions.length > 0 && (
                                    <ListGroup className="position-absolute w-100 shadow-lg" style={{ zIndex: 1050 }}>
                                        {suggestions.map(app => (
                                            <ListGroup.Item action key={app.application_id} onClick={() => {
                                                setSelectedApp(app);
                                                setSearchTerm(`${app.nama_aplikasi} (${app.application_id})`);
                                                setSuggestions([]);
                                            }}>
                                                <strong>{app.nama_aplikasi}</strong> <small className="text-muted">({app.application_id})</small>
                                            </ListGroup.Item>
                                        ))}
                                    </ListGroup>
                                )}
                            </Form.Group>
                        </Col>
                        <Col lg={3} md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">2. Format File</Form.Label>
                                <Form.Select value={uploadMode} onChange={(e) => setUploadMode(e.target.value)}>
                                    <option value="teams">MS Teams CSV (Original)</option>
                                    <option value="standard">Standard (Nama;Email)</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col lg={4} md={6}>
                            <Form.Group>
                                <Form.Label className="fw-bold">3. Pilih File CSV</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    accept=".csv" 
                                    onChange={handleFileUpload} 
                                    disabled={!selectedApp || loading} 
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading && (
                <div className="text-center my-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Memproses data dan validasi database...</p>
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {csvData.length > 0 && !loading && (
                <>
                    <div className="bg-white p-3 rounded shadow-sm border mb-3">
                        <Row className="align-items-center g-3">
                            <Col md={5}>
                                <Form.Label className="small fw-bold">Filter Status App:</Form.Label><br/>
                                <ButtonGroup size="sm">
                                    <Button variant={filterStatus === 'all' ? "dark" : "outline-dark"} onClick={() => setFilterStatus('all')}>Semua</Button>
                                    <Button variant={filterStatus === 'registered' ? "success" : "outline-success"} onClick={() => setFilterStatus('registered')}>Terdaftar</Button>
                                    <Button variant={filterStatus === 'unregistered' ? "danger" : "outline-danger"} onClick={() => setFilterStatus('unregistered')}>Belum Ada</Button>
                                </ButtonGroup>
                            </Col>
                            <Col md={4}>
                                <Form.Label className="small fw-bold">Filter Divisi:</Form.Label>
                                <Form.Select size="sm" value={selectedDivision} onChange={(e) => setSelectedDivision(e.target.value)}>
                                    {divisionOptions.map(div => <option key={div} value={div}>{div}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={3} className="text-md-end">
                                <Badge bg="primary">Total Data: {finalTableData.length}</Badge>
                            </Col>
                        </Row>
                    </div>

                    <Card className="shadow-sm border-0">
                        <Table striped hover responsive className="mb-0 border">
                            <thead className="table-dark">
                                <tr>
                                    <th>No.</th>
                                    <th>Nama (CSV)</th>
                                    <th>Email</th>
                                    <th>Divisi (DB)</th>
                                    <th className="text-center">Status Master</th>
                                    <th className="text-center">Status App</th>
                                    <th className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finalTableData.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{item.nama}</td>
                                        <td><code className="text-dark">{item.email}</code></td>
                                        <td>
                                            <Badge bg={item.division === 'NOT_IN_MASTER' ? 'warning' : 'info'} text="dark">
                                                {item.division}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            {item.isExistInMaster ? 
                                                <Badge bg="success">Terdaftar di DB People</Badge> : 
                                                <Badge bg="danger">User Baru</Badge>}
                                        </td>
                                        <td className="text-center">
                                            {item.isRegisteredInApp ? 
                                                <Badge bg="primary">Sudah Jadi PIC</Badge> : 
                                                <Badge bg="outline-secondary">Belum Terdaftar</Badge>}
                                        </td>
                                        <td className="text-center">
                                            {!item.isRegisteredInApp && (
                                                <Button 
                                                    variant="success" 
                                                    size="sm"
                                                    onClick={() => handleInstantAdd(item)}
                                                    disabled={loading}
                                                >
                                                    + Jadikan PIC
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Card>
                </>
            )}
            
            {selectedApp && csvData.length === 0 && !loading && (
                <Alert variant="info" className="text-center">
                    Silakan upload file absensi untuk melakukan validasi PIC pada aplikasi <strong>{selectedApp.nama_aplikasi}</strong>.
                </Alert>
            )}
        </Container>
    );
}

export default ValidatePICPage;