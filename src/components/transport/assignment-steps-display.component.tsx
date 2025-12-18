import { useState } from 'react';
import type { SolutionStep } from '../../types';
import './assignment-steps-display.component.css';

interface AssignmentStepsDisplayProps {
  steps: SolutionStep[];
  originalCosts: number[][];
  finalAssignments: Array<{ row: number; col: number; cost: number }>;
  totalCost: number;
}

export function AssignmentStepsDisplay({
  steps,
  originalCosts,
  finalAssignments,
  totalCost,
}: AssignmentStepsDisplayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const n = originalCosts.length;

  if (!steps || steps.length === 0) {
    return null;
  }

  const totalSteps = steps.length;

  const getCurrentMatrix = () => {
    if (currentStep === 0) {
      return originalCosts;
    }

    const step = steps[currentStep - 1];
    if (!step.additionalInfo) return originalCosts;

    if ('reducedCosts' in step.additionalInfo && Array.isArray(step.additionalInfo.reducedCosts)) {
      return step.additionalInfo.reducedCosts as number[][];
    }

    if ('adjustedCosts' in step.additionalInfo && Array.isArray(step.additionalInfo.adjustedCosts)) {
      return step.additionalInfo.adjustedCosts as number[][];
    }

    if ('currentCosts' in step.additionalInfo && Array.isArray(step.additionalInfo.currentCosts)) {
      return step.additionalInfo.currentCosts as number[][];
    }

    return originalCosts;
  };

  const getCurrentAssignments = () => {
    if (currentStep === 0) return [];
    if (currentStep === totalSteps) return finalAssignments;

    const step = steps[currentStep - 1];
    if (step.additionalInfo && 'currentAssignments' in step.additionalInfo) {
      const assignments = step.additionalInfo.currentAssignments as Array<{ row: number; col: number }>;
      return assignments.map(({ row, col }) => ({
        row,
        col,
        cost: originalCosts[row]?.[col] ?? 0,
      }));
    }

    return [];
  };

  const getCoveredRows = () => {
    if (currentStep === 0) return Array(n).fill(false);
    const step = steps[currentStep - 1];
    if (step.additionalInfo && 'coveredRows' in step.additionalInfo) {
      return (step.additionalInfo.coveredRows as boolean[]) ?? Array(n).fill(false);
    }
    return Array(n).fill(false);
  };

  const getCoveredCols = () => {
    if (currentStep === 0) return Array(n).fill(false);
    const step = steps[currentStep - 1];
    if (step.additionalInfo && 'coveredCols' in step.additionalInfo) {
      return (step.additionalInfo.coveredCols as boolean[]) ?? Array(n).fill(false);
    }
    return Array(n).fill(false);
  };

  const currentMatrix = getCurrentMatrix();
  const currentAssignments = getCurrentAssignments();
  const coveredRows = getCoveredRows();
  const coveredCols = getCoveredCols();
  const currentStepData = currentStep > 0 && currentStep <= totalSteps ? steps[currentStep - 1] : null;

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps)));
  };

  const goPrevious = () => {
    setCurrentStep(Math.max(0, currentStep - 1));
  };

  const goNext = () => {
    setCurrentStep(Math.min(totalSteps, currentStep + 1));
  };

  return (
    <div className="assignment-steps-display">
      <h3 className="assignment-steps-display__title">Proceso Paso a Paso</h3>

      <div className="assignment-steps-display__controls">
        <button
          onClick={goPrevious}
          disabled={currentStep === 0}
          className="assignment-steps-display__button"
        >
          ← Anterior
        </button>
        <span className="assignment-steps-display__counter">
          Paso {currentStep} de {totalSteps}
          {currentStep === 0 ? ' (Estado Inicial)' : ''}
          {currentStep === totalSteps ? ' (Final)' : ''}
        </span>
        <button
          onClick={goNext}
          disabled={currentStep === totalSteps}
          className="assignment-steps-display__button"
        >
          Siguiente →
        </button>
      </div>

      <div className="assignment-steps-display__slider-container">
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={currentStep}
          onChange={(e) => goToStep(Number(e.target.value))}
          className="assignment-steps-display__slider"
        />
      </div>

      {currentStepData && (
        <div className="assignment-steps-display__step-info">
          <div className="assignment-steps-display__description">
            {currentStepData.description.split('\n').map((line, index) => (
              <div
                key={index}
                className={
                  line.trim().startsWith('PASO') || line.trim().startsWith('════')
                    ? 'assignment-steps-display__description-title'
                    : line.trim().match(/^\d+\./) || line.trim().startsWith('━━')
                    ? 'assignment-steps-display__description-step'
                    : 'assignment-steps-display__description-line'
                }
              >
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
      )}

      {currentStep === 0 && (
        <div className="assignment-steps-display__step-info">
          <div className="assignment-steps-display__description">
            <div className="assignment-steps-display__description-title">ESTADO INICIAL</div>
            <div className="assignment-steps-display__description-line">
              Matriz de costos original del problema de asignación.
            </div>
          </div>
        </div>
      )}

      {currentStep === totalSteps && (
        <div className="assignment-steps-display__step-info">
          <div className="assignment-steps-display__description">
            <div className="assignment-steps-display__description-title">RESULTADO FINAL</div>
            <div className="assignment-steps-display__description-line">
              Asignaciones óptimas encontradas:
            </div>
            {finalAssignments.map((a, idx) => (
              <div key={idx} className="assignment-steps-display__description-line">
                Trabajo {a.row + 1} → Persona {a.col + 1} (Costo: {a.cost.toFixed(2)})
              </div>
            ))}
            <div className="assignment-steps-display__description-step">
              Z ={' '}
              {finalAssignments
                .map((a, idx) => {
                  const term = a.cost.toFixed(2);
                  const isLast = idx === finalAssignments.length - 1;
                  return isLast ? term : `${term} + `;
                })
                .join('')}
              {' = '}
              {totalCost.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div className="assignment-steps-display__matrix-wrapper">
        <table className="assignment-steps-display__table">
          <thead>
            <tr>
              <th className="assignment-steps-display__header-cell"></th>
              {Array.from({ length: n }).map((_, j) => (
                <th key={j} className="assignment-steps-display__header-cell">
                  Persona {j + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: n }).map((_, i) => {
              const rowCovered = coveredRows[i];
              return (
                <tr key={i}>
                  <td
                    className={`assignment-steps-display__row-header ${
                      rowCovered ? 'assignment-steps-display__row-header--covered' : ''
                    }`}
                  >
                    Trabajo {i + 1}
                  </td>
                  {Array.from({ length: n }).map((_, j) => {
                    const value = currentMatrix[i]?.[j] ?? 0;
                    const colCovered = coveredCols[j];
                    const isAssigned = currentAssignments.some((a) => a.row === i && a.col === j);
                    const isZero = Math.abs(value) < 0.01;

                    let cellClass = 'assignment-steps-display__cell';
                    if (rowCovered && colCovered) {
                      cellClass += ' assignment-steps-display__cell--covered-both';
                    } else if (rowCovered) {
                      cellClass += ' assignment-steps-display__cell--covered-row';
                    } else if (colCovered) {
                      cellClass += ' assignment-steps-display__cell--covered-col';
                    }

                    if (isAssigned) {
                      cellClass += ' assignment-steps-display__cell--assigned';
                    }

                    if (isZero && !isAssigned) {
                      cellClass += ' assignment-steps-display__cell--zero';
                    }

                    return (
                      <td key={j} className={cellClass}>
                        <div className="assignment-steps-display__cell-content">
                          <div className="assignment-steps-display__cell-value">
                            {value.toFixed(2)}
                          </div>
                          {isAssigned && (
                            <div className="assignment-steps-display__assignment-mark">✓</div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="assignment-steps-display__steps-list">
        <h4 className="assignment-steps-display__list-title">Lista de Pasos</h4>
        <div className="assignment-steps-display__steps">
          <button
            onClick={() => goToStep(0)}
            className={`assignment-steps-display__step-button ${
              currentStep === 0 ? 'assignment-steps-display__step-button--active' : ''
            }`}
          >
            Estado Inicial
          </button>
          {steps.map((step, index) => (
            <button
              key={step.stepIndex}
              onClick={() => goToStep(index + 1)}
              className={`assignment-steps-display__step-button ${
                currentStep === index + 1 ? 'assignment-steps-display__step-button--active' : ''
              }`}
            >
              Paso {step.stepIndex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

