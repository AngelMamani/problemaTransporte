import { useRef, useEffect } from 'react';
import './costs-matrix.component.css';

interface CostsMatrixProps {
  costs: number[][];
  numOrigins: number;
  numDestinations: number;
  onCostsChange: (costs: number[][]) => void;
  showMatrix: boolean;
  hasDummyRow?: boolean;
  hasDummyCol?: boolean;
  supplies?: number[];
  demands?: number[];
}

export function CostsMatrix({ 
  costs, 
  numOrigins, 
  numDestinations, 
  onCostsChange, 
  showMatrix, 
  hasDummyRow = false, 
  hasDummyCol = false,
  supplies = [],
  demands = []
}: CostsMatrixProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    inputRefs.current = Array(numOrigins)
      .fill(null)
      .map(() => Array(numDestinations).fill(null));
  }, [numOrigins, numDestinations]);

  const handleCostChange = (row: number, col: number, value: number) => {
    const newCosts = costs.map((r, i) =>
      i === row ? r.map((c, j) => (j === col ? Math.max(0, value) : c)) : r
    );
    onCostsChange(newCosts);
  };

  const isDummyCell = (r: number, c: number): boolean => {
    // IMPORTANTE: Solo marca como dummy la fila O columna que realmente existe, nunca ambas
    const isDummyRowCell = hasDummyRow && r === numOrigins - 1 && numOrigins > 0;
    const isDummyColCell = hasDummyCol && c === numDestinations - 1 && numDestinations > 0;
    return isDummyRowCell || isDummyColCell;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      
      let nextRow = row;
      let nextCol = col;
      let attempts = 0;
      const maxAttempts = numOrigins * numDestinations;

      do {
        if (e.key === 'Enter') {
          nextCol += 1;
          if (nextCol >= numDestinations) {
            nextCol = 0;
            nextRow += 1;
          }
        } else {
          if (!e.shiftKey) {
            nextCol += 1;
            if (nextCol >= numDestinations) {
              nextCol = 0;
              nextRow += 1;
            }
          } else {
            nextCol -= 1;
            if (nextCol < 0) {
              nextCol = numDestinations - 1;
              nextRow -= 1;
            }
          }
        }

        attempts++;
        if (attempts > maxAttempts) break;
      } while (
        nextRow >= 0 && 
        nextRow < numOrigins && 
        nextCol >= 0 && 
        nextCol < numDestinations &&
        isDummyCell(nextRow, nextCol)
      );

      if (nextRow >= 0 && nextRow < numOrigins && nextCol >= 0 && nextCol < numDestinations && !isDummyCell(nextRow, nextCol)) {
        inputRefs.current[nextRow]?.[nextCol]?.focus();
        inputRefs.current[nextRow]?.[nextCol]?.select();
      }
    }
  };

  if (!showMatrix) {
    return (
      <div className="costs-matrix costs-matrix--hidden">
        <h3 className="costs-matrix__title">Matriz de Costos</h3>
        <p className="costs-matrix__message">
          Configure el número de orígenes y destinos, e ingrese las ofertas y demandas para mostrar la matriz.
        </p>
      </div>
    );
  }

  return (
    <div className="costs-matrix">
      <h3 className="costs-matrix__title">Matriz de Costos</h3>
      <p className="costs-matrix__hint">
        Presione Enter o Tab para navegar entre casilleros
      </p>
      <div className="costs-matrix__table-wrapper">
        <table className="costs-matrix__table">
          <thead>
            <tr>
              <th className="costs-matrix__header-cell"></th>
              {Array.from({ length: numDestinations }).map((_, col) => {
                const isDummyCol = hasDummyCol && col === numDestinations - 1 && numDestinations > 0;
                return (
                  <th key={col} className={`costs-matrix__header-cell ${isDummyCol ? 'costs-matrix__header-cell--dummy' : ''}`}>
                    {isDummyCol ? `Destino ${col + 1} (Dummy)` : `Destino ${col + 1}`}
                  </th>
                );
              })}
              <th className="costs-matrix__header-cell costs-matrix__header-cell--supply">Oferta</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numOrigins }).map((_, row) => {
              const isDummyRow = hasDummyRow && row === numOrigins - 1 && numOrigins > 0;
              return (
                <tr key={row}>
                  <td className={`costs-matrix__row-header ${isDummyRow ? 'costs-matrix__row-header--dummy' : ''}`}>
                    {isDummyRow ? `Origen ${row + 1} (Dummy)` : `Origen ${row + 1}`}
                  </td>
                {Array.from({ length: numDestinations }).map((_, col) => {
                  const isDummyRowCell = hasDummyRow && row === numOrigins - 1 && numOrigins > 0;
                  const isDummyColCell = hasDummyCol && col === numDestinations - 1 && numDestinations > 0;
                  const isDummy = isDummyRowCell || isDummyColCell;
                  
                  return (
                    <td key={col} className={`costs-matrix__cell ${isDummy ? 'costs-matrix__cell--dummy' : ''}`}>
                      <input
                        ref={(el) => {
                          if (!inputRefs.current[row]) {
                            inputRefs.current[row] = [];
                          }
                          inputRefs.current[row][col] = el;
                        }}
                        type="number"
                        min="0"
                        step="0.01"
                        value={isDummy ? 0 : (costs[row]?.[col] || '')}
                        onChange={(e) => !isDummy && handleCostChange(row, col, Number(e.target.value) || 0)}
                        onKeyDown={(e) => handleKeyDown(e, row, col)}
                        className={`costs-matrix__input ${isDummy ? 'costs-matrix__input--dummy' : ''}`}
                        placeholder="0"
                        disabled={isDummy}
                        readOnly={isDummy}
                      />
                    </td>
                  );
                })}
                <td className={`costs-matrix__cell costs-matrix__cell--supply ${isDummyRow ? 'costs-matrix__cell--dummy' : ''}`}>
                  <strong>{supplies[row]?.toFixed(2) || '0.00'}</strong>
                </td>
                </tr>
              );
            })}
            <tr>
              <td className="costs-matrix__row-header costs-matrix__row-header--demand">Demanda</td>
              {Array.from({ length: numDestinations }).map((_, col) => {
                const isDummyCol = hasDummyCol && col === numDestinations - 1 && numDestinations > 0;
                return (
                  <td key={col} className={`costs-matrix__cell costs-matrix__cell--demand ${isDummyCol ? 'costs-matrix__cell--dummy' : ''}`}>
                    <strong>{demands[col]?.toFixed(2) || '0.00'}</strong>
                  </td>
                );
              })}
              <td className="costs-matrix__cell costs-matrix__cell--total"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
