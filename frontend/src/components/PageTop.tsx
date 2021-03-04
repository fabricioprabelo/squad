import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function PageTop() {
  const [taptopStyle, setTapTopStyle] = useState<string>("none");

  const executeScroll = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (window.scrollY > 600) {
      setTapTopStyle("block");
    } else {
      setTapTopStyle("none");
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Link
      className="scroll-to-top rounded"
      style={{ display: taptopStyle }}
      onClick={executeScroll}
      to="#page-top"
    >
      <i className="fas fa-angle-up"></i>
    </Link>
  );
}
