import { Container, Button, Card, Row, Col } from 'react-bootstrap';
import { downloadAppsCsv, downloadPeopleCsv, downloadAppPeopleRelationsCsv, downloadLinksCsv } from '../services/api';

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
                            <Button variant="primary" onClick={() => handleDownload(downloadAppsCsv, 'apps.csv')}>
                                Unduh
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
                            <Button variant="success" onClick={() => handleDownload(downloadPeopleCsv, 'people.csv')}>
                                Unduh
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title>Unduh Data Relasi</Card.Title>
                            <Card.Text>
                                Unduh
                            </Card.Text>
                            <Button variant="info" onClick={() => handleDownload(downloadAppPeopleRelationsCsv, 'people_apps_map.csv')}>
                                Unduh
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                {/* Card Baru untuk Pranala */}
                <Col md={4} className="mb-4">
                    <Card className="shadow-sm border-warning">
                        <Card.Body>
                            <Card.Title>Unduh Data Pranala</Card.Title>
                            <Card.Text>
                                Unduh daftar link Docs dan Warroom aplikasi dalam format CSV.
                            </Card.Text>
                            <Button variant="warning" onClick={() => handleDownload(downloadLinksCsv, 'links.csv')}>
                                Unduh Links
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default DownloadPage;