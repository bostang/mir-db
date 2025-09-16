import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap'; // Remove Container from this import

function AppNavbar() {
  return (
    // Remove the <Container> component wrapping the Navbar content
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand as={Link} to="/">Portal Aplikasi</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/apps">Daftar Aplikasi</Nav.Link>
          <Nav.Link as={Link} to="/search/pics">Cari PIC</Nav.Link>
          <Nav.Link as={Link} to="/search/apps">Cari Aplikasi</Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNavbar;