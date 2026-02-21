import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Atau gunakan service api.js Anda
import { getDashboardStats } from '../services/api';

function LandingPage() {
  const [stats, setStats] = useState({ apps: 0, people: 0, relations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 2. Gunakan fungsi dari service api.js
        const res = await getDashboardStats();
        
        // Pastikan format res.data sesuai dengan JSON dari backend
        setStats(res.data);
      } catch (err) {
        console.error("Gagal memuat stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Aplikasi', count: stats.apps, icon: '📱', color: 'primary' },
    { title: 'Total Personel', count: stats.people, icon: '👥', color: 'success' },
    { title: 'Relasi Terdaftar', count: stats.relations, icon: '🔗', color: 'info' },
  ];

  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold">Platform Manajemen Aplikasi</h1>
        <p className="lead text-muted">tools sederhana untuk pengelolaan relasi PIC, aplikasi, dan dokumentasi.</p>
      </div>

      <Row className="mb-5 g-4">
        {statCards.map((stat, idx) => (
          <Col md={4} key={idx}>
            <Card className="border-0 shadow-sm text-center p-3 h-100">
              <Card.Body>
                <div className="fs-1 mb-2">{stat.icon}</div>
                <Card.Title className="text-muted small text-uppercase fw-bold">{stat.title}</Card.Title>
                {loading ? (
                  <Spinner animation="border" size="sm" variant={stat.color} />
                ) : (
                  <h2 className={`fw-bold text-${stat.color}`}>{stat.count}</h2>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h4 className="mb-4 fw-bold text-center">Aksi Cepat</h4>
      <Row className="justify-content-center g-3">
        <Col md={3}><Button as={Link} to="/search/apps" variant="outline-primary" className="w-100 py-3 fw-bold shadow-sm">🔍 Cari Aplikasi</Button></Col>
        <Col md={3}><Button as={Link} to="/search/people" variant="outline-primary" className="w-100 py-3 fw-bold shadow-sm">👤 Cari PIC</Button></Col>
        <Col md={3}><Button as={Link} to="/bulk-action-relations" variant="outline-success" className="w-100 py-3 fw-bold shadow-sm">⚡ Bulk Update</Button></Col>
        <Col md={3}><Button as={Link} to="/download" variant="outline-dark" className="w-100 py-3 fw-bold shadow-sm">📥 Unduh Data</Button></Col>
      </Row>
    </Container>
  );
}

export default LandingPage;