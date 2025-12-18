import { useState } from 'react';
import type { SolutionStep } from '../../types';
import './steps-display.component.css';

interface StepsDisplayProps {
  steps: SolutionStep[];
  numOrigins: number;
  numDestinations: number;
  originalSupplies: number[];
  originalDemands: number[];
}

export function StepsDisplay({ 
  steps, 
  numOrigins, 
  numDestinations,
  originalSupplies,
  originalDemands 
}: StepsDisplayProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!steps || steps.length === 0) {
    return null;
  }

  const totalSteps = steps.length;

  // Construir matriz hasta el paso actual
  const buildMatrixAtStep = (stepIndex: number): number[][] => {
    const matrix = Array(numOrigins).fill(null).map(() => Array(numDestinations).fill(0));
    
    for (let i = 0; i <= stepIndex && i < steps.length; i++) {
      const step = steps[i];
      if (step.chosenCell) {
        matrix[step.chosenCell.row][step.chosenCell.col] = step.chosenCell.quantity;
      }
    }
    
    return matrix;
  };

  const getCurrentMatrix = () => {
    if (currentStep === 0) {
      return Array(numOrigins).fill(null).map(() => Array(numDestinations).fill(0));
    }
    return buildMatrixAtStep(currentStep - 1);
  };

  const getCurrentSupplies = () => {
    if (currentStep === 0) {
      return originalSupplies;
    }
    return steps[currentStep - 1].remainingSupplies;
  };

  const getCurrentDemands = () => {
    if (currentStep === 0) {
      return originalDemands;
    }
    return steps[currentStep - 1].remainingDemands;
  };

  const getCurrentStepData = () => {
    if (currentStep === 0) return null;
    if (currentStep > 0 && currentStep <= totalSteps) {
      return steps[currentStep - 1];
    }
    return null;
  };

  const currentStepData = getCurrentStepData();
  const currentMatrix = getCurrentMatrix();
  const currentSupplies = getCurrentSupplies();
  const currentDemands = getCurrentDemands();

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
    <div className="steps-display">
      <h3 className="steps-display__title">Proceso Paso a Paso</h3>
      
      <div className="steps-display__controls">
        <button
          onClick={goPrevious}
          disabled={currentStep === 0}
          className="steps-display__button"
        >
          ← Anterior
        </button>
        <span className="steps-display__counter">
          Paso {currentStep} de {totalSteps}
          {currentStep === 0 ? ' (Estado Inicial)' : ''}
          {currentStep === totalSteps ? ' (Final)' : ''}
        </span>
        <button
          onClick={goNext}
          disabled={currentStep === totalSteps}
          className="steps-display__button"
        >
          Siguiente →
        </button>
      </div>

      <div className="steps-display__slider-container">
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={currentStep}
          onChange={(e) => goToStep(Number(e.target.value))}
          className="steps-display__slider"
        />
      </div>

      {currentStepData && (
        <div className="steps-display__step-info">
          <div className="steps-display__description">
            {currentStepData.description.split('\n').map((line, index) => (
              <div key={index} className={line.trim().startsWith('Paso') ? 'steps-display__description-title' : line.trim().match(/^\d+\./) ? 'steps-display__description-step' : 'steps-display__description-line'}>
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="steps-display__matrix-wrapper">
        <table className="steps-display__table">
          <thead>
            <tr>
              <th className="steps-display__header-cell"></th>
              {Array.from({ length: numDestinations }).map((_, col) => (
                <th key={col} className="steps-display__header-cell">
                  Destino {col + 1}
                </th>
              ))}
              <th className="steps-display__header-cell steps-display__header-cell--supply">Oferta</th>
              <th className="steps-display__header-cell steps-display__header-cell--remaining">Restante</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: numOrigins }).map((_, row) => {
              const remainingSupply = currentSupplies[row] || 0;
              const originalSupply = originalSupplies[row] || 0;
              const isComplete = remainingSupply === 0;
              
              return (
                <tr key={row}>
                  <td className="steps-display__row-header">Origen {row + 1}</td>
                  {Array.from({ length: numDestinations }).map((_, col) => {
                    const value = currentMatrix[row]?.[col] || 0;
                    const hasAllocation = value > 0;
                    const isCurrentCell = currentStepData?.chosenCell?.row === row && 
                                        currentStepData?.chosenCell?.col === col;
                    
                    return (
                      <td
                        key={col}
                        className={`steps-display__cell ${
                          hasAllocation ? 'steps-display__cell--allocated' : ''
                        } ${isCurrentCell ? 'steps-display__cell--current' : ''}`}
                      >
                        {hasAllocation ? (
                          <div className="steps-display__allocation">
                            <div className="steps-display__quantity">{value.toFixed(2)}</div>
                          </div>
                        ) : (
                          <span className="steps-display__empty">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className={`steps-display__cell steps-display__cell--supply`}>
                    <strong>{originalSupply.toFixed(2)}</strong>
                  </td>
                  <td className={`steps-display__cell steps-display__cell--remaining ${isComplete ? 'steps-display__cell--complete' : ''}`}>
                    <strong>{remainingSupply.toFixed(2)}</strong>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td className="steps-display__row-header steps-display__row-header--demand">Demanda</td>
              {Array.from({ length: numDestinations }).map((_, col) => {
                const originalDemand = originalDemands[col] || 0;
                return (
                  <td key={col} className="steps-display__cell steps-display__cell--demand">
                    <strong>{originalDemand.toFixed(2)}</strong>
                  </td>
                );
              })}
              <td className="steps-display__cell steps-display__cell--total"></td>
              <td className="steps-display__cell steps-display__cell--total"></td>
            </tr>
            <tr>
              <td className="steps-display__row-header steps-display__row-header--remaining">Restante</td>
              {Array.from({ length: numDestinations }).map((_, col) => {
                const remainingDemand = currentDemands[col] || 0;
                const isComplete = remainingDemand === 0;
                return (
                  <td key={col} className={`steps-display__cell steps-display__cell--remaining ${isComplete ? 'steps-display__cell--complete' : ''}`}>
                    <strong>{remainingDemand.toFixed(2)}</strong>
                  </td>
                );
              })}
              <td className="steps-display__cell steps-display__cell--total"></td>
              <td className="steps-display__cell steps-display__cell--total"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="steps-display__steps-list">
        <h4 className="steps-display__list-title">Lista de Pasos</h4>
        <div className="steps-display__steps">
          <button
            onClick={() => goToStep(0)}
            className={`steps-display__step-button ${currentStep === 0 ? 'steps-display__step-button--active' : ''}`}
          >
            Estado Inicial
          </button>
          {steps.map((step, index) => (
            <button
              key={step.stepIndex}
              onClick={() => goToStep(index + 1)}
              className={`steps-display__step-button ${currentStep === index + 1 ? 'steps-display__step-button--active' : ''}`}
            >
              Paso {step.stepIndex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

