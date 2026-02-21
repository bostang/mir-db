import React, { useState, useEffect, useMemo } from 'react';
import { Container, Table, Form, Button, Card, Row, Col, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { getRelations, bulkDeleteRelations, bulkInsertRelations, bulkUpdateRelations } from '../services/api';

const allowedLayers = ['L1', 'L2', 'L3', 'Business', 'Surroundings', 'Management', 'Principal', 'Others'];

function BulkActionRelations() {
    const [relations, setRelations] = useState([]); 
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [search, setSearch] = useState('');
    const [csvFile, setCsvFile] = useState(null);

    const [updateFields, setUpdateFields] = useState({
        newLayer: '',
        note: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getRelations();
            const cleanData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setRelations(cleanData);
        } catch (err) {
            console.error("Fetch Error:", err);
            setMessage({ type: 'danger', text: 'Gagal mengambil data dari server.' });
            setRelations([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // PERBAIKAN 1: Menambahkan application_id ke dalam pencarian
    const filteredRelations = useMemo(() => {
        if (!Array.isArray(relations)) return [];
        
        const searchTerm = search.toLowerCase();
        return relations.filter(r => 
            r.nama_aplikasi?.toLowerCase().includes(searchTerm) ||
            r.application_id?.toLowerCase().includes(searchTerm) || // Tambahan search ID
            r.nama_pic?.toLowerCase().includes(searchTerm) ||
            r.npp?.toLowerCase().includes(searchTerm)
        );
    }, [relations, search]);

    const handleFileUpload = (e) => {
        setCsvFile(e.target.files[0]);
    };

    const handleCheck = (rel) => {
        const key = `${rel.application_id}|${rel.npp}|${rel.layer}`;
        setSelectedKeys(prev => 
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const onBulkUpdate = async () => {
        if (selectedKeys.length === 0) return alert("Pilih relasi terlebih dahulu!");
        
        const hasLayer = updateFields.newLayer && updateFields.newLayer !== "";
        const hasNote = updateFields.note && updateFields.note.trim() !== "";

        if (!hasLayer && !hasNote) {
            return alert("Isi minimal satu field (Layer atau Note) untuk diupdate!");
        }

        setLoading(true);
        try {
            // PERBAIKAN: Pastikan pemisahan key bersih dari spasi liar (trim)
            const keys = selectedKeys.map(key => {
                const parts = key.split('|');
                return { 
                    application_id: parts[0]?.trim(), 
                    npp: parts[1]?.trim(), 
                    // Jika layer string "null" atau kosong, kirim null asli
                    layer: (!parts[2] || parts[2].trim() === "null") ? null : parts[2].trim() 
                };
            });

            const payload = { 
                keys, 
                fields: {
                    newLayer: updateFields.newLayer || null,
                    note: updateFields.note.trim() === "" ? null : updateFields.note.trim()
                }
            };

            await bulkUpdateRelations(payload);
            
            // Reset & Notifikasi
            setSelectedKeys([]);
            setUpdateFields({ newLayer: '', note: '' });
            setMessage({ type: 'success', text: `Berhasil update ${keys.length} data.` });
            await fetchData(); // Gunakan await agar loading selesai setelah data terbaru masuk
        } catch (err) {
            console.error("Update Error Details:", err.response?.data || err.message);
            setMessage({ type: 'danger', text: 'Gagal melakukan bulk update. Silakan coba lagi.' });
        } finally {
            setLoading(false);
        }
    };

    // PERBAIKAN 2: Penanganan Counter Summary Insert
    const onBulkInsert = async () => {
        if (!csvFile) return alert("Pilih file CSV!");
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                let rows = text.split('\n').map(r => r.trim()).filter(r => r !== "");
                
                if (rows.length === 0) throw new Error("File kosong");

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

                const res = await bulkInsertRelations(dataToUpload);
                
                /** * Logika Counter Adaptif:
                 * Jika backend mengembalikan summary (object), gunakan itu.
                 * Jika backend hanya mengembalikan affectedRows (SQL), gunakan itu.
                 * Jika tidak ada, gunakan jumlah data yang dikirim sebagai asumsi sukses.
                 */
                const successCount = res.data.summary?.success ?? res.data.affectedRows ?? dataToUpload.length;
                const failCount = res.data.summary?.invalid ?? 0;

                setMessage({ 
                    type: successCount > 0 ? 'success' : 'warning', 
                    text: `Import selesai. Success: ${successCount}, Skipped/Invalid: ${failCount}` 
                });
                
                fetchData();
            } catch (err) {
                console.error("Upload Error:", err);
                setMessage({ type: 'danger', text: err.message || 'Gagal memproses file CSV.' });
            } finally {
                setLoading(false);
                setCsvFile(null);
                // Reset input file secara fisik
                document.getElementById('csvInput').value = "";
            }
        };
        reader.readAsText(csvFile);
    };

    const onBulkDelete = async () => {
        if (selectedKeys.length === 0) return;
        if (!window.confirm(`Hapus ${selectedKeys.length} relasi yang dipilih?`)) return;
        
        setLoading(true);
        try {
            // PERBAIKAN: Trimming data ID agar tidak menyebabkan mismatch di Database
            const toDelete = selectedKeys.map(key => {
                const [appId, npp, layer] = key.split('|');
                return { 
                    application_id: appId?.trim(), 
                    npp: npp?.trim(), 
                    layer: (!layer || layer.trim() === "null") ? null : layer.trim() 
                };
            });

            await bulkDeleteRelations(toDelete);
            
            setMessage({ type: 'success', text: `${toDelete.length} Relasi berhasil dihapus.` });
            setSelectedKeys([]);
            await fetchData();
        } catch (err) {
            console.error("Delete Error Details:", err.response?.data || err.message);
            setMessage({ type: 'danger', text: 'Gagal menghapus relasi. Cek koneksi atau data.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4 pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Bulk Action Relations</h2>
                {loading && <Spinner animation="border" size="sm" variant="primary" />}
            </div>

            {message && <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>{message.text}</Alert>}

            <Tabs defaultActiveKey="manage" className="mb-3 custom-tabs">
                <Tab eventKey="manage" title="Manage Relations">
                    <Card className="p-3 mb-3 shadow-sm border-0 bg-white">
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Control 
                                    placeholder="🔍 Cari ID Aplikasi, Nama App, PIC, atau NPP..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </Col>
                        </Row>

                        <hr />
                        
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
                                    className="w-100 fw-bold" 
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

                    <div className="table-responsive shadow-sm rounded">
                        <Table striped hover className="bg-white mb-0">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <Form.Check 
                                            onChange={(e) => {
                                                if(e.target.checked) setSelectedKeys(filteredRelations.map(r => `${r.application_id}|${r.npp}|${r.layer}`));
                                                else setSelectedKeys([]);
                                            }}
                                            checked={filteredRelations.length > 0 && selectedKeys.length === filteredRelations.length}
                                        />
                                    </th>
                                    <th>Aplikasi</th>
                                    <th>PIC (NPP)</th>
                                    <th>Layer</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRelations.length > 0 ? (
                                    filteredRelations.map((r, idx) => {
                                        const key = `${r.application_id}|${r.npp}|${r.layer}`;
                                        const isSelected = selectedKeys.includes(key);
                                        return (
                                            <tr key={idx} className={isSelected ? "table-warning" : ""}>
                                                <td>
                                                    <Form.Check 
                                                        checked={isSelected}
                                                        onChange={() => handleCheck(r)}
                                                    />
                                                </td>
                                                <td>
                                                    <span className="fw-bold">{r.nama_aplikasi}</span> 
                                                    <br/><small className="text-muted">{r.application_id}</small>
                                                </td>
                                                <td>
                                                    {r.nama_pic} 
                                                    <br/><small className="text-muted">{r.npp}</small>
                                                </td>
                                                <td><span className="badge bg-info text-dark">{r.layer}</span></td>
                                                <td className="small">{r.note || '-'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-muted">
                                            {loading ? "Memuat data..." : "Tidak ada data relasi."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Tab>

                <Tab eventKey="upload" title="Bulk Insert (CSV)">
                    <Card className="p-4 shadow-sm border-0 bg-light mt-2">
                        <Row className="justify-content-center text-center">
                            <Col md={8}>
                                <h4 className="mb-3">Upload Relasi via CSV</h4>
                                <Alert variant="info" className="py-2 small text-start">
                                    <strong>Format CSV Semicolon (;):</strong><br/>
                                    <code>application_id;npp;layer;note</code><br/>
                                    Contoh: <code>APP001;88123;L1;Catatan Utama</code>
                                </Alert>
                                
                                <Form.Group className="mb-4 text-start">
                                    <Form.Label className="small fw-bold">Pilih File CSV:</Form.Label>
                                    <Form.Control 
                                        id="csvInput"
                                        type="file" 
                                        accept=".csv" 
                                        onChange={handleFileUpload} 
                                    />
                                </Form.Group>

                                <div className="d-grid">
                                    <Button 
                                        variant="success" 
                                        size="lg"
                                        onClick={onBulkInsert} 
                                        disabled={loading || !csvFile}
                                    >
                                        {loading ? <Spinner size="sm" animation="border" /> : '🚀 Proses & Upload Relasi'}
                                    </Button>
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