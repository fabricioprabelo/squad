import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductManage from "../pages/Products/ProductManage";
import Roles from "../pages/Roles";
import RoleManage from "../pages/Roles/RoleManage";
import Users from "../pages/Users";
import Profile from "../pages/Users/Profile";
import UserManage from "../pages/Users/UserManage";

export interface Route {
  path: string;
  permissions?: string[];
  Component: any;
}
export interface CrudParam {
  id?: string;
}

const routes: Route[] = [
  { path: `${process.env.PUBLIC_URL}/`, Component: Home },
  { path: `${process.env.PUBLIC_URL}/profile`, Component: Profile },
  { path: `${process.env.PUBLIC_URL}/products`, Component: Products, permissions: ["Products:Products"] },
  { path: `${process.env.PUBLIC_URL}/products/manage`, Component: ProductManage, permissions: ["Products:Product", "Products:Create", "Products: Upgrade"] },
  { path: `${process.env.PUBLIC_URL}/products/manage/:id`, Component: ProductManage, permissions: ["Products:Product", "Products:Update"] },
  { path: `${process.env.PUBLIC_URL}/roles`, Component: Roles, permissions: ["Roles:Roles"] },
  { path: `${process.env.PUBLIC_URL}/roles/manage`, Component: RoleManage, permissions: ["Roles:Role", "Roles:Create", "Roles: Upgrade"] },
  { path: `${process.env.PUBLIC_URL}/roles/manage/:id`, Component: RoleManage, permissions: ["Roles:Role", "Roles:Update"] },
  { path: `${process.env.PUBLIC_URL}/users`, Component: Users, permissions: ["Users:Users"] },
  { path: `${process.env.PUBLIC_URL}/users/manage`, Component: UserManage, permissions: ["Users:User", "Users:Create", "Users: Upgrade"] },
  { path: `${process.env.PUBLIC_URL}/users/manage/:id`, Component: UserManage, permissions: ["Users:User", "Users:Update"] },
];

export default routes;
