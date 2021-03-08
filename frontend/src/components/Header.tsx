import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import useAuth from '../hooks/auth';
import profileIcon from '../assets/img/user.svg';
import SweetAlert from "sweetalert2";
import { GRAPHQL_SERVER } from '../configs/constants';
import NotificationsNav from './NotificationsNav';

export default function Header() {
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const toggleUser = () => setDropdownOpen(prevState => !prevState);

  const handleLogout = () => {
    SweetAlert.fire({
      title: "Logout",
      text: "Tem certeza que deseja desconectar-se do sistema?",
      icon: "question",
      cancelButtonText: "Não",
      confirmButtonText: "Sim",
      reverseButtons: true,
      showCancelButton: true,
    })
      .then(({ isConfirmed }) => {
        if (isConfirmed) logout();
      });
  };

  return (
    <Navbar color="white" light expand className="topbar mb-4 static-top shadow">
      <NavbarToggler onClick={toggle} />
      <Collapse isOpen={isOpen} navbar>
        <Nav className="ml-auto" navbar>
          <NotificationsNav />
          <div className="topbar-divider d-none d-sm-block"></div>
          <Dropdown nav className="no-arrow" isOpen={dropdownOpen} toggle={toggleUser}>
            <DropdownToggle id="userDropdown" tag={Link} to="#javascript" className="nav-link dropdown-toggle">
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">{`${user?.name} ${user?.surname}`}</span>
              <img
                className="img-profile rounded-circle"
                src={user?.photo ? `${GRAPHQL_SERVER}/upload/${user?.photo}` : profileIcon}
                alt={`${user?.name} ${user?.surname}`}
              />
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem tag={Link} to="/profile">
                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                  Meu perfil
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem tag={Link} to="#javascript" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                Logout
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Nav>
      </Collapse>
    </Navbar>
  );
}
