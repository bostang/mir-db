import React, { useState, useEffect, useMemo } from 'react';
import { Container, Table, Form, Button, Card, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import { getRelations, bulkDeleteRelations, bulkInsertRelations, bulkUpdateRelations } from '../services/api';

const allowedLayers = ['L1', 'L2', 'L3', 'Business', 'Surroundings', 'Management', 'Principal', 'Others'];

function BulkActionRelations() {
    const [relations, setRelations] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]); // Array string: "appId|npp|layer"
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [search, setSearch] = useState('');
    const [csvFile, setCsvFile] = useState(null);

    const [updateFields, setUpdateFields] = useState({
        newLayer: '',
        note: ''
    });


    const handleFileUpload = (e) => {
        setCsvFile(e.target.files[0]);
    };

    const onBulkUpdate = async () => {
        if (selectedKeys.length === 0) return alert("Pilih relasi terlebih dahulu!");
        
        // Pastikan minimal satu ada isi
        const hasLayer = updateFields.newLayer && updateFields.newLayer !== "";
        const hasNote = updateFields.note && updateFields.note.trim() !== "";

        if (!hasLayer && !hasNote) {
            return alert("Isi minimal satu field (Layer atau Note) untuk diupdate!");
        }

        setLoading(true);
        try {
            const keys = selectedKeys.map(key => {
                const parts = key.split('|');
                const rawLayer = parts[2]?.trim();
                
                return { 
                    application_id: parts[0]?.trim(), 
                    npp: parts[1]?.trim(), 
                    // Perbaikan: Jika string adalah "null" atau kosong, kirim null asli
                    layer: (rawLayer === "null" || !rawLayer) ? null : rawLayer 
                };
            });

            // Pastikan mengirim null jika kosong agar ISNULL di SQL bekerja
            const payload = { 
                keys, 
                fields: {
                    newLayer: updateFields.newLayer || null,
                    note: updateFields.note.trim() === "" ? null : updateFields.note
                }
            };

            const res = await bulkUpdateRelations(payload);
            const details = res.data.details;

            const successCount = details.filter(d => d.status === 'success').length;
            const failCount = details.length - successCount;

            if (successCount > 0) {
                setSelectedKeys([]); // Kosongkan pilihan
                setUpdateFields({ newLayer: '', note: '' }); // Reset form
                fetchData(); // Ambil data terbaru dari server
                setMessage({ type: 'success', text: `Berhasil update ${successCount} data.` });
            } else {
                setMessage({ 
                    type: 'warning', 
                    text: "Tidak ada data yang diperbarui. Periksa apakah kriteria pencarian (ID/NPP/Layer) sudah tepat." 
                });
            }
        } catch (err) {
            console.error("Error Detail:", err.response?.data || err.message);
            setMessage({ 
                type: 'danger', 
                text: err.response?.data || 'Gagal melakukan bulk update.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const onBulkInsert = async () => {
        if (!csvFile) return alert("Pilih file CSV!");
        
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            let rows = text.split('\n').map(r => r.trim()).filter(r => r !== "");
            
            // Buang header jika ada
            const firstRow = rows[0].toLowerCase();
            if (firstRow.includes('npp') || firstRow.includes('id')) {
                rows = rows.slice(1);
            }

            const dataToUpload = rows.map(row => {
                const cols = row.split(';');
                return {
                    application_id: cols[0]?.trim(),
                    npp: cols[1]?.trim(),
                    layer: cols[2]?.trim(),
                    note: cols[3]?.trim() || 'Imported via CSV'
                };
            }).filter(item => item.application_id && item.npp);

            try {
                // Panggil API
                const res = await bulkInsertRelations(dataToUpload);
                
                // Ambil summary dari backend
                const { summary } = res.data;

                // Logika tampilan pesan yang lebih jujur
                if (summary.success > 0) {
                    setMessage({ 
                        type: 'success', 
                        text: `Berhasil: ${summary.success} data. (Dilewati/Invalid: ${summary.skipped + summary.invalid})` 
                    });
                } else {
                    setMessage({ 
                        type: 'warning', 
                        text: `Tidak ada data yang ditambahkan. (Dilewati: ${summary.skipped}, Invalid Layer/Error: ${summary.invalid})` 
                    });
                }
                
                fetchData(); // Refresh table
            } catch (err) {
                console.error("Error upload:", err);
                setMessage({ type: 'danger', text: 'Gagal menghubungi server atau data tidak kompatibel.' });
            } finally {
                setLoading(false);
                setCsvFile(null); // Reset file input
            }
        };
        reader.readAsText(csvFile);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await getRelations();
            setRelations(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const filteredRelations = useMemo(() => {
        return relations.filter(r => 
            r.nama_aplikasi?.toLowerCase().includes(search.toLowerCase()) ||
            r.nama_pic?.toLowerCase().includes(search.toLowerCase()) ||
            r.npp?.toLowerCase().includes(search.toLowerCase())
        );
    }, [relations, search]);

    const handleCheck = (rel) => {
        const key = `${rel.application_id}|${rel.npp}|${rel.layer}`;
        setSelectedKeys(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const onBulkDelete = async () => {
        if (!window.confirm(`Hapus ${selectedKeys.length} relasi?`)) return;
        setLoading(true);
        try {
            const toDelete = selectedKeys.map(key => {
                const [application_id, npp, layer] = key.split('|');
                return { application_id, npp, layer };
            });
            await bulkDeleteRelations(toDelete);
            setMessage({ type: 'success', text: 'Relasi berhasil dihapus.' });
            setSelectedKeys([]);
            fetchData();
        } catch (err) {
            setMessage({ type: 'danger', text: 'Gagal menghapus relasi.' });
        }
        setLoading(false);
    };

    return (
        <Container className="mt-4">
            <h2>Bulk Action Relations</h2>
            {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>{message.text}</Alert>}

            <Tabs defaultActiveKey="manage" className="mb-3">
                <Tab eventKey="manage" title="Manage Relations">
                    <Card className="p-3 mb-3 shadow-sm border-0 bg-white">
                        {/* Baris 1: Pencarian */}
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Control 
                                    placeholder="🔍 Cari App, PIC, atau NPP..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <hr />
                        
                        {/* Baris 2: Bulk Actions (Update & Delete) */}
                        <Row className="g-2 align-items-end">
                            <Col md={3}>
                                <Form.Label className="small fw-bold">Update Layer ke:</Form.Label>
                                <Form.Select 
                                    value={updateFields.newLayer}
                                    onChange={(e) => setUpdateFields({...updateFields, newLayer: e.target.value})}
                                >
                                    <option value="">-- Tetap --</option>
                                    {allowedLayers.map(l => <option key={l} value={l}>{l}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label className="small fw-bold">Update Note:</Form.Label>
                                <Form.Control 
                                    placeholder="Tulis catatan baru..."
                                    value={updateFields.note}
                                    onChange={(e) => setUpdateFields({...updateFields, note: e.target.value})}
                                />
                            </Col>
                            <Col md={3}>
                                <Button 
                                    variant="primary" 
                                    className="w-100" 
                                    onClick={onBulkUpdate}
                                    disabled={loading || selectedKeys.length === 0}
                                >
                                    Update {selectedKeys.length} Item
                                </Button>
                            </Col>
                            <Col md={2}>
                                <Button 
                                    variant="outline-danger" 
                                    className="w-100" 
                                    onClick={onBulkDelete}
                                    disabled={loading || selectedKeys.length === 0}
                                >
                                    Hapus
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    <Table striped hover responsive className="bg-white">
                        <thead className="table-dark">
                            <tr>
                                <th>
                                    <Form.Check 
                                        onChange={(e) => {
                                            if(e.target.checked) setSelectedKeys(filteredRelations.map(r => `${r.application_id}|${r.npp}|${r.layer}`));
                                            else setSelectedKeys([]);
                                        }}
                                        checked={selectedKeys.length > 0 && selectedKeys.length === filteredRelations.length}
                                    />
                                </th>
                                <th>Aplikasi</th>
                                <th>PIC (NPP)</th>
                                <th>Layer</th>
                                <th>Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRelations.map((r, idx) => {
                                const key = `${r.application_id}|${r.npp}|${r.layer}`;
                                return (
                                    <tr key={idx} className={selectedKeys.includes(key) ? "table-warning" : ""}>
                                        <td>
                                            <Form.Check 
                                                checked={selectedKeys.includes(key)}
                                                onChange={() => handleCheck(r)}
                                            />
                                        </td>
                                        <td>{r.nama_aplikasi} <br/><small className="text-muted">{r.application_id}</small></td>
                                        <td>{r.nama_pic} <br/><small className="text-muted">{r.npp}</small></td>
                                        <td><span className="badge bg-info">{r.layer}</span></td>
                                        <td>{r.note || '-'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Tab>

                <Tab eventKey="upload" title="Bulk Insert (CSV)">
                    <Card className="p-4 shadow-sm border-0 bg-light">
                        <Row className="justify-content-center text-center">
                            <Col md={8}>
                                <h4 className="mb-3">Upload Relasi via CSV</h4>
                                <div className="alert alert-warning py-2 small">
                                    <strong>Format CSV:</strong> application_id;npp;layer;note <br/>
                                    <em>Pastikan menggunakan titik koma (;) sebagai pemisah kolom.</em>
                                </div>
                                
                                <div className="mt-3 p-3 bg-white border rounded">
                                    <h6>Opsi Layer yang Valid:</h6>
                                    <div className="d-flex flex-wrap gap-2">
                                        {['L1', 'L2', 'L3', 'Business', 'Surroundings', 'Management', 'Principal', 'Others'].map(l => (
                                            <span key={l} className="badge bg-secondary">{l}</span>
                                        ))}
                                    </div>
                                    <p className="small text-danger mt-2">
                                        * Penulisan harus sama persis (Case Sensitive)
                                    </p>
                                </div>
                                
                                <Form.Group className="mb-4">
                                    <Form.Control 
                                        type="file" 
                                        accept=".csv" 
                                        onChange={handleFileUpload} 
                                        className="shadow-sm"
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button 
                                        variant="success" 
                                        size="lg"
                                        onClick={onBulkInsert} 
                                        disabled={loading || !csvFile}
                                    >
                                        {loading ? 'Sedang Memproses...' : '🚀 Proses & Upload Relasi'}
                                    </Button>
                                </div>

                                <hr />
                                <div className="text-start mt-3">
                                    <h6>💡 Tips Excel ke CSV:</h6>
                                    <ul className="small text-muted">
                                        <li>Kolom A: ID Aplikasi (Contoh: APP001)</li>
                                        <li>Kolom B: NPP PIC (Contoh: X0155)</li>
                                        <li>Kolom C: Layer (Primary/Secondary)</li>
                                        <li>Kolom D: Note (Opsional)</li>
                                        <li>Simpan sebagai <strong>CSV (Comma Delimited)</strong>, namun jika di Indonesia biasanya Excel menggunakan semicolon secara otomatis.</li>
                                    </ul>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
}

export default BulkActionRelations;