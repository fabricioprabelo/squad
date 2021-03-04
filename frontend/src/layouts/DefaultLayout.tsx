import { useEffect } from "react";
import { Container } from "reactstrap";
import Footer from "../components/Footer";
import Header from "../components/Header";
import PageTop from "../components/PageTop";
import Sidebar from "../components/Sidebar";
import { SITE_NAME } from "../configs/constants";
import ChildrenProps from "../support/ChildrenProps";

export default function DefaultLayout({ children }: ChildrenProps) {
  useEffect(() => {
    document.title = `${SITE_NAME}`;
    document.body.classList.remove("bg-gradient-primary");
  }, []);

  return (
    <>
      <div id="wrapper">
        <Sidebar />
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Header />
            <Container fluid>
              {children}
            </Container>
          </div>
          <Footer />
        </div>
      </div>
      <PageTop />
    </>
  );
}
