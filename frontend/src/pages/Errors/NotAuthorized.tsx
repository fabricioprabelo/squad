import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SITE_NAME } from "../../configs/constants";

export default function NotAuthorized() {
  useEffect(() => {
    document.title = `${SITE_NAME} :: 401 - Não autorizado`;
  }, []);

  return (
    <div className="text-center">
      <div className="error mx-auto" data-text="401">401</div>
      <p className="lead text-gray-800 mb-5">Não Autorizado</p>
      <p className="text-gray-500 mb-0">Desculpe, mas infelizmente você não tem autorização para acessar esta página...</p><br /><br />
      <Link to="/">&larr; Voltar ao Dashboard</Link>
    </div>
  );
}
