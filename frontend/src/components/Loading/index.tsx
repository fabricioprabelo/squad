import './index.css';

export default function Loading() {
  return (
    <div className="loading-data">
      <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
