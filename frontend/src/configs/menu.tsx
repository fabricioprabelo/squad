import { ReactNode } from "react";

export interface IMenuItem {
  id?: string | number;
  type:
  | "card"
  | "heading"
  | "item"
  | "divider"
  | "collapse"
  | "collapse-item"
  | "collapse-header";
  icon?: string;
  text?: string;
  link?: string;
  active?: boolean;
  card?: ReactNode;
  children?: IMenuItem[];
}

let menu: IMenuItem[] = [
  {
    type: "item",
    text: "Dashboard",
    link: "/",
    icon: "fas fa-fw fa-tachometer-alt",
  },
  {
    type: "divider",
  },
  {
    type: "heading",
    text: "Cadastros",
  },
  {
    type: "collapse",
    icon: "fas fa-fw fa-cubes",
    text: "Produtos",
    children: [
      {
        type: "collapse-header",
        text: "Gerenciar produtos",
      },
      {
        type: "collapse-item",
        text: "Lista produtos",
        link: "/products",
      },
      {
        type: "collapse-item",
        text: "Criar produto",
        link: "/products/manage",
      },
    ],
  },
  {
    type: "divider",
  },
  {
    type: "heading",
    text: "Segurança",
  },
  {
    type: "collapse",
    icon: "fas fa-fw fa-user-tag",
    text: "Regras",
    children: [
      {
        type: "collapse-header",
        text: "Gerenciar regras",
      },
      {
        type: "collapse-item",
        text: "Lista regras",
        link: "/roles",
      },
      {
        type: "collapse-item",
        text: "Criar regra",
        link: "/roles/manage",
      },
    ],
  },
  {
    type: "collapse",
    icon: "fas fa-fw fa-users",
    text: "Usuários",
    children: [
      {
        type: "collapse-header",
        text: "Gerenciar usuários",
      },
      {
        type: "collapse-item",
        text: "Lista usuários",
        link: "/users",
      },
      {
        type: "collapse-item",
        text: "Criar usuário",
        link: "/users/manage",
      },
    ],
  },
  // {
  //   type: "card",
  //   card: (
  //     <>
  //       <img className="sidebar-card-illustration mb-2" src="img/undraw_rocket.svg" alt="" />
  //       <p className="text-center mb-2"><strong>SB Admin Pro</strong> is packed with premium features, components, and more!</p>
  //       <a className="btn btn-success btn-sm" href="https://startbootstrap.com/theme/sb-admin-pro">Upgrade to Pro!</a>
  //     </>
  //   )
  // }
];

export default menu.map((item, index) => ({
  id: `sidebarMenu-${index}`,
  ...item,
}));
