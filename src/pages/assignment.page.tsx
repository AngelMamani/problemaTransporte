import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import { Container } from '../components/layout/container.layout';
import { BackButton } from '../components/navigation/back-button.component';
import { AssignmentStepsDisplay } from '../components/transport/assignment-steps-display.component';
import { solveHungarianAssignment } from '../utils';
import type { AssignmentSolution } from '../types';
import './assignment.page.css';

const MIN_SIZE = 2;
const MAX_SIZE = 6;

export function AssignmentPage() {
  const [size, setSize] = useState(3);
  const [costs, setCosts] = useState<number[][]>(
    Array(3).fill(null).map(() => Array(3).fill(0))
  );
  const [solution, setSolution] = useState<AssignmentSolution | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    inputRefs.current = Array(size)
      .fill(null)
      .map(() => Array(size).fill(null));
  }, [size]);

  const handleSizeChange = (newSize: number) => {
    const clamped = Math.max(MIN_SIZE, Math.min(MAX_SIZE, newSize));
    setSize(clamped);
    setSolution(null);

    setCosts(prev => {
      const base = prev.length > 0 ? prev : Array(size).fill(null).map(() => Array(size).fill(0));
      const resized = Array(clamped).fill(null).map((_, i) =>
        Array(clamped).fill(null).map((_, j) => base[i]?.[j] ?? 0)
      );
      return resized;
    });
  };

  const handleCostChange = (row: number, col: number, value: number) => {
    setCosts(prev =>
      prev.map((r, i) =>
        i === row ? r.map((c, j) => (j === col ? Math.max(0, value) : c)) : r
      )
    );
    setSolution(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();

      let nextRow = row;
      let nextCol = col;

      if (e.key === 'Enter' || !e.shiftKey) {
        nextCol += 1;
        if (nextCol >= size) {
          nextCol = 0;
          nextRow += 1;
        }
      } else {
        nextCol -= 1;
        if (nextCol < 0) {
          nextCol = size - 1;
          nextRow -= 1;
        }
      }

      if (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) {
        inputRefs.current[nextRow]?.[nextCol]?.focus();
        inputRefs.current[nextRow]?.[nextCol]?.select();
      }
    }
  };

  const handleSolve = () => {
    const safeCosts = costs.map(row =>
      row.map(val => (Number.isFinite(val) ? val : 0))
    );
    const result = solveHungarianAssignment({ costs: safeCosts });
    setSolution(result);
  };

  return (
    <Container>
      <div className="assignment-page">
        <BackButton />
        <header className="assignment-page__header">
          <h1>Método de Asignación (Algoritmo Húngaro)</h1>
          <p className="assignment-page__subtitle">
            Calcula la asignación óptima de trabajos a personas minimizando el costo total.
          </p>
        </header>

        <main className="assignment-page__content">
          <section className="assignment-section">
            <h2 className="assignment-section__title">Configuración del Problema</h2>
            <div className="assignment-config">
              <label htmlFor="size" className="assignment-config__label">
                Tamaño de la matriz (n × n):
              </label>
              <input
                id="size"
                type="number"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={size}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="assignment-config__input"
              />
              <p className="assignment-config__hint">
                Representa {size} trabajos y {size} personas (un trabajo por persona).
              </p>
            </div>
          </section>

          <section className="assignment-section">
            <h2 className="assignment-section__title">Matriz de Costos</h2>
            <p className="assignment-section__text">
              Ingrese el costo de asignar cada trabajo (filas) a cada persona (columnas).
            </p>
            <div className="assignment-matrix__wrapper">
              <table className="assignment-matrix">
                <thead>
                  <tr>
                    <th></th>
                    {Array.from({ length: size }).map((_, j) => (
                      <th key={j} className="assignment-matrix__header">
                        Persona {j + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: size }).map((_, i) => (
                    <tr key={i}>
                      <td className="assignment-matrix__row-header">
                        Trabajo {i + 1}
                      </td>
                      {Array.from({ length: size }).map((_, j) => (
                        <td key={j}>
                          <input
                            ref={(el) => {
                              if (!inputRefs.current[i]) {
                                inputRefs.current[i] = [];
                              }
                              inputRefs.current[i][j] = el;
                            }}
                            type="number"
                            min={0}
                            step={1}
                            value={costs[i]?.[j] ?? 0}
                            onChange={(e) =>
                              handleCostChange(i, j, Number(e.target.value) || 0)
                            }
                            onKeyDown={(e) => handleKeyDown(e, i, j)}
                            className="assignment-matrix__input"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="assignment-section">
            <button
              type="button"
              onClick={handleSolve}
              className="assignment-page__solve-button"
            >
              Resolver Asignación Óptima
            </button>
          </section>

          {solution && (
            <>
              <section className="assignment-section">
                <h2 className="assignment-section__title">Resultado</h2>
                <p className="assignment-result__summary">
                  Costo total mínimo: <strong>{solution.totalCost.toFixed(2)}</strong>
                </p>
                {solution.assignments.length > 0 && (
                  <p className="assignment-result__formula">
                    Z ={' '}
                    {solution.assignments
                      .map((a, index) => {
                        const term = a.cost.toFixed(2);
                        const isLast = index === solution.assignments.length - 1;
                        return isLast ? term : `${term} + `;
                      })
                      .join('')}
                    {' = '}
                    {solution.totalCost.toFixed(2)}
                  </p>
                )}
                <table className="assignment-result__table">
                  <thead>
                    <tr>
                      <th>Trabajo</th>
                      <th>Persona</th>
                      <th>Costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solution.assignments.map((a, index) => (
                      <tr key={`${a.row}-${a.col}-${index}`}>
                        <td>Trabajo {a.row + 1}</td>
                        <td>Persona {a.col + 1}</td>
                        <td>{a.cost.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              {solution.steps && solution.steps.length > 0 && (
                <AssignmentStepsDisplay
                  steps={solution.steps}
                  originalCosts={costs}
                  finalAssignments={solution.assignments}
                  totalCost={solution.totalCost}
                />
              )}
            </>
          )}
        </main>
      </div>
    </Container>
  );
}


