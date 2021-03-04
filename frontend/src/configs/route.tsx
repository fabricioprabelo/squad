import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductManage from "../pages/Products/ProductManage";

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
];

export default routes;
