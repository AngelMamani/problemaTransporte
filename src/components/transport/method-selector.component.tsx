import './method-selector.component.css';

export type SolutionMethod = 'northwest' | 'minimum-cost' | 'vogel';

interface MethodSelectorProps {
  selectedMethod: SolutionMethod;
  onMethodChange: (method: SolutionMethod) => void;
}

export function MethodSelector({ selectedMethod, onMethodChange }: MethodSelectorProps) {
  return (
    <div className="method-selector">
      <h3 className="method-selector__title">Método de Solución</h3>
      <div className="method-selector__options">
        <label className="method-selector__option">
          <input
            type="radio"
            name="solution-method"
            value="northwest"
            checked={selectedMethod === 'northwest'}
            onChange={(e) => onMethodChange(e.target.value as SolutionMethod)}
            className="method-selector__input"
          />
          <span className="method-selector__label">Esquina Noroeste</span>
        </label>
        
        <label className="method-selector__option">
          <input
            type="radio"
            name="solution-method"
            value="minimum-cost"
            checked={selectedMethod === 'minimum-cost'}
            onChange={(e) => onMethodChange(e.target.value as SolutionMethod)}
            className="method-selector__input"
          />
          <span className="method-selector__label">Costo Mínimo</span>
        </label>
        
        <label className="method-selector__option">
          <input
            type="radio"
            name="solution-method"
            value="vogel"
            checked={selectedMethod === 'vogel'}
            onChange={(e) => onMethodChange(e.target.value as SolutionMethod)}
            className="method-selector__input"
          />
          <span className="method-selector__label">Vogel</span>
        </label>
      </div>
    </div>
  );
}

