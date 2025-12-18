import { useState, useCallback, useMemo, useEffect } from 'react';
import { Container } from '../components/layout/container.layout';
import { BackButton } from '../components/navigation/back-button.component';
import { ProblemConfig } from '../components/transport/problem-config.component';
import { SuppliesInput } from '../components/transport/supplies-input.component';
import { DemandsInput } from '../components/transport/demands-input.component';
import { CostsMatrix } from '../components/transport/costs-matrix.component';
import { BalanceIndicator } from '../components/transport/balance-indicator.component';
import { MethodSelector, type SolutionMethod } from '../components/transport/method-selector.component';
import { SolveButton } from '../components/transport/solve-button.component';
import { ResultsDisplay } from '../components/transport/results-display.component';
import { solveNorthwestCorner, solveMinimumCost, solveVogel } from '../utils';
import type { TransportProblem, TransportSolution } from '../types';
import { DEFAULT_ORIGINS, DEFAULT_DESTINATIONS } from '../constants';
import './calculator.page.css';

export function CalculatorPage() {
  const [numOrigins, setNumOrigins] = useState(DEFAULT_ORIGINS);
  const [numDestinations, setNumDestinations] = useState(DEFAULT_DESTINATIONS);
  const [supplies, setSupplies] = useState<number[]>(Array(DEFAULT_ORIGINS).fill(0));
  const [demands, setDemands] = useState<number[]>(Array(DEFAULT_DESTINATIONS).fill(0));
  const [costs, setCosts] = useState<number[][]>(
    Array(DEFAULT_ORIGINS).fill(null).map(() => Array(DEFAULT_DESTINATIONS).fill(0))
  );
  const [solution, setSolution] = useState<TransportSolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<SolutionMethod>('northwest');

  const totalSupply = useMemo(() => supplies.reduce((sum, val) => sum + val, 0), [supplies]);
  const totalDemand = useMemo(() => demands.reduce((sum, val) => sum + val, 0), [demands]);
  const isBalanced = useMemo(() => Math.abs(totalSupply - totalDemand) < 0.01, [totalSupply, totalDemand]);

  const { balancedSupplies, balancedDemands, balancedCosts, hasDummyRow, hasDummyCol, dummyValue } = useMemo(() => {
    const difference = totalSupply - totalDemand;
    const absDifference = Math.abs(difference);
    
    // Si está balanceado, no se agrega ningún dummy
    if (absDifference < 0.01) {
      return {
        balancedSupplies: supplies,
        balancedDemands: demands,
        balancedCosts: costs,
        hasDummyRow: false,
        hasDummyCol: false,
        dummyValue: 0,
      };
    }

    // IMPORTANTE: Solo se agrega UN dummy (fila O columna), nunca ambos
    // Si oferta > demanda: se agrega SOLO una columna dummy
    if (difference > 0) {
      const newDemands = [...demands, difference];
      const newCosts = costs.length > 0 && costs[0]?.length > 0
        ? costs.map(row => [...row, 0])
        : Array(numOrigins).fill(null).map(() => Array(numDestinations + 1).fill(0));
      return {
        balancedSupplies: supplies,
        balancedDemands: newDemands,
        balancedCosts: newCosts,
        hasDummyRow: false, // Solo columna dummy
        hasDummyCol: true,
        dummyValue: difference,
      };
    } else {
      // Si demanda > oferta: se agrega SOLO una fila dummy
      const newSupplies = [...supplies, absDifference];
      const newCosts = costs.length > 0 && costs[0]?.length > 0
        ? [...costs, Array(costs[0].length).fill(0)]
        : Array(numOrigins + 1).fill(null).map(() => Array(numDestinations).fill(0));
      return {
        balancedSupplies: newSupplies,
        balancedDemands: demands,
        balancedCosts: newCosts,
        hasDummyRow: true, // Solo fila dummy
        hasDummyCol: false,
        dummyValue: absDifference,
      };
    }
  }, [supplies, demands, costs, totalSupply, totalDemand, numOrigins, numDestinations]);

  const displayNumOrigins = hasDummyRow ? numOrigins + 1 : numOrigins;
  const displayNumDestinations = hasDummyCol ? numDestinations + 1 : numDestinations;

  const handleConfigChange = useCallback((config: { numOrigins: number; numDestinations: number }) => {
    setNumOrigins(config.numOrigins);
    setNumDestinations(config.numDestinations);
    
    const newSupplies = Array(config.numOrigins).fill(0);
    const newDemands = Array(config.numDestinations).fill(0);
    const newCosts = Array(config.numOrigins)
      .fill(null)
      .map(() => Array(config.numDestinations).fill(0));

    setSupplies(newSupplies);
    setDemands(newDemands);
    setCosts(newCosts);
    setSolution(null);
  }, []);

  const handleSuppliesChange = useCallback((newSupplies: number[]) => {
    setSupplies(newSupplies);
    setSolution(null);
  }, []);

  const handleDemandsChange = useCallback((newDemands: number[]) => {
    setDemands(newDemands);
    setSolution(null);
  }, []);

  const handleCostsChange = useCallback((newCosts: number[][]) => {
    let costsToSet = [...newCosts];
    
    if (hasDummyRow) {
      const lastRow = costsToSet.length - 1;
      costsToSet = costsToSet.map((row, i) => 
        i === lastRow ? row.map(() => 0) : row
      );
    }
    
    if (hasDummyCol) {
      const lastCol = costsToSet[0]?.length - 1;
      costsToSet = costsToSet.map(row => 
        row.map((cost, j) => j === lastCol ? 0 : cost)
      );
    }

    const originalCosts = hasDummyRow 
      ? costsToSet.slice(0, -1)
      : costsToSet;
    const finalOriginalCosts = hasDummyCol
      ? originalCosts.map(row => row.slice(0, -1))
      : originalCosts;

    setCosts(finalOriginalCosts);
    setSolution(null);
  }, [hasDummyRow, hasDummyCol]);

  const handleSolve = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        const problem: TransportProblem = {
          supplies: balancedSupplies,
          demands: balancedDemands,
          costs: balancedCosts,
        };

        let result: TransportSolution;
        switch (selectedMethod) {
          case 'northwest':
            result = solveNorthwestCorner(problem);
            break;
          case 'minimum-cost':
            result = solveMinimumCost(problem);
            break;
          case 'vogel':
            result = solveVogel(problem);
            break;
          default:
            result = solveNorthwestCorner(problem);
        }

        setSolution(result);
      } catch (error) {
        console.error('Error al resolver el problema:', error);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  }, [balancedSupplies, balancedDemands, balancedCosts, selectedMethod]);

  const canSolve = supplies.some(s => s > 0) && demands.some(d => d > 0);
  const showMatrix = numOrigins > 0 && numDestinations > 0 && (supplies.some(s => s > 0) || demands.some(d => d > 0));

  return (
    <Container>
      <div className="calculator-page">
        <BackButton />
        <header className="calculator-page__header">
          <h1>Calculadora de Transporte</h1>
          <p className="calculator-page__subtitle">
            Resuelve problemas de transporte utilizando diferentes métodos de optimización
          </p>
        </header>
        <main className="calculator-page__content">
          <ProblemConfig
            numOrigins={numOrigins}
            numDestinations={numDestinations}
            onConfigChange={handleConfigChange}
          />
          
          <SuppliesInput
            supplies={supplies}
            numOrigins={numOrigins}
            onSuppliesChange={handleSuppliesChange}
            hasDummyRow={hasDummyRow}
            dummySupply={hasDummyRow ? dummyValue : 0}
          />
          
          <DemandsInput
            demands={demands}
            numDestinations={numDestinations}
            onDemandsChange={handleDemandsChange}
            hasDummyCol={hasDummyCol}
            dummyDemand={hasDummyCol ? dummyValue : 0}
          />

          <BalanceIndicator
            totalSupply={totalSupply}
            totalDemand={totalDemand}
            isBalanced={isBalanced}
            hasDummyRow={hasDummyRow}
            hasDummyCol={hasDummyCol}
          />
          
          <MethodSelector
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
          />
          
          <CostsMatrix
            costs={balancedCosts}
            numOrigins={displayNumOrigins}
            numDestinations={displayNumDestinations}
            onCostsChange={handleCostsChange}
            showMatrix={showMatrix}
            hasDummyRow={hasDummyRow}
            hasDummyCol={hasDummyCol}
            supplies={balancedSupplies}
            demands={balancedDemands}
          />
          
          <SolveButton
            onClick={handleSolve}
            disabled={!canSolve}
            isLoading={isLoading}
          />
          
          <ResultsDisplay
            solution={solution}
            numOrigins={displayNumOrigins}
            numDestinations={displayNumDestinations}
            supplies={balancedSupplies}
            demands={balancedDemands}
          />
        </main>
      </div>
    </Container>
  );
}
