import type { TransportProblem, TransportSolution, Allocation, SolutionStep } from '../types';
import { balanceProblem, isBalanced } from './transport-algorithm.util';

export function solveMinimumCost(problem: TransportProblem): TransportSolution {
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
  const activeRows = Array(numOrigins).fill(true);
  const activeCols = Array(numDestinations).fill(true);
  const steps: SolutionStep[] = [];

  let totalCost = 0;
  let remainingCells = numOrigins * numDestinations;
  let stepIndex = 1;

  while (remainingCells > 0) {
    let minCost = Number.POSITIVE_INFINITY;
    let minRow = -1;
    let minCol = -1;
    const availableCells: Array<{ row: number; col: number; cost: number }> = [];

    // Encontrar la celda con el menor costo entre las celdas activas
    for (let row = 0; row < numOrigins; row++) {
      if (!activeRows[row]) continue;

      for (let col = 0; col < numDestinations; col++) {
        if (!activeCols[col]) continue;

        const cost = balancedProblem.costs[row][col];
        availableCells.push({ row, col, cost });
        
        if (cost < minCost) {
          minCost = cost;
          minRow = row;
          minCol = col;
        }
      }
    }

    // Si no se encontró ninguna celda válida, terminar
    if (minRow === -1 || minCol === -1) break;

    // Guardar estado antes de la asignación
    const suppliesBefore = [...remainingSupplies];
    const demandsBefore = [...remainingDemands];

    // Asignar el máximo posible en la celda con menor costo
    const supply = remainingSupplies[minRow];
    const demand = remainingDemands[minCol];
    const allocation = Math.min(supply, demand);

    if (allocation > 0) {
      allocations[minRow][minCol] = {
        row: minRow,
        col: minCol,
        quantity: allocation,
        cost: minCost,
      };

      totalCost += allocation * minCost;

      remainingSupplies[minRow] -= allocation;
      remainingDemands[minCol] -= allocation;

      // Crear descripción detallada
      const availableCellsDesc = availableCells
        .map(c => `(${c.row + 1},${c.col + 1})=${c.cost.toFixed(2)}`)
        .join(', ');
      
      const otherMinCosts = availableCells
        .filter(c => c.cost === minCost && (c.row !== minRow || c.col !== minCol))
        .map(c => `(${c.row + 1},${c.col + 1})`)
        .join(', ');
      
      let description = `Paso ${stepIndex}: MÉTODO DE COSTO MÍNIMO\n`;
      description += `\n1. Celdas disponibles: ${availableCellsDesc}\n`;
      description += `2. Costo mínimo encontrado: ${minCost.toFixed(2)} en celda (${minRow + 1}, ${minCol + 1})\n`;
      if (otherMinCosts) {
        description += `   (También hay costo ${minCost.toFixed(2)} en: ${otherMinCosts})\n`;
      }
      description += `3. Oferta disponible en origen ${minRow + 1}: ${supply.toFixed(2)}\n`;
      description += `4. Demanda disponible en destino ${minCol + 1}: ${demand.toFixed(2)}\n`;
      description += `5. Asignación: min(${supply.toFixed(2)}, ${demand.toFixed(2)}) = ${allocation.toFixed(2)} unidades\n`;
      description += `6. Costo de esta asignación: ${allocation.toFixed(2)} × ${minCost.toFixed(2)} = ${(allocation * minCost).toFixed(2)}\n`;
      description += `7. Costo acumulado: ${totalCost.toFixed(2)}\n`;
      
      if (remainingSupplies[minRow] === 0) {
        description += `8. La oferta del origen ${minRow + 1} se agotó. Fila ${minRow + 1} eliminada.\n`;
      }
      if (remainingDemands[minCol] === 0) {
        description += `8. La demanda del destino ${minCol + 1} se agotó. Columna ${minCol + 1} eliminada.\n`;
      }

      steps.push({
        stepIndex: stepIndex++,
        description,
        chosenCell: {
          row: minRow,
          col: minCol,
          quantity: allocation,
          cost: minCost,
        },
        remainingSupplies: [...remainingSupplies],
        remainingDemands: [...remainingDemands],
        additionalInfo: {
          method: 'Costo Mínimo',
          selectedCost: minCost,
          availableCells: availableCells.map(c => ({
            row: c.row,
            col: c.col,
            cost: c.cost,
          })),
          suppliesBefore,
          demandsBefore,
        },
      });

      // Desactivar fila o columna si se agotó
      if (remainingSupplies[minRow] === 0) {
        activeRows[minRow] = false;
      }
      if (remainingDemands[minCol] === 0) {
        activeCols[minCol] = false;
      }
    } else {
      // Si la asignación es 0, verificar cuál se agotó y desactivarlo
      if (remainingSupplies[minRow] === 0) {
        activeRows[minRow] = false;
      }
      if (remainingDemands[minCol] === 0) {
        activeCols[minCol] = false;
      }
    }

    remainingCells--;
  }

  return {
    allocations,
    totalCost,
    isBalanced: isBalanced(problem),
    steps,
  };
}

