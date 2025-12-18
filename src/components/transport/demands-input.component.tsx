import './demands-input.component.css';

interface DemandsInputProps {
  demands: number[];
  numDestinations: number;
  onDemandsChange: (demands: number[]) => void;
  hasDummyCol?: boolean;
  dummyDemand?: number;
}

export function DemandsInput({ 
  demands, 
  numDestinations, 
  onDemandsChange,
  hasDummyCol = false,
  dummyDemand = 0
}: DemandsInputProps) {
  const handleDemandChange = (index: number, value: number) => {
    const newDemands = [...demands];
    newDemands[index] = Math.max(0, value);
    onDemandsChange(newDemands);
  };

  const totalDemand = demands.reduce((sum, val) => sum + val, 0);
  const displayTotalDemand = hasDummyCol ? totalDemand + dummyDemand : totalDemand;

  return (
    <div className="demands-input">
      <h3 className="demands-input__title">Demandas (Demands)</h3>
      <div className="demands-input__grid">
        {Array.from({ length: numDestinations }).map((_, index) => (
          <div key={index} className="demands-input__item">
            <label className="demands-input__label">
              Destino {index + 1}:
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={demands[index] || ''}
              onChange={(e) => handleDemandChange(index, Number(e.target.value) || 0)}
              className="demands-input__input"
              placeholder="0"
            />
          </div>
        ))}
        {hasDummyCol && (
          <div className="demands-input__item demands-input__item--dummy">
            <label className="demands-input__label">
              Destino {numDestinations + 1} (Dummy):
            </label>
            <input
              type="number"
              value={dummyDemand.toFixed(2)}
              className="demands-input__input demands-input__input--dummy"
              readOnly
              disabled
            />
          </div>
        )}
      </div>
      <div className="demands-input__total">
        <strong>Total Demandas:</strong> <span className="demands-input__total-value">{displayTotalDemand.toFixed(2)}</span>
        {hasDummyCol && (
          <span className="demands-input__dummy-note"> (incluye {dummyDemand.toFixed(2)} de columna dummy)</span>
        )}
      </div>
    </div>
  );
}
