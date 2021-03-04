import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
} from 'reactstrap';
import useAuth from '../hooks/auth';

export default function Header() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const handleLogout = () => logout();

  return (
    <Navbar color="white" light expand className="topbar mb-4 static-top shadow">
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="ml-auto" navbar>
          <div className="topbar-divider d-none d-sm-block"></div>
          <NavItem className="no-arrow">
            <Link className="nav-link" to="#javascript" onClick={handleLogout}>
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">Sair</span>
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
}
