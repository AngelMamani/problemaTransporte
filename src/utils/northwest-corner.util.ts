import type { TransportProblem, TransportSolution, Allocation, SolutionStep } from '../types';
import { balanceProblem, isBalanced } from './transport-algorithm.util';

export function solveNorthwestCorner(problem: TransportProblem): TransportSolution {
  const balancedProblem = balanceProblem(problem);
  const numOrigins = balancedProblem.supplies.length;
  const numDestinations = balancedProblem.demands.length;

  const allocations: Allocation[][] = Array(numOrigins)
    .fill(null)
    .map(() => Array(numDestinations).fill(null).map(() => ({
      row: 0,
      col: 0,
      quantity: 0,
      cost: 0,
    })));

  const remainingSupplies = [...balancedProblem.supplies];
  const remainingDemands = [...balancedProblem.demands];
  const steps: SolutionStep[] = [];

  let row = 0;
  let col = 0;
  let totalCost = 0;
  let stepIndex = 1;

  while (row < numOrigins && col < numDestinations) {
    const supply = remainingSupplies[row];
    const demand = remainingDemands[col];
    const cost = balancedProblem.costs[row][col];

    const allocation = Math.min(supply, demand);

    // Guardar el estado ANTES de la asignación para mostrar el paso correctamente
    const suppliesBefore = [...remainingSupplies];
    const demandsBefore = [...remainingDemands];

    allocations[row][col] = {
      row,
      col,
      quantity: allocation,
      cost,
    };

    totalCost += allocation * cost;

    // Actualizar después de guardar el estado anterior
    remainingSupplies[row] -= allocation;
    remainingDemands[col] -= allocation;

    steps.push({
      stepIndex: stepIndex++,
      description: `Paso ${stepIndex - 1}: Asignar ${allocation.toFixed(2)} unidades en celda (${row + 1}, ${col + 1}) con costo ${cost.toFixed(2)}. Oferta disponible: ${suppliesBefore[row].toFixed(2)}, Demanda disponible: ${demandsBefore[col].toFixed(2)}`,
      chosenCell: {
        row,
        col,
        quantity: allocation,
        cost,
      },
      // Guardar el estado DESPUÉS de la asignación para mostrar correctamente
      remainingSupplies: [...remainingSupplies],
      remainingDemands: [...remainingDemands],
      additionalInfo: {
        method: 'Esquina Noroeste',
        currentPosition: { row, col },
        suppliesBefore,
        demandsBefore,
      },
    });

    if (remainingSupplies[row] === 0) {
      row++;
    } else {
      col++;
    }
  }

  return {
    allocations,
    totalCost,
    isBalanced: isBalanced(problem),
    steps,
  };
}

