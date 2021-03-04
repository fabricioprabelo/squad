import { useEffect } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { SITE_NAME } from "../configs/constants";

export default function Home() {
  useEffect(() => {
    document.title = `${SITE_NAME} :: Dashboard`;
  }, []);

  return (
    <>
      <Breadcrumbs title="Dashboard" />
    </>
  );
}
