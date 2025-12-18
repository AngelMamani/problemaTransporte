import './solve-button.component.css';

interface SolveButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function SolveButton({ onClick, disabled = false, isLoading = false }: SolveButtonProps) {
  return (
    <div className="solve-button">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        className="solve-button__button"
      >
        {isLoading ? 'Resolviendo...' : 'Resolver Problema'}
      </button>
    </div>
  );
}

