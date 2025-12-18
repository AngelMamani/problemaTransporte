import { Container } from '../components/layout/container.layout';
import { useNavigate } from 'react-router-dom';
import './info.page.css';

export function InfoPage() {
  const navigate = useNavigate();

  return (
    <Container>
      <div className="info-page">
        <header className="info-page__header">
          <h1>Problema de Transporte</h1>
          <p className="info-page__subtitle">
            Optimización de distribución mediante programación lineal
          </p>
        </header>

        <main className="info-page__content">
          <section className="info-section">
            <h2 className="info-section__title">¿Qué es el Problema de Transporte?</h2>
            <p className="info-section__text">
              El problema de transporte es un caso especial de programación lineal que busca determinar 
              la forma más económica de transportar productos desde varios orígenes (fuentes) hasta 
              varios destinos, minimizando el costo total de transporte.
            </p>
            <p className="info-section__text">
              Este problema es fundamental en logística, distribución y planificación de recursos, 
              permitiendo optimizar la asignación de productos considerando las capacidades de 
              oferta, las demandas requeridas y los costos asociados a cada ruta.
            </p>
          </section>

          <section className="info-section">
            <h2 className="info-section__title">Formulación del Problema</h2>
            <p className="info-section__text">
              Para formular el problema en términos de programación lineal, se deben identificar:
            </p>
            <div className="info-section__list">
              <div className="info-item">
                <h3 className="info-item__title">Actividades del Problema</h3>
                <ul className="info-item__list">
                  <li>Transportar unidades desde cada origen hasta cada destino</li>
                  <li>Cada ruta origen-destino representa una actividad de decisión</li>
                  <li>La cantidad transportada en cada ruta es la variable de decisión</li>
                </ul>
              </div>
              <div className="info-item">
                <h3 className="info-item__title">Requerimientos del Problema</h3>
                <ul className="info-item__list">
                  <li><strong>Ofertas (Supplies):</strong> Cantidad disponible en cada origen</li>
                  <li><strong>Demandas (Demands):</strong> Cantidad requerida en cada destino</li>
                  <li><strong>Costos:</strong> Costo unitario de transporte por cada ruta</li>
                  <li><strong>Restricciones:</strong> No exceder ofertas ni dejar demandas insatisfechas</li>
                </ul>
              </div>
            </div>
            <div className="info-section__formulation">
              <h3 className="info-section__subtitle">Modelo Matemático</h3>
              <div className="formulation-box">
                <p className="formulation-box__text">
                  <strong>Función Objetivo:</strong> Minimizar Z = Σ(i,j) c<sub>ij</sub> · x<sub>ij</sub>
                </p>
                <p className="formulation-box__text">
                  <strong>Sujeto a:</strong>
                </p>
                <ul className="formulation-box__list">
                  <li>Σ(j) x<sub>ij</sub> = a<sub>i</sub> (Restricción de oferta para origen i)</li>
                  <li>Σ(i) x<sub>ij</sub> = b<sub>j</sub> (Restricción de demanda para destino j)</li>
                  <li>x<sub>ij</sub> ≥ 0 (No negatividad)</li>
                </ul>
                <p className="formulation-box__notation">
                  Donde: c<sub>ij</sub> = costo unitario, x<sub>ij</sub> = cantidad transportada, 
                  a<sub>i</sub> = oferta del origen i, b<sub>j</sub> = demanda del destino j
                </p>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="info-section__title">Solución Básica Factible</h2>
            <p className="info-section__text">
              Después de formular el problema, el siguiente paso es obtener una solución básica factible. 
              Existen tres métodos principales para encontrar esta solución inicial:
            </p>
            
            <div className="methods-grid">
              <div className="method-card">
                <h3 className="method-card__title">1. Regla de la Esquina Noroeste</h3>
                <p className="method-card__description">
                  Método simple que comienza asignando unidades desde la esquina superior izquierda 
                  (noroeste) de la matriz de costos, moviéndose hacia la derecha y luego hacia abajo.
                </p>
                <div className="method-card__steps">
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Iniciar en la celda (1,1)</li>
                    <li>Asignar el mínimo entre oferta y demanda</li>
                    <li>Avanzar a la siguiente celda disponible</li>
                    <li>Repetir hasta satisfacer todas las ofertas y demandas</li>
                  </ol>
                </div>
                <div className="method-card__pros-cons">
                  <div className="pros">
                    <strong>Ventajas:</strong> Simple y rápido
                  </div>
                  <div className="cons">
                    <strong>Desventajas:</strong> No considera los costos, puede no ser óptima
                  </div>
                </div>
              </div>

              <div className="method-card">
                <h3 className="method-card__title">2. Método de la Ruta Preferente</h3>
                <p className="method-card__description">
                  También conocido como método del costo mínimo, selecciona primero las rutas con 
                  menor costo unitario para realizar las asignaciones.
                </p>
                <div className="method-card__steps">
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Identificar la celda con menor costo</li>
                    <li>Asignar el máximo posible en esa celda</li>
                    <li>Eliminar fila o columna si se agota oferta o demanda</li>
                    <li>Repetir con las celdas restantes</li>
                  </ol>
                </div>
                <div className="method-card__pros-cons">
                  <div className="pros">
                    <strong>Ventajas:</strong> Considera costos, generalmente mejor que esquina noroeste
                  </div>
                  <div className="cons">
                    <strong>Desventajas:</strong> Puede requerir más iteraciones
                  </div>
                </div>
              </div>

              <div className="method-card">
                <h3 className="method-card__title">3. Método de Aproximación de Vogel</h3>
                <p className="method-card__description">
                  Método más sofisticado que considera las diferencias entre los dos menores costos 
                  en cada fila y columna para hacer asignaciones más inteligentes.
                </p>
                <div className="method-card__steps">
                  <strong>Pasos:</strong>
                  <ol>
                    <li>Calcular penalizaciones (diferencias de costos) por fila y columna</li>
                    <li>Seleccionar fila o columna con mayor penalización</li>
                    <li>Asignar en la celda de menor costo de esa fila/columna</li>
                    <li>Actualizar y repetir hasta completar</li>
                  </ol>
                </div>
                <div className="method-card__pros-cons">
                  <div className="pros">
                    <strong>Ventajas:</strong> Generalmente produce mejores soluciones iniciales
                  </div>
                  <div className="cons">
                    <strong>Desventajas:</strong> Más complejo computacionalmente
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="info-section">
            <h2 className="info-section__title">Aplicaciones Prácticas</h2>
            <div className="applications-grid">
              <div className="application-item">
                <strong>Logística y Distribución</strong>
                <p>Optimización de rutas de distribución desde almacenes a puntos de venta</p>
              </div>
              <div className="application-item">
                <strong>Planificación de Producción</strong>
                <p>Asignación de recursos de producción entre diferentes plantas y mercados</p>
              </div>
              <div className="application-item">
                <strong>Gestión de Inventarios</strong>
                <p>Minimización de costos de transporte entre centros de almacenamiento</p>
              </div>
              <div className="application-item">
                <strong>Asignación de Recursos</strong>
                <p>Distribución eficiente de recursos limitados entre múltiples destinos</p>
              </div>
            </div>
          </section>

          <div className="info-page__actions">
            <button
              onClick={() => navigate('/calculator')}
              className="info-page__button"
            >
              Ir a la Calculadora
            </button>
            <button
              onClick={() => navigate('/calculator?method=assignment')}
              className="info-page__button info-page__button--secondary"
            >
              Método de Asignación
            </button>
          </div>
        </main>
      </div>
    </Container>
  );
}

