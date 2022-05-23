import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const NavbarComponent = () => {

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
      <Navbar.Brand href="#home">Navbar</Navbar.Brand>
      <Nav className="me-auto">
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/skeleton" className="nav-link">Skeleton</Link>
        <Link to="/upload" className="nav-link">Upload</Link>
      </Nav>
      </Container>
    </Navbar>
  )
}


export default NavbarComponent;