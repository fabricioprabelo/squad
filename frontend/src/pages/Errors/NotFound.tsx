import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SITE_NAME } from "../../configs/constants";

export default function NotFound() {
  useEffect(() => {
    document.title = `${SITE_NAME} :: 404 - Não encontrado`;
  }, []);

  return (
    <div className="text-center">
      <div className="error mx-auto" data-text="404">404</div>
      <p className="lead text-gray-800 mb-5">Página Não Encontrada</p>
      <p className="text-gray-500 mb-0">Parece que você encontrou uma falha na matriz...</p><br /><br />
      <Link to="/">&larr; Voltar ao Dashboard</Link>
    </div>
  );
}
