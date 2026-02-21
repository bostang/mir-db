import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';

function AppNavbar() {
  const location = useLocation();

  // Helper untuk menandai menu aktif (opsional)
  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm py-2">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="fw-bold fs-4 ms-2">
          <span className="text-primary">MIM</span> DB
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto me-3">
            
            {/* Kelompok Manajemen (CRUD) */}
            <NavDropdown title="📂 Manajemen" id="nav-management">
              <NavDropdown.Item as={Link} to="/apps">Daftar Aplikasi (Apps)</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/people">Daftar Personel (People)</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/links">Pranala (Links)</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/map-pic">Relasi PIC</NavDropdown.Item>
            </NavDropdown>

            {/* Kelompok Pencarian */}
            <NavDropdown title="🔍 Pencarian" id="nav-search">
              <NavDropdown.Item as={Link} to="/search/people">Cari PIC</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/search/apps">Cari Aplikasi Kelolaan</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/validate-pic">Validasi PIC</NavDropdown.Item>
            </NavDropdown>

            {/* Kelompok Bulk Action */}
            <NavDropdown title="⚡ Bulk Action" id="nav-bulk">
              <NavDropdown.Item as={Link} to="/bulk-action-people">Kelola People (CSV)</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/bulk-action-relations">Kelola Relasi (CSV)</NavDropdown.Item>
            </NavDropdown>

            {/* Single Link - Unduh Data */}
            <Nav.Link 
                as={Link} 
                to="/download" 
                className={isActive('/download') ? 'active fw-bold' : ''}
            >
              📊 Unduh Data
            </Nav.Link>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;