import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Card, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import { getPeople, bulkUpdatePeopleCompany, bulkInsertPeople } from '../services/api';

function BulkActionPage() {
    // State untuk Bulk Update
    const [people, setPeople] = useState([]);
    const [selectedNpps, setSelectedNpps] = useState([]);
    const [newCompany, setNewCompany] = useState('');
    const [search, setSearch] = useState('');

    // State untuk Bulk Insert (CSV)
    const [csvFile, setCsvFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchPeople();
    }, [search]);

    // fe/src/pages/BulkActionPage.jsx

    // 1. Buat state tambahan untuk menyimpan objek data orang yang dipilih
    const [selectedPeopleData, setSelectedPeopleData] = useState([]);

    // 2. Update fungsi handleCheck untuk menyimpan data lengkap, bukan cuma NPP
    const handleCheck = (person) => {
        const isAlreadySelected = selectedNpps.includes(person.npp);
        
        if (isAlreadySelected) {
            setSelectedNpps(prev => prev.filter(npp => npp !== person.npp));
            setSelectedPeopleData(prev => prev.filter(p => p.npp !== person.npp));
        } else {
            setSelectedNpps(prev => [...prev, person.npp]);
            setSelectedPeopleData(prev => [...prev, person]);
        }
    };

    // 3. Logika Sortir & Gabung (Ini kuncinya agar terpilih tetap di atas)
    const displayPeople = React.useMemo(() => {
        // Gabungkan data dari hasil search dan data yang sudah dipilih sebelumnya
        // Gunakan Map untuk memastikan NPP unik (tidak dobel jika hasil search mengandung data yang sudah dipilih)
        const combinedMap = new Map();
        
        // Masukkan data yang sudah dipilih dulu
        selectedPeopleData.forEach(p => combinedMap.set(p.npp, p));
        
        // Masukkan hasil search (ini akan menimpa jika ada NPP yang sama, agar data tetap fresh)
        people.forEach(p => combinedMap.set(p.npp, p));

        const combinedList = Array.from(combinedMap.values());

        // Sortir: Terpilih di atas, sisanya di bawah
        return combinedList.sort((a, b) => {
            const aSelected = selectedNpps.includes(a.npp);
            const bSelected = selectedNpps.includes(b.npp);
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return 0;
        });
    }, [people, selectedNpps, selectedPeopleData]);


    const fetchPeople = async () => {
        try {
            const res = await getPeople(1, 100, search);
            // console.log("Cek struktur respons API:", res.data); // Debugging

            // Sesuaikan mapping data di sini
            let dataArray = [];
            if (Array.isArray(res.data)) {
                dataArray = res.data;
            } else if (res.data && Array.isArray(res.data.data)) {
                dataArray = res.data.data;
            }

            setPeople(dataArray);
        } catch (err) { 
            console.error("Gagal load people:", err);
            setPeople([]); 
        }
    };

    const handleSelectAll = (e) => {
    if (e.target.checked) {
        // Ambil semua NPP yang saat ini muncul di tabel (hasil filter)
        const allCurrentNpps = people.map(p => p.npp);
        setSelectedNpps(prev => [...new Set([...prev, ...allCurrentNpps])]);
    } else {
        // Kosongkan pilihan hanya untuk data yang ada di tabel saat ini
        const currentNpps = people.map(p => p.npp);
        setSelectedNpps(prev => prev.filter(npp => !currentNpps.includes(npp)));
    }
};

    // 1. Tambahkan state baru untuk form fields
    const [updateData, setUpdateData] = useState({
        company: '',
        division: '',
        posisi: ''
    });

    // 2. Fungsi sortir cerdas (Selected on Top)
    const sortedPeople = [...people].sort((a, b) => {
        const aSelected = selectedNpps.includes(a.npp);
        const bSelected = selectedNpps.includes(b.npp);
        return bSelected - aSelected; // True (1) akan naik ke atas
    });

    // 3. Handler perubahan input multi-field
    const handleInputChange = (e) => {
        setUpdateData({ ...updateData, [e.target.name]: e.target.value });
    };

    // 4. Update Handler (Backend perlu disesuaikan sedikit untuk multi-field)
    const onBulkUpdate = async () => {
        if (selectedNpps.length === 0) return alert("Pilih orang terlebih dahulu!");
        
        const fieldsToUpdate = Object.fromEntries(
            Object.entries(updateData).filter(([_, v]) => v !== '')
        );

        if (Object.keys(fieldsToUpdate).length === 0) return alert("Isi minimal satu field!");

        setLoading(true);
        try {
            // GUNAKAN fungsi yang di-import, jangan api.put langsung
            await bulkUpdatePeopleCompany({ 
                npps: selectedNpps, 
                fields: fieldsToUpdate 
            });

            setMessage({ type: 'success', text: `Berhasil update ${selectedNpps.length} orang.` });
            setUpdateData({ company: '', division: '', posisi: '' }); 
            setSelectedNpps([]); // Bersihkan pilihan setelah sukses
            fetchPeople();
        } catch (err) { 
            console.error("Error Detail:", err.response?.data);
            setMessage({ 
                type: 'danger', 
                text: err.response?.data?.detail || "Gagal update." 
            }); 
        }
        setLoading(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setCsvFile(file);
    };

    const onBulkInsert = async () => {
        if (!csvFile) return alert("Pilih file CSV!");
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            // Split berdasarkan baris dan bersihkan baris kosong
            let rows = text.split('\n').map(r => r.trim()).filter(r => r !== "");
            
            if (rows.length === 0) return setLoading(false);

            const firstRow = rows[0].toLowerCase();
            // Jika baris pertama mengandung kata kunci header, buang baris tersebut
            if (firstRow.includes('nama') || firstRow.includes('email') || firstRow.includes('npp')) {
                rows = rows.slice(1);
            }

            const data = rows.map(row => {
                const cols = row.split(';');
                return { 
                    nama: cols[0], 
                    email: cols[1], 
                    division: cols[2] || 'EXTERNAL/UNKNOWN' 
                };
            }).filter(item => item.email && item.email.includes('@'));

            try {
                await bulkInsertPeople(data);
                setMessage({ type: 'success', text: "Bulk insert berhasil!" });
                fetchPeople();
            } catch (err) { 
                setMessage({ type: 'danger', text: "Gagal bulk insert." }); 
            }
            setLoading(false);
        };
        reader.readAsText(csvFile);
    };

    return (
        <Container className="mt-4">
            <h2>Bulk Actions (People Management)</h2>
            {message && <Alert variant={message.type}>{message.text}</Alert>}

            <Tabs defaultActiveKey="update" className="mb-3">
                <Tab eventKey="update" title="Bulk Update Company">
                    <Card className="p-3 shadow-sm border-0 mb-3 bg-white">
                        {/* BARIS 1: SEARCH & FILTER */}
                        <Row className="mb-3">
                            <Col md={12}>
                                <Form.Group className="position-relative">
                                    <Form.Control 
                                        type="text" 
                                        placeholder="🔍 Cari berdasarkan Nama, Email, Divisi, atau NPP..." 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="py-2 ps-4 shadow-sm"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr />

                        {/* BARIS 2: BULK UPDATE FIELDS */}
                        <Row className="g-2">
                            <Col md={3}>
                                <Form.Control 
                                    name="company" 
                                    placeholder="Update Company..." 
                                    value={updateData.company} 
                                    onChange={handleInputChange} 
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Control 
                                    name="division" 
                                    placeholder="Update Division..." 
                                    value={updateData.division} 
                                    onChange={handleInputChange} 
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Control 
                                    name="posisi" 
                                    placeholder="Update Posisi..." 
                                    value={updateData.posisi} 
                                    onChange={handleInputChange} 
                                />
                            </Col>
                            <Col md={3}>
                                <Button 
                                    variant="primary" 
                                    className="w-100 fw-bold" 
                                    onClick={onBulkUpdate} 
                                    disabled={loading || selectedNpps.length === 0}
                                >
                                    Update {selectedNpps.length} Terpilih
                                </Button>
                            </Col>
                        </Row>
                    </Card>

<Table striped hover responsive className="bg-white rounded">
    <thead>
        <tr className="table-dark">
            <th>#</th>
            <th>NPP</th>
            <th>Nama</th>
            <th>Company</th>
            <th>Division</th>
            <th>
                <Form.Check 
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={people.length > 0 && people.every(p => selectedNpps.includes(p.npp))}
                />
            </th>
        </tr>
    </thead>
    <tbody>
        {displayPeople.map(p => {
            const isSelected = selectedNpps.includes(p.npp);
            return (
                <tr key={p.npp} className={isSelected ? "table-primary" : ""}>
                    <td>
                        <Form.Check checked={isSelected} onChange={() => handleCheck(p)} />
                    </td>
                    <td><strong>{p.npp}</strong></td>
                    <td>{p.nama}</td>
                    <td>{p.company || '-'}</td>
                    <td>{p.division || '-'}</td>
                </tr>
            );
        })}
    </tbody>
</Table>
                </Tab>

                <Tab eventKey="insert" title="Bulk Insert CSV">
                    <Card className="p-4 shadow-sm text-center">
                        <h4>Upload CSV Baru</h4>
                        <p className="text-muted">Format: nama;email;division</p>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="form-control mb-3" />
                        <Button variant="success" onClick={onBulkInsert} disabled={loading}>Proses Bulk Insert</Button>
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
}

export default BulkActionPage;