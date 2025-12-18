export interface TransportProblem {
  supplies: number[];
  demands: number[];
  costs: number[][];
}

export interface TransportSolution {
  allocations: Allocation[][];
  totalCost: number;
  isBalanced: boolean;
  steps?: SolutionStep[];
}

export interface Allocation {
  row: number;
  col: number;
  quantity: number;
  cost: number;
}

export interface SolutionStep {
  stepIndex: number;
  description: string;
  chosenCell?: {
    row: number;
    col: number;
    quantity: number;
    cost: number;
  };
  remainingSupplies: number[];
  remainingDemands: number[];
  additionalInfo?: {
    [key: string]: unknown;
  };
}

export interface ProblemInput {
  numOrigins: number;
  numDestinations: number;
  supplies: number[];
  demands: number[];
  costs: number[][];
}

export interface AssignmentProblem {
  costs: number[][];
}

export interface AssignmentAssignment {
  row: number;
  col: number;
  cost: number;
}

export interface AssignmentSolution {
  assignments: AssignmentAssignment[];
  totalCost: number;
  steps?: SolutionStep[];
}

