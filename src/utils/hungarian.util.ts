import type { AssignmentProblem, AssignmentSolution, AssignmentAssignment, SolutionStep } from '../types';

function cloneMatrix(matrix: number[][]): number[][] {
  return matrix.map(row => [...row]);
}

export function solveHungarianAssignment(problem: AssignmentProblem): AssignmentSolution {
  const n = problem.costs.length;
  if (n === 0) {
    return { assignments: [], totalCost: 0, steps: [] };
  }

  const costs = cloneMatrix(problem.costs);
  const steps: SolutionStep[] = [];
  let stepIndex = 1;

  // Paso 1: restar mínimo de cada fila
  const rowMins: number[] = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...costs[i]);
    rowMins[i] = rowMin;
    for (let j = 0; j < n; j++) {
      costs[i][j] -= rowMin;
    }
  }

  // Paso 2: restar mínimo de cada columna
  const colMins: number[] = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    let colMin = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      if (costs[i][j] < colMin) {
        colMin = costs[i][j];
      }
    }
    colMins[j] = colMin;
    for (let i = 0; i < n; i++) {
      costs[i][j] -= colMin;
    }
  }

  steps.push({
    stepIndex: stepIndex++,
    description:
      'PASO 1-2: REDUCCIÓN DE LA MATRIZ\n' +
      '\n' +
      '1) Para cada fila se resta su costo mínimo: esto garantiza que en cada fila exista al menos un cero.\n' +
      '2) Luego, para cada columna se resta su costo mínimo: ahora cada columna también tiene al menos un cero.\n' +
      'El resultado es la matriz reducida sobre la cual se trabajará para buscar las asignaciones óptimas.',
    remainingSupplies: [],
    remainingDemands: [],
    additionalInfo: {
      originalCosts: cloneMatrix(problem.costs),
      reducedCosts: cloneMatrix(costs),
      rowMins,
      colMins,
    },
  });

  const assignedRow: number[] = Array(n).fill(-1);
  const assignedCol: number[] = Array(n).fill(-1);

  const tryAssign = (row: number, seenCols: boolean[]): boolean => {
    for (let col = 0; col < n; col++) {
      if (costs[row][col] === 0 && !seenCols[col]) {
        seenCols[col] = true;
        if (assignedCol[col] === -1 || tryAssign(assignedCol[col], seenCols)) {
          assignedRow[row] = col;
          assignedCol[col] = row;
          return true;
        }
      }
    }
    return false;
  };

  while (true) {
    // Intentar asignación de ceros actuales
    assignedRow.fill(-1);
    assignedCol.fill(-1);

    let matches = 0;
    for (let i = 0; i < n; i++) {
      const seenCols = Array(n).fill(false);
      if (tryAssign(i, seenCols)) {
        matches++;
      }
    }

    if (matches === n) {
      steps.push({
        stepIndex: stepIndex++,
        description:
          'PASO INTERMEDIO: ASIGNACIÓN CON CEROS ACTUALES\n' +
          '\n' +
          'Con los ceros disponibles en la matriz reducida es posible asignar cada trabajo a exactamente una persona\n' +
          'sin necesidad de seguir ajustando la matriz. A partir de estas posiciones de cero se obtiene una asignación válida.',
        remainingSupplies: [],
        remainingDemands: [],
        additionalInfo: {
          currentAssignments: assignedRow.map((col, row) => ({ row, col })),
          currentCosts: cloneMatrix(costs),
        },
      });
      break;
    }

    // Paso de mejora: cubrir ceros con el mínimo número de líneas
    const coveredRows = Array(n).fill(false);
    const coveredCols = Array(n).fill(false);

    // Filas no asignadas inicialmente
    for (let i = 0; i < n; i++) {
      if (assignedRow[i] === -1) {
        coveredRows[i] = true;
      }
    }

    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < n; i++) {
        if (coveredRows[i]) {
          for (let j = 0; j < n; j++) {
            if (!coveredCols[j] && costs[i][j] === 0) {
              coveredCols[j] = true;
              changed = true;
              const rowAssigned = assignedCol[j];
              if (rowAssigned !== -1 && !coveredRows[rowAssigned]) {
                coveredRows[rowAssigned] = true;
              }
            }
          }
        }
      }
    }

    // Encontrar el mínimo valor no cubierto
    let minUncovered = Number.POSITIVE_INFINITY;
    for (let i = 0; i < n; i++) {
      if (!coveredRows[i]) continue;
      for (let j = 0; j < n; j++) {
        if (!coveredCols[j] && costs[i][j] < minUncovered) {
          minUncovered = costs[i][j];
        }
      }
    }

    if (!Number.isFinite(minUncovered) || minUncovered <= 0) {
      break;
    }

    // Ajustar matriz: restar al área no cubierta y sumar en intersecciones
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (coveredRows[i] && !coveredCols[j]) {
          costs[i][j] -= minUncovered;
        } else if (!coveredRows[i] && coveredCols[j]) {
          costs[i][j] += minUncovered;
        }
      }
    }

    steps.push({
      stepIndex: stepIndex++,
      description:
        'PASO DE AJUSTE: COBERTURA DE CEROS Y ACTUALIZACIÓN DE LA MATRIZ\n' +
        '\n' +
        '1) Se cubren todos los ceros de la matriz con el mínimo número posible de líneas horizontales y verticales.\n' +
        '2) Se identifica el menor valor que queda sin cubrir por ninguna línea (mínimo no cubierto).\n' +
        '3) A ese valor se le resta en todas las celdas NO cubiertas y se suma en las celdas que están en la intersección de dos líneas.\n' +
        'Este proceso genera nuevos ceros y mejora las condiciones para encontrar una asignación completa en el siguiente intento.',
      remainingSupplies: [],
      remainingDemands: [],
      additionalInfo: {
        coveredRows,
        coveredCols,
        minUncovered,
        adjustedCosts: cloneMatrix(costs),
      },
    });
  }

  const assignments: AssignmentAssignment[] = [];
  let totalCost = 0;

  for (let i = 0; i < n; i++) {
    const col = assignedRow[i];
    if (col >= 0) {
      const cost = problem.costs[i][col];
      assignments.push({ row: i, col, cost });
      totalCost += cost;
    }
  }

  const sumExpression = assignments
    .map((a) => a.cost.toFixed(2))
    .join(' + ');

  steps.push({
    stepIndex: stepIndex++,
    description:
      'PASO FINAL: CÁLCULO DEL COSTO TOTAL MÍNIMO\n' +
      '\n' +
      'A partir de la matriz original se toma, para cada trabajo, la persona asignada por el algoritmo.\n' +
      'El costo total mínimo se obtiene sumando los costos individuales de cada par trabajo–persona seleccionado:\n' +
      `Z = ${sumExpression} = ${totalCost.toFixed(2)}`,
    remainingSupplies: [],
    remainingDemands: [],
    additionalInfo: {
      assignments,
      totalCost,
    },
  });

  return {
    assignments,
    totalCost,
    steps,
  };
}


