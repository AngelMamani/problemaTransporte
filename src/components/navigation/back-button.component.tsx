import { useNavigate } from 'react-router-dom';
import './back-button.component.css';

export function BackButton() {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate('/')}
      className="back-button"
    >
      ← Volver a la Información
    </button>
  );
}

