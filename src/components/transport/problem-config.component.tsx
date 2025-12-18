import { useState } from 'react';
import { MIN_ORIGINS, MIN_DESTINATIONS, MAX_ORIGINS, MAX_DESTINATIONS } from '../../constants';
import './problem-config.component.css';

interface ProblemConfigProps {
  onConfigChange: (config: { numOrigins: number; numDestinations: number }) => void;
  numOrigins: number;
  numDestinations: number;
}

export function ProblemConfig({ onConfigChange, numOrigins, numDestinations }: ProblemConfigProps) {
  const [origins, setOrigins] = useState(numOrigins);
  const [destinations, setDestinations] = useState(numDestinations);

  const handleOriginsChange = (value: number) => {
    const newValue = Math.max(MIN_ORIGINS, Math.min(MAX_ORIGINS, value));
    setOrigins(newValue);
    onConfigChange({ numOrigins: newValue, numDestinations });
  };

  const handleDestinationsChange = (value: number) => {
    const newValue = Math.max(MIN_DESTINATIONS, Math.min(MAX_DESTINATIONS, value));
    setDestinations(newValue);
    onConfigChange({ numOrigins, numDestinations: newValue });
  };

  return (
    <div className="problem-config">
      <h2 className="problem-config__title">Configuración del Problema</h2>
      <div className="problem-config__inputs">
        <div className="problem-config__input-group">
          <label htmlFor="origins" className="problem-config__label">
            Número de Orígenes:
          </label>
          <input
            id="origins"
            type="number"
            min={MIN_ORIGINS}
            max={MAX_ORIGINS}
            value={origins}
            onChange={(e) => handleOriginsChange(Number(e.target.value))}
            className="problem-config__input"
          />
        </div>
        <div className="problem-config__input-group">
          <label htmlFor="destinations" className="problem-config__label">
            Número de Destinos:
          </label>
          <input
            id="destinations"
            type="number"
            min={MIN_DESTINATIONS}
            max={MAX_DESTINATIONS}
            value={destinations}
            onChange={(e) => handleDestinationsChange(Number(e.target.value))}
            className="problem-config__input"
          />
        </div>
      </div>
    </div>
  );
}

