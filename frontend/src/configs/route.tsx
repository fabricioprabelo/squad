import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductManage from "../pages/Products/ProductManage";
import Roles from "../pages/Roles";
import RoleManage from "../pages/Roles/RoleManage";
import Users from "../pages/Users";
import UserManage from "../pages/Users/UserManage";

export interface Route {
  path: string;
  scopes?: string[];
  Component: any;
}
export interface CrudParam {
  id?: string;
}

const routes: Route[] = [
  { path: `${process.env.PUBLIC_URL}/`, Component: Home },
  { path: `${process.env.PUBLIC_URL}/products`, Component: Products },
  { path: `${process.env.PUBLIC_URL}/products/manage`, Component: ProductManage },
  { path: `${process.env.PUBLIC_URL}/products/manage/:id`, Component: ProductManage },
  { path: `${process.env.PUBLIC_URL}/roles`, Component: Roles },
  { path: `${process.env.PUBLIC_URL}/roles/manage`, Component: RoleManage },
  { path: `${process.env.PUBLIC_URL}/roles/manage/:id`, Component: RoleManage },
  { path: `${process.env.PUBLIC_URL}/users`, Component: Users },
  { path: `${process.env.PUBLIC_URL}/users/manage`, Component: UserManage },
  { path: `${process.env.PUBLIC_URL}/users/manage/:id`, Component: UserManage },
];

export default routes;
