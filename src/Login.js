import { Col, Container, Row } from "react-bootstrap";
import { Link } from "react-router-dom";

function Login() {

  return (
    <Container fluid>
      <Row>
        <Col xs={{span: 8, offset: 2}} className="text-center">
          <Link to="/home">Home</Link>
          <h1>hi</h1>
        </Col>
      </Row>
    </Container>
  )
};

export default Login