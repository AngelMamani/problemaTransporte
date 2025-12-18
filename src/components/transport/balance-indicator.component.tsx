import './balance-indicator.component.css';

interface BalanceIndicatorProps {
  totalSupply: number;
  totalDemand: number;
  isBalanced: boolean;
  hasDummyRow: boolean;
  hasDummyCol: boolean;
}

export function BalanceIndicator({ 
  totalSupply, 
  totalDemand, 
  isBalanced, 
  hasDummyRow, 
  hasDummyCol 
}: BalanceIndicatorProps) {
  const difference = Math.abs(totalSupply - totalDemand);

  return (
    <div className={`balance-indicator ${isBalanced ? 'balance-indicator--balanced' : 'balance-indicator--unbalanced'}`}>
      <div className="balance-indicator__header">
        <h3 className="balance-indicator__title">Balance del Problema</h3>
        {isBalanced ? (
          <span className="balance-indicator__status balance-indicator__status--balanced">
            Balanceado
          </span>
        ) : (
          <span className="balance-indicator__status balance-indicator__status--unbalanced">
            Desbalanceado
          </span>
        )}
      </div>
      <div className="balance-indicator__values">
        <div className="balance-indicator__value">
          <span className="balance-indicator__label">Total Ofertas:</span>
          <span className="balance-indicator__number">{totalSupply.toFixed(2)}</span>
        </div>
        <div className="balance-indicator__value">
          <span className="balance-indicator__label">Total Demandas:</span>
          <span className="balance-indicator__number">{totalDemand.toFixed(2)}</span>
        </div>
        {!isBalanced && (
          <div className="balance-indicator__difference">
            <span className="balance-indicator__label">Diferencia:</span>
            <span className="balance-indicator__number">{difference.toFixed(2)}</span>
          </div>
        )}
      </div>
      {(hasDummyRow || hasDummyCol) && (
        <div className="balance-indicator__dummy-info">
          {hasDummyRow && (
            <div className="balance-indicator__dummy-item">
              Se agregó una fila dummy con costos 0 para balancear el problema
            </div>
          )}
          {hasDummyCol && (
            <div className="balance-indicator__dummy-item">
              Se agregó una columna dummy con costos 0 para balancear el problema
            </div>
          )}
        </div>
      )}
    </div>
  );
}

