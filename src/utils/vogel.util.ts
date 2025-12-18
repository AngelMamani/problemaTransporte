import type { TransportProblem, TransportSolution, Allocation, SolutionStep } from '../types';
import { balanceProblem, isBalanced } from './transport-algorithm.util';

interface VogelPenalty {
  index: number;
  isRow: boolean;
  penalty: number;
}

function computeRowPenalties(
  costs: number[][],
  activeRows: boolean[],
  activeCols: boolean[]
): VogelPenalty[] {
  const penalties: VogelPenalty[] = [];

  for (let i = 0; i < costs.length; i++) {
    if (!activeRows[i]) continue;

    const rowCosts: number[] = [];
    for (let j = 0; j < costs[i].length; j++) {
      if (!activeCols[j]) continue;
      rowCosts.push(costs[i][j]);
    }

    if (rowCosts.length < 2) continue;

    rowCosts.sort((a, b) => a - b);
    const penalty = rowCosts[1] - rowCosts[0];
    penalties.push({ index: i, isRow: true, penalty });
  }

  return penalties;
}

function computeColumnPenalties(
  costs: number[][],
  activeRows: boolean[],
  activeCols: boolean[]
): VogelPenalty[] {
  const penalties: VogelPenalty[] = [];
  const columnCount = costs[0]?.length ?? 0;

  for (let j = 0; j < columnCount; j++) {
    if (!activeCols[j]) continue;

    const colCosts: number[] = [];
    for (let i = 0; i < costs.length; i++) {
      if (!activeRows[i]) continue;
      colCosts.push(costs[i][j]);
    }

    if (colCosts.length < 2) continue;

    colCosts.sort((a, b) => a - b);
    const penalty = colCosts[1] - colCosts[0];
    penalties.push({ index: j, isRow: false, penalty });
  }

  return penalties;
}

function findMaxPenalty(penalties: VogelPenalty[]): VogelPenalty | undefined {
  if (penalties.length === 0) return undefined;
  let max = penalties[0];
  for (let k = 1; k < penalties.length; k++) {
    if (penalties[k].penalty > max.penalty) {
      max = penalties[k];
    }
  }
  return max;
}

function findCheapestCellInLine(
  costs: number[][],
  isRow: boolean,
  index: number,
  activeRows: boolean[],
  activeCols: boolean[]
): { row: number; col: number } | undefined {
  let bestRow = -1;
  let bestCol = -1;
  let bestCost = Number.POSITIVE_INFINITY;

  if (isRow) {
    if (!activeRows[index]) return undefined;
    for (let j = 0; j < costs[index].length; j++) {
      if (!activeCols[j]) continue;
      const cost = costs[index][j];
      if (cost < bestCost) {
        bestCost = cost;
        bestRow = index;
        bestCol = j;
      }
    }
  } else {
    if (!activeCols[index]) return undefined;
    for (let i = 0; i < costs.length; i++) {
      if (!activeRows[i]) continue;
      const cost = costs[i][index];
      if (cost < bestCost) {
        bestCost = cost;
        bestRow = i;
        bestCol = index;
      }
    }
  }

  if (bestRow === -1 || bestCol === -1) return undefined;
  return { row: bestRow, col: bestCol };
}

export function solveVogel(problem: TransportProblem): TransportSolution {
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
  const activeRows = remainingSupplies.map(value => value > 0);
  const activeCols = remainingDemands.map(value => value > 0);
  const steps: SolutionStep[] = [];

  let totalCost = 0;
  let stepIndex = 1;

  while (true) {
    const totalSupply = remainingSupplies.reduce((sum, val) => sum + val, 0);
    const totalDemand = remainingDemands.reduce((sum, val) => sum + val, 0);

    if (Math.abs(totalSupply) < 0.01 && Math.abs(totalDemand) < 0.01) {
      break;
    }

    // Si solo queda una fila o columna activa, asignar directamente sin penalizaciones
    const activeRowCount = activeRows.filter(r => r).length;
    const activeColCount = activeCols.filter(c => c).length;
    
    let chosenPenalty: VogelPenalty | undefined;
    let cheapestCell: { row: number; col: number } | undefined;

    // Si hay más de una fila y más de una columna, usar penalizaciones
    if (activeRowCount > 1 || activeColCount > 1) {
      const rowPenalties = computeRowPenalties(
        balancedProblem.costs,
        activeRows,
        activeCols
      );
      const colPenalties = computeColumnPenalties(
        balancedProblem.costs,
        activeRows,
        activeCols
      );
      const allPenalties = [...rowPenalties, ...colPenalties];

      chosenPenalty = findMaxPenalty(allPenalties);
      
      if (chosenPenalty) {
        cheapestCell = findCheapestCellInLine(
          balancedProblem.costs,
          chosenPenalty.isRow,
          chosenPenalty.index,
          activeRows,
          activeCols
        );
      }
    }

    // Si no hay penalización o celda, buscar directamente la celda de menor costo disponible
    if (!chosenPenalty || !cheapestCell) {
      let minCost = Number.POSITIVE_INFINITY;
      let minRow = -1;
      let minCol = -1;

      // Buscar la celda de menor costo entre todas las celdas activas con oferta y demanda > 0
      for (let i = 0; i < numOrigins; i++) {
        if (!activeRows[i]) continue;
        if (remainingSupplies[i] <= 0.01) {
          activeRows[i] = false;
          continue;
        }
        for (let j = 0; j < numDestinations; j++) {
          if (!activeCols[j]) continue;
          if (remainingDemands[j] <= 0.01) {
            activeCols[j] = false;
            continue;
          }
          if (remainingSupplies[i] > 0.01 && remainingDemands[j] > 0.01) {
            const cost = balancedProblem.costs[i][j];
            if (cost < minCost) {
              minCost = cost;
              minRow = i;
              minCol = j;
            }
          }
        }
      }

      if (minRow === -1 || minCol === -1) {
        // Si no se encuentra ninguna celda válida, el proceso debería haber terminado
        // Verificar una vez más antes de salir
        const checkSupply = remainingSupplies.reduce((sum, val) => sum + val, 0);
        const checkDemand = remainingDemands.reduce((sum, val) => sum + val, 0);
        if (Math.abs(checkSupply) < 0.01 && Math.abs(checkDemand) < 0.01) {
          break;
        }
        // Si aún hay oferta/demanda pero no se encontró celda, hay un error
        break;
      }

      cheapestCell = { row: minRow, col: minCol };
    }

    if (!cheapestCell) {
      break;
    }

    const { row, col } = cheapestCell;
    
    // Guardar estado antes de la asignación
    const suppliesBefore = [...remainingSupplies];
    const demandsBefore = [...remainingDemands];
    
    let quantity = Math.min(remainingSupplies[row], remainingDemands[col]);

    // Verificar que la cantidad sea válida antes de asignar
    const cellCost = balancedProblem.costs[row][col];
    
    // Asegurar que la cantidad sea válida y no exceda lo disponible
    quantity = Math.min(quantity, remainingSupplies[row], remainingDemands[col]);
    
    // Verificar que haya algo que asignar (con tolerancia para errores de redondeo)
    if (quantity <= 0.01) {
      // Si la cantidad es 0 o muy pequeña, desactivar y continuar
      if (remainingSupplies[row] <= 0.01) {
        activeRows[row] = false;
      }
      if (remainingDemands[col] <= 0.01) {
        activeCols[col] = false;
      }
      continue;
    }

    // Si ya hay una asignación en esta celda, sumar a la existente
    const existingAllocation = allocations[row][col];
    if (existingAllocation && existingAllocation.quantity > 0) {
      allocations[row][col] = {
        row,
        col,
        quantity: existingAllocation.quantity + quantity,
        cost: cellCost,
      };
    } else {
      allocations[row][col] = {
        row,
        col,
        quantity,
        cost: cellCost,
      };
    }

    totalCost += quantity * cellCost;

    remainingSupplies[row] -= quantity;
    remainingDemands[col] -= quantity;

    // Asegurar que no sean negativos (por posibles errores de redondeo)
    if (remainingSupplies[row] < 0.01) remainingSupplies[row] = 0;
    if (remainingDemands[col] < 0.01) remainingDemands[col] = 0;
    
    // Actualizar filas y columnas activas inmediatamente después de la asignación
    if (remainingSupplies[row] <= 0.01) {
      activeRows[row] = false;
    }
    if (remainingDemands[col] <= 0.01) {
      activeCols[col] = false;
    }

    // Guardar el estado de filas/columnas activas ANTES de la asignación para la descripción
    // (Estas variables se usarán para mostrar cómo estaban las cosas antes de hacer la asignación)
    const activeRowsBefore = remainingSupplies.map((val, idx) => idx === row ? (suppliesBefore[idx] > 0.01) : activeRows[idx]);
    const activeColsBefore = remainingDemands.map((val, idx) => idx === col ? (demandsBefore[idx] > 0.01) : activeCols[idx]);

    // Calcular penalizaciones siempre para la descripción
    const rowPenaltiesForDesc = computeRowPenalties(
      balancedProblem.costs,
      activeRowsBefore,
      activeColsBefore
    );
    const colPenaltiesForDesc = computeColumnPenalties(
      balancedProblem.costs,
      activeRowsBefore,
      activeColsBefore
    );
    const allPenaltiesForDesc = [...rowPenaltiesForDesc, ...colPenaltiesForDesc];

    // Crear descripción detallada del método Vogel
    let description = `═══════════════════════════════════════════════════════════\n`;
    description += `PASO ${stepIndex}: MÉTODO DE APROXIMACIÓN DE VOGEL\n`;
    description += `═══════════════════════════════════════════════════════════\n`;
    
    // Mostrar estado actual de ofertas y demandas (ANTES de la asignación)
    description += `\n📊 ESTADO ACTUAL (ANTES DE LA ASIGNACIÓN):\n`;
    description += `   Ofertas disponibles: [${suppliesBefore.map((s, i) => `Origen ${i + 1}: ${s.toFixed(2)}`).join(', ')}]\n`;
    description += `   Demandas disponibles: [${demandsBefore.map((d, j) => `Destino ${j + 1}: ${d.toFixed(2)}`).join(', ')}]\n`;
    
    // Mostrar matriz de costos actual (solo celdas activas)
    description += `\n📋 MATRIZ DE COSTOS (solo celdas activas):\n`;
    description += `   `;
    for (let j = 0; j < numDestinations; j++) {
      if (activeColsBefore[j]) {
        description += `     D${j + 1}`;
      }
    }
    description += `\n`;
    for (let i = 0; i < numOrigins; i++) {
      if (!activeRowsBefore[i]) continue;
      description += `   O${i + 1} `;
      for (let j = 0; j < numDestinations; j++) {
        if (activeColsBefore[j]) {
          description += `  ${balancedProblem.costs[i][j].toFixed(2)}`;
        }
      }
      description += `\n`;
    }
    
    // Mostrar penalizaciones de filas
    description += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    description += `PASO 1: CALCULAR PENALIZACIONES DE FILAS\n`;
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    const activeRowCountForDesc = activeRowsBefore.filter(r => r).length;
    if (rowPenaltiesForDesc.length === 0 && activeRowCountForDesc <= 1) {
      description += `   ℹ️ No se calculan penalizaciones de filas: Solo hay ${activeRowCountForDesc} fila(s) activa(s)\n`;
      description += `   → Se asignará directamente en la celda de menor costo\n\n`;
    } else {
      description += `   La penalización = (2do menor costo) - (menor costo)\n`;
      description += `   Representa el costo de NO elegir la opción más barata\n\n`;
      
      for (let i = 0; i < numOrigins; i++) {
        if (!activeRowsBefore[i]) {
          description += `   ❌ Fila ${i + 1}: ELIMINADA (oferta agotada)\n`;
          continue;
        }
        const rowPenalty = rowPenaltiesForDesc.find(p => p.index === i);
      if (rowPenalty) {
        // Obtener costos de la fila para mostrar el cálculo
        const rowCosts: number[] = [];
        const rowCostsWithPos: Array<{cost: number, col: number}> = [];
        for (let j = 0; j < numDestinations; j++) {
          if (activeColsBefore[j]) {
            rowCosts.push(balancedProblem.costs[i][j]);
            rowCostsWithPos.push({ cost: balancedProblem.costs[i][j], col: j });
          }
        }
        rowCosts.sort((a, b) => a - b);
        rowCostsWithPos.sort((a, b) => a.cost - b.cost);
        
        const menor = rowCosts[0];
        const segundoMenor = rowCosts.length >= 2 ? rowCosts[1] : null;
        const penalizacion = rowPenalty.penalty;
        
        description += `   ✓ Fila ${i + 1}:\n`;
        description += `     Costos en la fila: [${rowCostsWithPos.map(c => `(${i + 1},${c.col + 1})=${c.cost.toFixed(2)}`).join(', ')}]\n`;
        description += `     Ordenados: [${rowCosts.map(c => c.toFixed(2)).join(', ')}]\n`;
        if (rowCosts.length >= 2) {
          description += `     Menor costo: ${menor.toFixed(2)}, 2do menor: ${segundoMenor!.toFixed(2)}\n`;
          description += `     Penalización = ${segundoMenor!.toFixed(2)} - ${menor.toFixed(2)} = ${penalizacion.toFixed(2)}\n`;
        } else {
          description += `     Solo 1 celda disponible → Penalización = 0\n`;
        }
        description += `\n`;
      } else {
        description += `   ⚠ Fila ${i + 1}: Penalización = 0 (menos de 2 celdas disponibles)\n\n`;
      }
      }
    }
    
    // Mostrar penalizaciones de columnas
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    description += `PASO 2: CALCULAR PENALIZACIONES DE COLUMNAS\n`;
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    const activeColCountForDesc = activeColsBefore.filter(c => c).length;
    if (colPenaltiesForDesc.length === 0 && activeColCountForDesc <= 1) {
      description += `   ℹ️ No se calculan penalizaciones de columnas: Solo hay ${activeColCountForDesc} columna(s) activa(s)\n`;
      description += `   → Se asignará directamente en la celda de menor costo\n\n`;
    } else {
      description += `   La penalización = (2do menor costo) - (menor costo)\n`;
      description += `   Representa el costo de NO elegir la opción más barata\n\n`;
      
      for (let j = 0; j < numDestinations; j++) {
        if (!activeColsBefore[j]) {
          description += `   ❌ Columna ${j + 1}: ELIMINADA (demanda agotada)\n`;
          continue;
        }
        const colPenalty = colPenaltiesForDesc.find(p => p.index === j);
        if (colPenalty) {
          // Obtener costos de la columna para mostrar el cálculo
          const colCosts: number[] = [];
          const colCostsWithPos: Array<{cost: number, row: number}> = [];
          for (let i = 0; i < numOrigins; i++) {
            if (activeRowsBefore[i]) {
              colCosts.push(balancedProblem.costs[i][j]);
              colCostsWithPos.push({ cost: balancedProblem.costs[i][j], row: i });
            }
          }
          colCosts.sort((a, b) => a - b);
          colCostsWithPos.sort((a, b) => a.cost - b.cost);
          
          const menor = colCosts[0];
          const segundoMenor = colCosts.length >= 2 ? colCosts[1] : null;
          const penalizacion = colPenalty.penalty;
          
          description += `   ✓ Columna ${j + 1}:\n`;
          description += `     Costos en la columna: [${colCostsWithPos.map(c => `(${c.row + 1},${j + 1})=${c.cost.toFixed(2)}`).join(', ')}]\n`;
          description += `     Ordenados: [${colCosts.map(c => c.toFixed(2)).join(', ')}]\n`;
          if (colCosts.length >= 2) {
            description += `     Menor costo: ${menor.toFixed(2)}, 2do menor: ${segundoMenor!.toFixed(2)}\n`;
            description += `     Penalización = ${segundoMenor!.toFixed(2)} - ${menor.toFixed(2)} = ${penalizacion.toFixed(2)}\n`;
          } else {
            description += `     Solo 1 celda disponible → Penalización = 0\n`;
          }
          description += `\n`;
        } else {
          description += `   ⚠ Columna ${j + 1}: Penalización = 0 (menos de 2 celdas disponibles)\n\n`;
        }
      }
    }
    
    // Mostrar todas las penalizaciones para comparar (si existen)
    if (chosenPenalty) {
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      description += `PASO 3: RESUMEN DE TODAS LAS PENALIZACIONES\n`;
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      const allPenaltiesSorted = [...allPenaltiesForDesc].sort((a, b) => b.penalty - a.penalty);
      
      if (allPenaltiesSorted.length === 0) {
        description += `   ℹ️ No hay penalizaciones disponibles\n`;
        description += `   → Se usará método de costo mínimo directo\n`;
      } else {
        description += `   Penalizaciones ordenadas de MAYOR a MENOR:\n`;
        allPenaltiesSorted.forEach((p, idx) => {
          const isMax = idx === 0 && p.penalty === chosenPenalty.penalty && 
                       ((p.isRow && p.index === chosenPenalty.index) || (!p.isRow && p.index === chosenPenalty.index));
          const marker = isMax ? '👉 ' : '   ';
          description += `   ${marker}${p.isRow ? 'Fila' : 'Columna'} ${p.index + 1} = ${p.penalty.toFixed(2)}${isMax ? ' ⭐ (SELECCIONADA)' : ''}\n`;
        });
      }
      description += `\n`;
      
      // Mostrar la penalización máxima elegida
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      description += `PASO 4: SELECCIONAR PENALIZACIÓN MÁXIMA\n`;
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      description += `   ✅ Penalización máxima seleccionada: ${chosenPenalty.penalty.toFixed(2)}\n`;
      description += `   📍 Ubicación: ${chosenPenalty.isRow ? `FILA ${chosenPenalty.index + 1}` : `COLUMNA ${chosenPenalty.index + 1}`}\n`;
      description += `   💡 Razón: Mayor penalización significa mayor costo de oportunidad\n`;
      if (allPenaltiesForDesc.length > 1) {
        const allPenaltiesSorted = [...allPenaltiesForDesc].sort((a, b) => b.penalty - a.penalty);
        if (allPenaltiesSorted.length > 1 && allPenaltiesSorted[0].penalty === allPenaltiesSorted[1].penalty) {
          description += `   ⚠ NOTA: Hay empate con otra penalización de ${allPenaltiesSorted[1].penalty.toFixed(2)}. Se elige arbitrariamente.\n`;
        }
      }
      description += `\n`;
      
      // Mostrar la celda de menor costo en esa fila/columna
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      description += `PASO 5: ENCONTRAR CELDA DE MENOR COSTO\n`;
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      description += `   Buscamos la celda con menor costo en la ${chosenPenalty.isRow ? `FILA ${chosenPenalty.index + 1}` : `COLUMNA ${chosenPenalty.index + 1}`} seleccionada\n\n`;
      
      if (chosenPenalty.isRow) {
        const rowCosts = [];
        for (let j = 0; j < numDestinations; j++) {
          if (activeColsBefore[j]) {
            rowCosts.push({ col: j, cost: balancedProblem.costs[chosenPenalty.index][j] });
          }
        }
        rowCosts.sort((a, b) => a.cost - b.cost);
        description += `   Costos disponibles en la fila ${chosenPenalty.index + 1}:\n`;
        rowCosts.forEach((c, idx) => {
          const isSelected = c.col === col;
          const marker = isSelected ? '👉 ' : '   ';
          description += `   ${marker}Celda (${chosenPenalty.index + 1}, ${c.col + 1}): costo = ${c.cost.toFixed(2)}${isSelected ? ' ⭐ (SELECCIONADA - MENOR COSTO)' : ''}\n`;
        });
        description += `\n   ✅ Resultado: Menor costo = ${cellCost.toFixed(2)} en celda (${row + 1}, ${col + 1})\n\n`;
      } else {
        const colCosts = [];
        for (let i = 0; i < numOrigins; i++) {
          if (activeRowsBefore[i]) {
            colCosts.push({ row: i, cost: balancedProblem.costs[i][chosenPenalty.index] });
          }
        }
        colCosts.sort((a, b) => a.cost - b.cost);
        description += `   Costos disponibles en la columna ${chosenPenalty.index + 1}:\n`;
        colCosts.forEach((c, idx) => {
          const isSelected = c.row === row;
          const marker = isSelected ? '👉 ' : '   ';
          description += `   ${marker}Celda (${c.row + 1}, ${chosenPenalty.index + 1}): costo = ${c.cost.toFixed(2)}${isSelected ? ' ⭐ (SELECCIONADA - MENOR COSTO)' : ''}\n`;
        });
        description += `\n   ✅ Resultado: Menor costo = ${cellCost.toFixed(2)} en celda (${row + 1}, ${col + 1})\n\n`;
      }
    } else {
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      description += `PASO 3-5: SELECCIÓN DIRECTA (SIN PENALIZACIONES)\n`;
      description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      description += `   ℹ️ No se pueden calcular penalizaciones (menos de 2 filas/columnas activas)\n`;
      description += `   → Se busca directamente la celda de MENOR COSTO disponible\n`;
      description += `   ✅ Celda seleccionada: (${row + 1}, ${col + 1}) con costo ${cellCost.toFixed(2)}\n\n`;
    }
    
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    description += `PASO 6: REALIZAR ASIGNACIÓN\n`;
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    description += `   📍 Celda seleccionada: (${row + 1}, ${col + 1})\n`;
    description += `   💰 Costo unitario: ${cellCost.toFixed(2)}\n`;
    description += `   📦 Oferta disponible en origen ${row + 1}: ${suppliesBefore[row].toFixed(2)}\n`;
    description += `   📥 Demanda disponible en destino ${col + 1}: ${demandsBefore[col].toFixed(2)}\n`;
    description += `   📊 Cálculo: min(${suppliesBefore[row].toFixed(2)}, ${demandsBefore[col].toFixed(2)}) = ${quantity.toFixed(2)} unidades\n`;
    description += `   💵 Costo de esta asignación: ${quantity.toFixed(2)} × ${cellCost.toFixed(2)} = ${(quantity * cellCost).toFixed(2)}\n`;
    description += `   📈 Costo acumulado hasta ahora: ${totalCost.toFixed(2)}\n\n`;
    
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    description += `PASO 7: ACTUALIZAR ESTADO DEL PROBLEMA\n`;
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    if (remainingSupplies[row] === 0 && remainingDemands[col] === 0) {
      description += `   ✅ La oferta del origen ${row + 1} se agotó completamente\n`;
      description += `      → Fila ${row + 1} será ELIMINADA en la siguiente iteración\n`;
      description += `   ✅ La demanda del destino ${col + 1} se agotó completamente\n`;
      description += `      → Columna ${col + 1} será ELIMINADA en la siguiente iteración\n`;
    } else if (remainingSupplies[row] === 0) {
      description += `   ✅ La oferta del origen ${row + 1} se agotó completamente\n`;
      description += `      → Fila ${row + 1} será ELIMINADA en la siguiente iteración\n`;
      description += `   ⚠ La demanda del destino ${col + 1} aún tiene: ${remainingDemands[col].toFixed(2)} unidades restantes\n`;
    } else if (remainingDemands[col] === 0) {
      description += `   ⚠ La oferta del origen ${row + 1} aún tiene: ${remainingSupplies[row].toFixed(2)} unidades restantes\n`;
      description += `   ✅ La demanda del destino ${col + 1} se agotó completamente\n`;
      description += `      → Columna ${col + 1} será ELIMINADA en la siguiente iteración\n`;
    } else {
      description += `   ⚠ La oferta del origen ${row + 1} aún tiene: ${remainingSupplies[row].toFixed(2)} unidades restantes\n`;
      description += `   ⚠ La demanda del destino ${col + 1} aún tiene: ${remainingDemands[col].toFixed(2)} unidades restantes\n`;
    }
    
    description += `\n   📊 Estado actualizado:\n`;
    description += `      Ofertas: [${remainingSupplies.map((s, i) => `O${i + 1}: ${s.toFixed(2)}`).join(', ')}]\n`;
    description += `      Demandas: [${remainingDemands.map((d, j) => `D${j + 1}: ${d.toFixed(2)}`).join(', ')}]\n`;
    
    // Verificar si el proceso continúa o termina
    const totalSupplyRemaining = remainingSupplies.reduce((sum, val) => sum + val, 0);
    const totalDemandRemaining = remainingDemands.reduce((sum, val) => sum + val, 0);
    
    description += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    description += `PASO 8: VERIFICAR CONDICIÓN DE TERMINACIÓN\n`;
    description += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    
    if (totalSupplyRemaining === 0 && totalDemandRemaining === 0) {
      description += `   ✅ PROCESO COMPLETADO\n`;
      description += `   ✓ Todas las ofertas han sido distribuidas (Total: 0.00)\n`;
      description += `   ✓ Todas las demandas han sido satisfechas (Total: 0.00)\n`;
      description += `   ✓ El problema de transporte ha sido resuelto completamente\n`;
      description += `   📊 Costo total final: ${totalCost.toFixed(2)}\n`;
    } else {
      description += `   ⏳ EL PROCESO CONTINÚA\n`;
      description += `   Oferta total restante: ${totalSupplyRemaining.toFixed(2)}\n`;
      description += `   Demanda total restante: ${totalDemandRemaining.toFixed(2)}\n`;
      description += `   → Se repetirá el proceso desde el Paso 1 con el nuevo estado\n`;
      description += `   → Se calcularán nuevas penalizaciones para las celdas restantes\n`;
    }
    
    description += `\n═══════════════════════════════════════════════════════════\n`;

    steps.push({
      stepIndex: stepIndex++,
      description,
      chosenCell: {
        row,
        col,
        quantity,
        cost: cellCost,
      },
      remainingSupplies: [...remainingSupplies],
      remainingDemands: [...remainingDemands],
      additionalInfo: {
        method: 'Vogel',
        chosenPenalty: chosenPenalty ? {
          index: chosenPenalty.index,
          isRow: chosenPenalty.isRow,
          penalty: chosenPenalty.penalty,
        } : undefined,
        rowPenalties: rowPenaltiesForDesc.map(p => ({ index: p.index, penalty: p.penalty })),
        colPenalties: colPenaltiesForDesc.map(p => ({ index: p.index, penalty: p.penalty })),
        suppliesBefore,
        demandsBefore,
      },
    });

    // Las actualizaciones de activeRows y activeCols ya se hicieron arriba
  }

  return {
    allocations,
    totalCost,
    isBalanced: isBalanced(problem),
    steps,
  };
}

