import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { downloadAppsCsv, downloadPicsCsv, downloadAppPicRelationsCsv } from '../services/api';

function DownloadPage() {

    const handleDownload = async (downloadFunction, filename) => {
        try {
            const response = await downloadFunction();
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Failed to download file:', error);
            alert('Gagal mengunduh file. Periksa konsol untuk detail.');
        }
    };

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Unduh Database</h1>
            <Row>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Unduh Data Aplikasi</Card.Title>
                            <Card.Text>
                                Unduh seluruh data aplikasi yang tersedia dalam format CSV.
                            </Card.Text>
                            <Button variant="primary" onClick={() => handleDownload(downloadAppsCsv, 'aplikasi.csv')}>
                                Unduh Apps.csv
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Unduh Data PIC</Card.Title>
                            <Card.Text>
                                Unduh seluruh data PIC yang tersedia dalam format CSV.
                            </Card.Text>
                            <Button variant="success" onClick={() => handleDownload(downloadPicsCsv, 'pic.csv')}>
                                Unduh PIC.csv
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Unduh Data Relasi</Card.Title>
                            <Card.Text>
                                Unduh seluruh data relasi antara aplikasi dan PIC dalam format CSV.
                            </Card.Text>
                            <Button variant="info" onClick={() => handleDownload(downloadAppPicRelationsCsv, 'app_pic_relations.csv')}>
                                Unduh Relasi.csv
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default DownloadPage;