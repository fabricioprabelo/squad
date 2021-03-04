import { ReactNode } from "react";

interface IBreadcrumbItem {
  title: string;
  children?: ReactNode;
}

export default function Breadcrumbs({ title, children }: IBreadcrumbItem) {
  return (
    <div>
      <h1 className="h3 mb-2 text-gray-800">{title}</h1>
      {children}
    </div>
  );
}
