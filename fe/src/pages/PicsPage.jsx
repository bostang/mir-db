import { useState, useEffect } from 'react';
import { getPics } from '../services/api';
import { Container, Table, Form } from 'react-bootstrap';

function PicsPage() {
    const [pics, setPics] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State baru untuk search bar

    const fetchPics = async () => {
        try {
            const res = await getPics();
            setPics(res.data);
        } catch (error) {
            console.error('Failed to fetch pics:', error);
        }
    };

    useEffect(() => {
        fetchPics();
    }, []);

    // Filter PIC berdasarkan searchTerm
    const filteredPics = pics.filter(pic =>
        pic.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pic.npp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pic.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pic.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Daftar PIC</h1>

            {/* Tambahkan Search Bar di sini */}
            <Form className="mb-4">
                <Form.Group>
                    <Form.Control
                        type="text"
                        placeholder="Cari PIC (Nama, NPP, Jabatan, atau Email)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Form.Group>
            </Form>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>NPP</th>
                        <th>Nama</th>
                        <th>Role</th>
                        <th>Jabatan</th>
                        <th>No. Telp</th>
                        <th>Email</th>
                        <th>Entity</th>
                        <th>Grup</th>
                        <th>Rubrik</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Gunakan data yang sudah difilter */}
                    {filteredPics.map((pic, index) => (
                        <tr key={index}>
                            <td>{pic.npp}</td>
                            <td>{pic.nama}</td>
                            <td>{pic.role}</td>
                            <td>{pic.jabatan}</td>
                            <td>{pic.no_telp}</td>
                            <td>{pic.email}</td>
                            <td>{pic.entity}</td>
                            <td>{pic.grup}</td>
                            <td>{pic.rubrik}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
}

export default PicsPage;