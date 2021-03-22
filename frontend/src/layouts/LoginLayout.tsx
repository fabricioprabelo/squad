import { useEffect } from "react";
import { Col, Row } from "reactstrap";
import { SITE_NAME } from "../configs/constants";
import ChildrenProps from "../support/ChildrenProps";

export default function LoginLayout({ children }: ChildrenProps) {
  useEffect(() => {
    document.title = `${SITE_NAME}`;
    document.body.classList.add("bg-gradient-primary");
  }, []);

  return (
    <div className="container">
      <Row className="justify-content-center">
        <Col xl="10" lg="12" md="9">
          {children}
        </Col>
      </Row>
    </div>
  );
}
