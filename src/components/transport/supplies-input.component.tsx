import './supplies-input.component.css';

interface SuppliesInputProps {
  supplies: number[];
  numOrigins: number;
  onSuppliesChange: (supplies: number[]) => void;
  hasDummyRow?: boolean;
  dummySupply?: number;
}

export function SuppliesInput({ 
  supplies, 
  numOrigins, 
  onSuppliesChange,
  hasDummyRow = false,
  dummySupply = 0
}: SuppliesInputProps) {
  const handleSupplyChange = (index: number, value: number) => {
    const newSupplies = [...supplies];
    newSupplies[index] = Math.max(0, value);
    onSuppliesChange(newSupplies);
  };

  const totalSupply = supplies.reduce((sum, val) => sum + val, 0);
  const displayTotalSupply = hasDummyRow ? totalSupply + dummySupply : totalSupply;

  return (
    <div className="supplies-input">
      <h3 className="supplies-input__title">Ofertas (Supplies)</h3>
      <div className="supplies-input__grid">
        {Array.from({ length: numOrigins }).map((_, index) => (
          <div key={index} className="supplies-input__item">
            <label className="supplies-input__label">
              Origen {index + 1}:
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={supplies[index] || ''}
              onChange={(e) => handleSupplyChange(index, Number(e.target.value) || 0)}
              className="supplies-input__input"
              placeholder="0"
            />
          </div>
        ))}
        {hasDummyRow && (
          <div className="supplies-input__item supplies-input__item--dummy">
            <label className="supplies-input__label">
              Origen {numOrigins + 1} (Dummy):
            </label>
            <input
              type="number"
              value={dummySupply.toFixed(2)}
              className="supplies-input__input supplies-input__input--dummy"
              readOnly
              disabled
            />
          </div>
        )}
      </div>
      <div className="supplies-input__total">
        <strong>Total Ofertas:</strong> <span className="supplies-input__total-value">{displayTotalSupply.toFixed(2)}</span>
        {hasDummyRow && (
          <span className="supplies-input__dummy-note"> (incluye {dummySupply.toFixed(2)} de fila dummy)</span>
        )}
      </div>
    </div>
  );
}
