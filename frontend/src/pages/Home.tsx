import { useEffect, useRef } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import { SITE_NAME } from "../configs/constants";

export default function Home() {
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    isMountedRef.current = true;
    document.title = `${SITE_NAME} :: Dashboard`;
    return () => { isMountedRef.current = false }
  }, []);

  return (
    <>
      <Breadcrumbs title="Dashboard" />
    </>
  );
}
