import type { TransportSolution } from '../../types';
import { StepsDisplay } from './steps-display.component';
import './results-display.component.css';

interface ResultsDisplayProps {
  solution: TransportSolution | null;
  numOrigins: number;
  numDestinations: number;
  supplies?: number[];
  demands?: number[];
}

export function ResultsDisplay({ solution, numOrigins, numDestinations, supplies = [], demands = [] }: ResultsDisplayProps) {
  if (!solution) {
    return null;
  }

  // Calcular ofertas y demandas restantes
  const remainingSupplies = Array(numOrigins).fill(0).map((_, row) => {
    const totalAllocated = solution.allocations[row]?.reduce((sum, alloc) => sum + (alloc?.quantity || 0), 0) || 0;
    return (supplies[row] || 0) - totalAllocated;
  });

  const remainingDemands = Array(numDestinations).fill(0).map((_, col) => {
    const totalAllocated = solution.allocations.reduce((sum, row) => sum + (row[col]?.quantity || 0), 0);
    return (demands[col] || 0) - totalAllocated;
  });

  return (
    <div className="results-display">
      <h2 className="results-display__title">Resultados</h2>
      
      <div className="results-display__summary">
        <div className="results-display__summary-item">
          <span className="results-display__label">Costo Total:</span>
          <span className="results-display__value">{solution.totalCost.toFixed(2)}</span>
        </div>
        <div className="results-display__summary-item">
          <span className="results-display__label">Problema Balanceado:</span>
          <span className="results-display__value">{solution.isBalanced ? 'Sí' : 'No'}</span>
        </div>
      </div>

      <div className="results-display__table-wrapper">
        <table className="results-display__table">
          <thead>
            <tr>
              <th className="results-display__header-cell"></th>
              {Array.from({ length: numDestinations }).map((_, col) => (
                <th key={col} className="results-display__header-cell">
                  Destino {col + 1}
                </th>
              ))}
              <th className="results-display__header-cell results-display__header-cell--supply">Oferta</th>
              <th className="results-display__header-cell results-display__header-cell--remaining">Restante</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numOrigins }).map((_, row) => {
              const originalSupply = supplies[row] || 0;
              const remainingSupply = remainingSupplies[row] || 0;
              const isComplete = remainingSupply === 0;
              
              return (
                <tr key={row}>
                  <td className="results-display__row-header">Origen {row + 1}</td>
                  {Array.from({ length: numDestinations }).map((_, col) => {
                    const allocation = solution.allocations[row]?.[col];
                    const hasAllocation = allocation && allocation.quantity > 0;
                    return (
                      <td
                        key={col}
                        className={`results-display__cell ${hasAllocation ? 'results-display__cell--allocated' : ''}`}
                      >
                        {hasAllocation ? (
                          <div className="results-display__allocation">
                            <div className="results-display__quantity">{allocation.quantity}</div>
                            <div className="results-display__cost">({allocation.cost})</div>
                          </div>
                        ) : (
                          <span className="results-display__empty">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`results-display__cell results-display__cell--supply ${isComplete ? 'results-display__cell--complete' : ''}`}>
                    <strong>{originalSupply.toFixed(2)}</strong>
                  </td>
                  <td className={`results-display__cell results-display__cell--remaining ${isComplete ? 'results-display__cell--complete' : ''}`}>
                    <strong>{remainingSupply.toFixed(2)}</strong>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="results-display__row-header results-display__row-header--demand">Demanda</td>
              {Array.from({ length: numDestinations }).map((_, col) => {
                const originalDemand = demands[col] || 0;
                return (
                  <td key={col} className="results-display__cell results-display__cell--demand">
                    <strong>{originalDemand.toFixed(2)}</strong>
                  </td>
                );
              })}
              <td className="results-display__cell results-display__cell--total"></td>
              <td className="results-display__cell results-display__cell--total"></td>
            </tr>
            <tr>
              <td className="results-display__row-header results-display__row-header--remaining">Restante</td>
              {Array.from({ length: numDestinations }).map((_, col) => {
                const remainingDemand = remainingDemands[col] || 0;
                const isComplete = remainingDemand === 0;
                return (
                  <td key={col} className={`results-display__cell results-display__cell--remaining ${isComplete ? 'results-display__cell--complete' : ''}`}>
                    <strong>{remainingDemand.toFixed(2)}</strong>
                  </td>
                );
              })}
              <td className="results-display__cell results-display__cell--total"></td>
              <td className="results-display__cell results-display__cell--total"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {solution.steps && solution.steps.length > 0 && (
        <StepsDisplay
          steps={solution.steps}
          numOrigins={numOrigins}
          numDestinations={numDestinations}
          originalSupplies={supplies}
          originalDemands={demands}
        />
      )}
    </div>
  );
}

