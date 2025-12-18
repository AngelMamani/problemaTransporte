# Algoritmo de Transporte

Aplicación web para resolver problemas de transporte mediante algoritmos de optimización y programación lineal.

## Estructura del Proyecto

```
algoritmo_transporte/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── layout/          # Componentes de layout
│   │   ├── navigation/      # Componentes de navegación
│   │   └── transport/       # Componentes específicos del transporte
│   ├── pages/               # Páginas principales
│   │   ├── info.page.tsx    # Página de información y teoría
│   │   └── calculator.page.tsx  # Página de calculadora
│   ├── types/               # Definiciones de tipos TypeScript
│   ├── utils/               # Funciones utilitarias y algoritmos
│   ├── hooks/               # Custom hooks de React
│   ├── styles/              # Estilos globales
│   │   ├── variables.css    # Variables CSS
│   │   ├── reset.css        # Reset CSS
│   │   └── index.css        # Estilos principales
│   ├── constants/           # Constantes de la aplicación
│   ├── App.tsx              # Componente principal con router
│   └── main.tsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── index.html               # HTML principal
└── package.json             # Dependencias del proyecto
```

## Tecnologías

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **React Router DOM** - Navegación entre páginas
- **Vite** - Build tool y dev server
- **ESLint** - Linter para código

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run lint` - Ejecuta el linter
- `npm run preview` - Previsualiza la build de producción

## Desarrollo

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

3. Abre tu navegador en `http://localhost:5173`

## Características

### Página de Información
- Explicación del problema de transporte
- Formulación matemática del problema en programación lineal
- Descripción de los tres métodos de solución:
  - Regla de la Esquina Noroeste
  - Método de la Ruta Preferente
  - Método de Aproximación de Vogel
- Aplicaciones prácticas del problema

### Calculadora
- Configuración de orígenes y destinos
- Entrada de ofertas (supplies) y demandas
- Matriz de costos editable
- Resolución mediante método de Esquina Noroeste
- Visualización de resultados con asignaciones y costo total

## Funcionalidades Implementadas

- ✅ Navegación entre páginas
- ✅ Formulación del problema en programación lineal
- ✅ Método de Esquina Noroeste
- ✅ Balanceo automático del problema
- ✅ Interfaz intuitiva y responsiva
- ✅ Validación de datos en tiempo real

## Próximas Mejoras

- Implementación del Método de la Ruta Preferente
- Implementación del Método de Aproximación de Vogel
- Selección de método de solución
- Optimización de la solución inicial (método MODI)
- Exportación de resultados
