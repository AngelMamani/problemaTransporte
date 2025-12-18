import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InfoPage } from './pages/info.page';
import { CalculatorPage } from './pages/calculator.page';
import { AssignmentPage } from './pages/assignment.page';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InfoPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/assignment" element={<AssignmentPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
