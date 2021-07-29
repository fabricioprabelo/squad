import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Collapse, NavItem } from "reactstrap";
import { SITE_NAME } from "../configs/constants";
import menus, { IMenuItem } from "../configs/menu";
import useAuth from "../hooks/auth";

export default function Sidebar() {
  const { hasAnyPermissions } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [mainMenu, setMainMenu] = useState<IMenuItem[]>(menus);
  const [collapseActive, setCollapseActive] = useState<string>("");

  function setNavActive(item: IMenuItem) {
    const menu = mainMenu.filter((menuItem) => {
      if (menuItem !== item) menuItem.active = false;
      if (menuItem.children && menuItem.children.includes(item))
        menuItem.active = true;
      if (menuItem.children) {
        menuItem.children.filter((subMenuItem) => {
          if (subMenuItem === item) {
            menuItem.active = true;
            subMenuItem.active = true;
            return true;
          } else {
            return false;
          }
        });
      }
      return menuItem;
    });
    item.active = !item.active;
    setMainMenu(menu);
  };

  function handleToggle() {
    setIsOpen(!isOpen);
    document.body.classList.toggle("sidebar-toggled");
    const sidebar = document.getElementsByClassName("sidebar").item(0);
    sidebar?.classList.toggle("toggled");
  }

  useEffect(() => {
    const currentUrl = window.location.pathname;
    mainMenu.filter((menuItem) => {
      if (menuItem.link === currentUrl) setNavActive(menuItem);
      if (!menuItem.children) return false;
      menuItem.children.filter((subMenuItem) => {
        if (subMenuItem.link === currentUrl) setNavActive(subMenuItem);
        if (!subMenuItem.children) return false;
        subMenuItem.children.filter((subSubItems) => {
          if (subSubItems.link === currentUrl) {
            setNavActive(subSubItems);
            return true;
          } else {
            return false;
          }
        });
        return subMenuItem;
      });
      return menuItem;
    });
    // eslint-disable-next-line
  }, [])

  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion">
      <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
        <div className="sidebar-brand-icon rotate-n-15">
          <i className="fas fa-laugh-wink"></i>
        </div>
        <div key="siteNameSidebar" className="sidebar-brand-text mx-3">{SITE_NAME}</div>
      </Link>
      <hr className="sidebar-divider my-0" />
      {mainMenu.map((item, index) => {
        if (item.type === "divider" && (!item?.permissions || hasAnyPermissions(item.permissions))) {
          return <hr key={`divider-${index}`} className="sidebar-divider" />;
        } else if (item.type === "heading") {
          return (
            <div key={`heading-${index}`} className="sidebar-heading">
              {item.text}
            </div>
          );
        } else if (item.type === "item" && (!item?.permissions || hasAnyPermissions(item.permissions))) {
          return (
            <NavItem key={`navItem-${index}`} active={item.active}>
              <Link
                key={`navLink-${index}`}
                to={item.link || "#javascript"}
                className="nav-link">
                {item.icon ? (<i className={item.icon}></i>) : ""}
                <span>{item.text}</span>
              </Link>
            </NavItem>
          );
        } else if (item.type === "collapse" && (!item?.permissions || hasAnyPermissions(item.permissions))) {
          return (
            <NavItem key={`navItem-${index}`} active={item.active}>
              <Link
                key={`navLink-${index}`}
                to={"#javascript"}
                className="nav-link collapsed"
                data-toggle="collapse"
                data-target={`#navCollapse-${index}`}
                aria-expanded="true"
                aria-controls={`navCollapse-${index}`}
                onClick={() => {
                  if (collapseActive === `navCollapse-${index}`)
                    setCollapseActive("");
                  else
                    setCollapseActive(`navCollapse-${index}`)
                }}
              >
                {item.icon ? (<i className={item.icon}></i>) : ""}
                <span>{item.text}</span>
              </Link>
              <Collapse
                key={`navCollapse-${index}`}
                id={`navCollapse-${index}`}
                aria-labelledby={`navHeading-${index}`}
                data-parent="#accordionSidebar"
                isOpen={(collapseActive === `navCollapse-${index}`)}>
                <div className="bg-white py-2 collapse-inner rounded">
                  {item?.children?.map((child, childIndex) => {
                    if (child.type === "collapse-header")
                      return (
                        <h6
                          key={`collapseHeader-${index}-${childIndex}`}
                          className="collapse-header"
                        >
                          {child.text}
                        </h6>
                      );
                    else if (child.type === "collapse-item" && (!child?.permissions || hasAnyPermissions(child.permissions)))
                      return (
                        <Link
                          key={`collapseItem-${index}-${childIndex}`}
                          to={child.link || "#javascript"}
                          className="collapse-item"
                        >
                          {child.text}
                        </Link>
                      );
                    return (<></>);
                  })}
                </div>
              </Collapse>
            </NavItem>
          );
        } else if (item.type === "card" && (!item?.permissions || hasAnyPermissions(item.permissions))) {
          return (
            <div
              key={`navCard-${index}`}
              className="sidebar-card"
            >
              {item.card}
            </div>
          );
        }
        return (<></>);
      })}
      <div className="text-center d-none d-md-inline">
        <button className="rounded-circle border-0" id="sidebarToggle" onClick={handleToggle}></button>
      </div>
    </ul>
  );
}
