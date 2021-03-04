import { SITE_NAME } from "../configs/constants";

export default function Footer() {
  return (
    <footer className="sticky-footer bg-white">
      <div className="container my-auto">
        <div className="copyright text-center my-auto">
          <span>Copyright&copy; {new Date().getFullYear()} - {SITE_NAME}. Criado por Fabricio Pereira Rabelo.</span>
        </div>
      </div>
    </footer>
  );
}
