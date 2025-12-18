import type { TransportProblem, TransportSolution } from '../types/transport.types';

export function isBalanced(problem: TransportProblem): boolean {
  const totalSupply = problem.supplies.reduce((sum, val) => sum + val, 0);
  const totalDemand = problem.demands.reduce((sum, val) => sum + val, 0);
  return totalSupply === totalDemand;
}

export function balanceProblem(problem: TransportProblem): TransportProblem {
  const totalSupply = problem.supplies.reduce((sum, val) => sum + val, 0);
  const totalDemand = problem.demands.reduce((sum, val) => sum + val, 0);

  // IMPORTANTE: Solo se agrega UN dummy (fila O columna), nunca ambos
  // Si oferta > demanda: se agrega SOLO una columna dummy
  if (totalSupply > totalDemand) {
    const newDemands = [...problem.demands, totalSupply - totalDemand];
    const newCosts = problem.costs.map(row => [...row, 0]);
    return {
      supplies: problem.supplies,
      demands: newDemands,
      costs: newCosts,
    };
  } else if (totalDemand > totalSupply) {
    // Si demanda > oferta: se agrega SOLO una fila dummy
    const newSupplies = [...problem.supplies, totalDemand - totalSupply];
    const newCosts = [...problem.costs, problem.costs[0].map(() => 0)];
    return {
      supplies: newSupplies,
      demands: problem.demands,
      costs: newCosts,
    };
  }

  // Si está balanceado, no se agrega ningún dummy
  return problem;
}

export function calculateTotalCost(solution: TransportSolution): number {
  return solution.allocations.reduce((total, row) => {
    return total + row.reduce((rowTotal, allocation) => {
      return rowTotal + (allocation.quantity * allocation.cost);
    }, 0);
  }, 0);
}

