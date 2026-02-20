import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap'; // Remove Container from this import

function AppNavbar() {
  return (
    // Remove the <Container> component wrapping the Navbar content
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">MIM DB</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/apps">Daftar Aplikasi</Nav.Link>
          <Nav.Link as={Link} to="/people">Daftar PIC</Nav.Link>
          <Nav.Link as={Link} to="/links">Pranala Aplikasi</Nav.Link>
          <Nav.Link as={Link} to="/map-pic">Edit Relasi</Nav.Link>
          <Nav.Link as={Link} to="/search/people">Cari PIC</Nav.Link>
          <Nav.Link as={Link} to="/search/apps">Cari Aplikasi</Nav.Link>
          <Nav.Link as={Link} to="/download">Unduh Data</Nav.Link>
          <Nav.Link as={Link} to="/validate-pic">Validasi PIC</Nav.Link>
          <Nav.Link as={Link} to="/bulk-action-people">Bulk Action People</Nav.Link>
          <Nav.Link as={Link} to="/bulk-action-relations">Bulk Action Relations</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNavbar;