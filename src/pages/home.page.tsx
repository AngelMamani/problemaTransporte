import { useState, useCallback } from 'react';
import { Container } from '../components/layout/container.layout';
import { ProblemConfig } from '../components/transport/problem-config.component';
import { SuppliesInput } from '../components/transport/supplies-input.component';
import { DemandsInput } from '../components/transport/demands-input.component';
import { CostsMatrix } from '../components/transport/costs-matrix.component';
import { SolveButton } from '../components/transport/solve-button.component';
import { ResultsDisplay } from '../components/transport/results-display.component';
import { solveNorthwestCorner } from '../utils';
import type { TransportProblem, TransportSolution } from '../types';
import { DEFAULT_ORIGINS, DEFAULT_DESTINATIONS } from '../constants';
import './home.page.css';

export function HomePage() {
  const [numOrigins, setNumOrigins] = useState(DEFAULT_ORIGINS);
  const [numDestinations, setNumDestinations] = useState(DEFAULT_DESTINATIONS);
  const [supplies, setSupplies] = useState<number[]>(Array(DEFAULT_ORIGINS).fill(0));
  const [demands, setDemands] = useState<number[]>(Array(DEFAULT_DESTINATIONS).fill(0));
  const [costs, setCosts] = useState<number[][]>(
    Array(DEFAULT_ORIGINS).fill(null).map(() => Array(DEFAULT_DESTINATIONS).fill(0))
  );
  const [solution, setSolution] = useState<TransportSolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setCosts(newCosts);
    setSolution(null);
  }, []);

  const handleSolve = useCallback(() => {
    setIsLoading(true);
    
    setTimeout(() => {
      try {
        const problem: TransportProblem = {
          supplies,
          demands,
          costs,
        };

        const result = solveNorthwestCorner(problem);
        setSolution(result);
      } catch (error) {
        console.error('Error al resolver el problema:', error);
      } finally {
        setIsLoading(false);
      }
    }, 100);
  }, [supplies, demands, costs]);

  const canSolve = supplies.some(s => s > 0) && demands.some(d => d > 0);

  return (
    <Container>
      <div className="home-page">
        <header className="home-page__header">
          <h1>Algoritmo de Transporte</h1>
          <p className="home-page__subtitle">
            Resuelve problemas de transporte utilizando el método de la Esquina Noroeste
          </p>
        </header>
        <main className="home-page__content">
          <ProblemConfig
            numOrigins={numOrigins}
            numDestinations={numDestinations}
            onConfigChange={handleConfigChange}
          />
          
          <SuppliesInput
            supplies={supplies}
            numOrigins={numOrigins}
            onSuppliesChange={handleSuppliesChange}
          />
          
          <DemandsInput
            demands={demands}
            numDestinations={numDestinations}
            onDemandsChange={handleDemandsChange}
          />
          
          <CostsMatrix
            costs={costs}
            numOrigins={numOrigins}
            numDestinations={numDestinations}
            onCostsChange={handleCostsChange}
          />
          
          <SolveButton
            onClick={handleSolve}
            disabled={!canSolve}
            isLoading={isLoading}
          />
          
          <ResultsDisplay
            solution={solution}
            numOrigins={numOrigins}
            numDestinations={numDestinations}
          />
        </main>
      </div>
    </Container>
  );
}
