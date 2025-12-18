import type { TransportProblem, TransportSolution, SolutionStep } from '../types';
import { solveMinimumCost } from './minimum-cost.util';

export function solveAssignment(problem: TransportProblem): TransportSolution {
  const baseSolution = solveMinimumCost(problem);

  if (!baseSolution.steps || baseSolution.steps.length === 0) {
    return {
      ...baseSolution,
      steps: [],
    };
  }

  const steps: SolutionStep[] = baseSolution.steps.map((step) => {
    let description = step.description.replace(
      'MÉTODO DE COSTO MÍNIMO',
      'MÉTODO DE ASIGNACIÓN'
    );

    description = description.replace(
      'MÉTODO DE COSTO MÍNIMO',
      'MÉTODO DE ASIGNACIÓN'
    );

    return {
      ...step,
      description,
      additionalInfo: {
        ...step.additionalInfo,
        method: 'Asignación',
      },
    };
  });

  return {
    ...baseSolution,
    steps,
  };
}


